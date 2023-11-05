import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Movie } from '@prisma/client'
import { AxiosService } from '../axios/axios.service'
import { MoviesRepository } from './movies.repository'
import { CreateMovieDto } from './dtos'

@Injectable()
export class MoviesService {
  constructor(
    private readonly moviesRepository: MoviesRepository,
    private readonly configService: ConfigService,
    private readonly axiosService: AxiosService
  ) { }

  private readonly TMDB_API_URL = this.configService.get('tmdbApi.url', { infer: true })
  private readonly TMDB_API_KEY = this.configService.get('tmdbApi.key', { infer: true })

  async getMovieByTitle(title: string): Promise<Movie> {
    return this.moviesRepository.getMovie({ where: { title } })
  }

  async createMovie(title: string): Promise<Movie> {
    const url = `${this.TMDB_API_URL}/search/movie?query=${title}&api_key=${this.TMDB_API_KEY}`
    const { data } = await this.axiosService.get(url)
    const tmdbData = data.results[0]

    if (!tmdbData?.id) return

    const movie = await this.moviesRepository.getMovie({ where: { OR: [{ id: tmdbData.id }, { title }] } })
    if (movie) return movie

    const dto: CreateMovieDto = {
      id: tmdbData.id,
      title
    }

    return this.moviesRepository.createMovie({ data: dto })
  }
}
