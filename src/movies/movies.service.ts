import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Movie } from '@prisma/client'
import { Cache } from 'cache-manager'
import { REDIS_KEY_MOVIE, REDIS_KEY_MOVIES } from '../common/constants'
import { AxiosService } from '../axios/axios.service'
import { TMDB_URL_PROPERTY_PATH, TMDB_KEY_PROPERTY_PATH } from '../config/constants'
import { MoviesRepository } from './movies.repository'
import { CreateMovieDto } from './dtos'
import { TmdbMovie } from './interfaces'

@Injectable()
export class MoviesService {
  constructor(
    private readonly moviesRepository: MoviesRepository,
    private readonly configService: ConfigService,
    private readonly axiosService: AxiosService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) { }

  private readonly TMDB_API_URL = this.configService.get(TMDB_URL_PROPERTY_PATH, { infer: true })
  private readonly TMDB_API_KEY = this.configService.get(TMDB_KEY_PROPERTY_PATH, { infer: true })

  async getMovies(): Promise<Movie[]> {
    const redisKey: string = REDIS_KEY_MOVIES

    const cachedMovies: string = await this.cacheManager.get(redisKey)

    if (cachedMovies) {
      const parsedMovies: Movie[] = JSON.parse(cachedMovies)
      return parsedMovies
    }

    const movies = await this.moviesRepository.getMovies({})
    if (!movies.length) throw new NotFoundException()
    const redisValue = JSON.stringify(movies)
    await this.cacheManager.set(redisKey, redisValue)
    return movies
  }

  async getMovieByUkrainianTitle(title_ua: string): Promise<Movie> {
    const redisKey: string = `${REDIS_KEY_MOVIE}?title_ua=${title_ua}`

    const cachedMovie: string = await this.cacheManager.get(redisKey)

    if (cachedMovie) {
      const parsedMovie: Movie = JSON.parse(cachedMovie)
      return parsedMovie
    }

    const movie = await this.moviesRepository.getMovie({ where: { title_ua } })
    if (!movie) return null

    const redisValue = JSON.stringify(movie)
    const weekTtl = 1000 * 60 * 60 * 24 * 7
    await this.cacheManager.set(redisKey, redisValue, weekTtl)
    return movie
  }

  async createMovie(title_ua: string): Promise<Movie> {
    const url: string = `${this.TMDB_API_URL}/search/movie?query=${title_ua}&api_key=${this.TMDB_API_KEY}`
    const { data } = await this.axiosService.get(url)

    if (!data.results.length) return null

    // Getting the newest movie from the results list
    const tmdbMovie: TmdbMovie = data.results.reduce((accumulator, current) => {
      const accumulatorDate = new Date(accumulator.release_date)
      const currentDate = new Date(current.release_date)
      return accumulatorDate > currentDate ? accumulator : current
    })

    if (!tmdbMovie?.id || !tmdbMovie?.overview || !tmdbMovie?.backdrop_path || !tmdbMovie?.poster_path) return null

    const movie = await this.moviesRepository.getMovie({ where: { OR: [{ id: tmdbMovie.id }, { title: title_ua }] } })
    if (movie) return movie

    const dto: CreateMovieDto = {
      id: tmdbMovie.id,
      title: tmdbMovie.title,
      title_ua,
      overview: tmdbMovie.overview,
      backdrop_path: tmdbMovie.backdrop_path,
      poster_path: tmdbMovie.poster_path,
      rating: tmdbMovie.vote_average
    }

    return this.moviesRepository.createMovie({ data: dto })
  }
}
