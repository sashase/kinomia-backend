import { Injectable } from '@nestjs/common'
import { Movie } from '@prisma/client'
import { HTMLElement } from 'node-html-parser'
import { DataSourceShowtimesService } from '../../../interfaces/data-sources'
import { ShowtimesService } from '../../../showtimes/showtimes.service'
import { CreateShowtimeDto } from '../../../showtimes/dtos'
import { MoviesService } from '../../../movies/movies.service'
import { ScraperService } from '../../scraper.service'
import { combineDateWithTime, combineFormatElements } from '../utils'

@Injectable()
export class OskarShowtimesService implements DataSourceShowtimesService {
  constructor(
    private readonly scraperService: ScraperService,
    private readonly showtimesService: ShowtimesService,
    private readonly moviesService: MoviesService
  ) { }

  private readonly networkName: string = 'oskar'

  async processMovie(movieElement: HTMLElement, cinemaId: number, date: string): Promise<void> {
    let movie: Movie

    const title: string = movieElement
      .querySelector('div.filter-result__name')
      .querySelector('a').text

    movie = await this.moviesService.getMovieByUkrainianTitle(title)

    if (!movie) {
      const createdMovie: Movie = await this.moviesService.createMovie(title)
      if (!createdMovie) return
      movie = createdMovie
    }

    const showtimesWrapper: HTMLElement = movieElement.querySelector('div.filter-result__time-wrap')

    const times: HTMLElement[] = showtimesWrapper.querySelectorAll('a.filter-result__time')
    const formats: HTMLElement[] = showtimesWrapper.querySelectorAll(
      'span.filter-result__time-bullet'
    )

    for (let i = 0; i < times.length; i++) {
      const time = times[i].querySelector('span.time')?.text
      if (!time) continue

      const showtimeLink = times[i].getAttribute('href')

      const internalShowtimeId: number = parseInt(showtimeLink.split('&')[1].split('=')[1])
      const combinedDate = combineDateWithTime(date, time)
      const combinedFormats: string = combineFormatElements(formats[i])
      const orderLink = `https://oskar.kyiv.ua${showtimeLink}`

      const processedShowtime: CreateShowtimeDto = {
        internal_showtime_id: internalShowtimeId,
        date: combinedDate,
        format: combinedFormats,
        order_link: orderLink,
        movie
      }

      await this.showtimesService.validateAndCreateShowtime(processedShowtime, cinemaId)
    }
  }

  async updateShowtimes(url: string, cinemaId: number, cinemaInternalId: string, date: string): Promise<void> {
    const root = await this.scraperService.getRoot(url, this.networkName, cinemaInternalId, date)

    const movies = root.querySelectorAll('div.filter-result__item')

    for (let i = 0; i < movies.length; i++) {
      await this.processMovie(movies[i], cinemaId, date)
    }
  }
}