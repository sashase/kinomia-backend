import { Injectable } from '@nestjs/common'
import { HTMLElement } from 'node-html-parser'
import { DataSourceShowtimesService } from '../../../interfaces/data-sources'
import { ShowtimesService } from '../../../showtimes/showtimes.service'
import { CreateShowtimeDto } from '../../../showtimes/dtos'
import { ScraperService } from '../../scraper.service'
import { combineDateWithTime, getOrderLink, filterShowtimes } from '../utils'

@Injectable()
export class MultiplexShowtimesService implements DataSourceShowtimesService {
  constructor(private readonly scraperService: ScraperService, private readonly showtimesService: ShowtimesService) { }

  private readonly networkName: string = 'multiplex'

  async formatAndCreateShowtime(showtime: HTMLElement, dayTimestamp: string, cinemaId: number): Promise<void> {
    const id: string = showtime.attributes['data-id']
    const tmdbId: number = 10

    const orderLink: string = getOrderLink(id)

    const internalShowtimeId: number = parseInt(id.split('-')[1])
    const title: string = showtime.attributes['data-name']
    const time: string = showtime.querySelector('p.time').text
    const format: string = showtime.querySelector('p.tag').text
    const price: number =
      format.split(' ')[0] === 'LUX'
        ? parseInt(showtime.attributes['data-high']) / 100
        : parseInt(showtime.attributes['data-low']) / 100

    const combinedDateWithTime: Date = combineDateWithTime(dayTimestamp, time)

    const processedShowtime: CreateShowtimeDto = {
      internal_showtime_id: internalShowtimeId,
      title: title,
      date: combinedDateWithTime,
      tmdb_id: tmdbId,
      format: format,
      order_link: orderLink,
      price,
    }

    await this.showtimesService.validateAndCreateShowtime(processedShowtime, cinemaId)
  }

  async processMovie(movie: HTMLElement, cinemaId: number): Promise<void> {
    const schedule = movie.querySelectorAll('.mpp_schedule')

    await Promise.all(schedule.map(async (day) => {
      const dayTimestamp: string = day.attributes['data-selector']
      const allShowtimes: HTMLElement[] = day.querySelectorAll('div.ns')

      const filteredShowtimes: HTMLElement[] = filterShowtimes(allShowtimes)

      await Promise.all(filteredShowtimes.map(async (showtime) => {
        await this.formatAndCreateShowtime(showtime, dayTimestamp, cinemaId)
      }))
    }))
  }

  async updateShowtimes(url: string, cinemaId: number, cinemaInternalId: string): Promise<void> {
    const root = await this.scraperService.getRoot(url, this.networkName, cinemaInternalId)

    const movies: HTMLElement[] = root.querySelectorAll('.mp_poster')

    await Promise.all(movies.map(async (movie) => {
      await this.processMovie(movie, cinemaId)
    }))
  }
}