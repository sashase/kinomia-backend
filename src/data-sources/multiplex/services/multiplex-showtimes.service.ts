import { Injectable } from '@nestjs/common'
import { Movie } from '@prisma/client'
import { HTMLElement } from 'node-html-parser'
import { DataSourceShowtimesService } from '../../../interfaces/data-sources'
import { ShowtimesService } from '../../../showtimes/showtimes.service'
import { CreateShowtimeDto } from '../../../showtimes/dtos'
import { MoviesService } from '../../../movies/movies.service'
import { ScraperService } from '../../scraper.service'
import { combineDateWithTime, getOrderLink, filterShowtimes } from '../utils'

@Injectable()
export class MultiplexShowtimesService implements DataSourceShowtimesService {
  constructor(
    private readonly scraperService: ScraperService,
    private readonly showtimesService: ShowtimesService,
    private readonly moviesService: MoviesService
  ) { }

  private readonly networkName: string = 'multiplex'

  async formatAndCreateShowtime(showtime: HTMLElement, dayTimestamp: string, cinemaId: number): Promise<void> {
    let movie: Movie

    const title: string = showtime.attributes['data-name']

    movie = await this.moviesService.getMovieByTitle(title)

    if (!movie) {
      const createdMovie: Movie = await this.moviesService.createMovie(title)
      if (!createdMovie) return
      movie = createdMovie
    } else {
      movie = movie
    }

    const id: string = showtime.attributes['data-id']

    const orderLink: string = getOrderLink(id)
    const internalShowtimeId: number = parseInt(id.split('-')[1])
    const time: string = showtime.querySelector('p.time').text
    const format: string = showtime.querySelector('p.tag').text
    const price: number =
      format.split(' ')[0] === 'LUX'
        ? parseInt(showtime.attributes['data-high']) / 100
        : parseInt(showtime.attributes['data-low']) / 100

    const combinedDateWithTime: Date = combineDateWithTime(dayTimestamp, time)

    const processedShowtime: CreateShowtimeDto = {
      internal_showtime_id: internalShowtimeId,
      date: combinedDateWithTime,
      format: format,
      order_link: orderLink,
      price,
      movie
    }

    await this.showtimesService.validateAndCreateShowtime(processedShowtime, cinemaId)
  }

  async processMovie(movie: HTMLElement, cinemaId: number): Promise<void> {
    const schedule = movie.querySelectorAll('.mpp_schedule')

    for (let i = 0; i < schedule.length; i++) {
      const dayTimestamp: string = schedule[i].attributes['data-selector']
      const allShowtimes: HTMLElement[] = schedule[i].querySelectorAll('div.ns')

      const filteredShowtimes: HTMLElement[] = filterShowtimes(allShowtimes)

      for (let j = 0; j < filteredShowtimes.length; j++) {
        await this.formatAndCreateShowtime(filteredShowtimes[j], dayTimestamp, cinemaId)
      }
    }
  }

  async updateShowtimes(url: string, cinemaId: number, cinemaInternalId: string): Promise<void> {
    const root = await this.scraperService.getRoot(url, this.networkName, cinemaInternalId)

    const movies: HTMLElement[] = root.querySelectorAll('.mp_poster')

    for (let i = 0; i < movies.length; i++) {
      await this.processMovie(movies[i], cinemaId)
    }
  }
}