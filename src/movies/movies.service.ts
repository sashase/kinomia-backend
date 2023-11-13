import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Movie } from '@prisma/client'
import { Cache } from 'cache-manager'
import { AxiosService } from '../axios/axios.service'
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

  private readonly TMDB_API_URL = this.configService.get('tmdbApi.url', { infer: true })
  private readonly TMDB_API_KEY = this.configService.get('tmdbApi.key', { infer: true })

  async getMovies(): Promise<Movie[]> {
    const redisKey: string = `movies`

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
    const redisKey: string = `movie?title_ua=${title_ua}`

    const cachedMovie: string = await this.cacheManager.get(redisKey)

    if (cachedMovie) {
      const parsedMovie: Movie = JSON.parse(cachedMovie)
      return parsedMovie
    }

    const movie = await this.moviesRepository.getMovie({ where: { title_ua } })
    if (!movie) return

    const redisValue = JSON.stringify(movie)
    const weekTtl = 1000 * 60 * 60 * 24 * 7
    await this.cacheManager.set(redisKey, redisValue, weekTtl)
    return movie
  }

  async createMovie(title_ua: string): Promise<Movie> {
    const url: string = `${this.TMDB_API_URL}/search/movie?query=${title_ua}&api_key=${this.TMDB_API_KEY}`
    const { data } = await this.axiosService.get(url)

    const tmdbData: TmdbMovie = data.results.reduce((prev, current) => {
      return prev.release_date > current.release_date ? prev : current
    })

    if (!tmdbData?.id) return

    const movie = await this.moviesRepository.getMovie({ where: { OR: [{ id: tmdbData.id }, { title: title_ua }] } })
    if (movie) return movie

    if (!tmdbData.overview || !tmdbData.backdrop_path || !tmdbData.poster_path) return

    const dto: CreateMovieDto = {
      id: tmdbData.id,
      title: tmdbData.title,
      title_ua,
      overview: tmdbData.overview,
      backdrop_path: tmdbData.backdrop_path,
      poster_path: tmdbData.poster_path,
      rating: tmdbData.vote_average
    }

    return this.moviesRepository.createMovie({ data: dto })
  }
}
