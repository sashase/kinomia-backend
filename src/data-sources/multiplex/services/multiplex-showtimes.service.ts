import { Injectable } from '@nestjs/common'
import { HTMLElement } from 'node-html-parser'
import { DataSourceShowtimesService } from '../../../interfaces/data-sources'
import { ShowtimesService } from '../../../showtimes/showtimes.service'
import { CreateShowtimeDto } from '../../../showtimes/dtos'
import { ScraperService } from '../../scraper.service'
import { combineDateWithTime, getOrderLink } from '../utils'

@Injectable()
export class MultiplexShowtimesService implements DataSourceShowtimesService {
  constructor(private readonly scraperService: ScraperService, private readonly showtimesService: ShowtimesService) { }

  async formatAndCreateShowtime(showtime: HTMLElement, dayTimestamp: string, cinemaId: number): Promise<void> {
    const id = showtime.attributes['data-id']
    if (!id) return

    const orderLink = getOrderLink(id)

    const internalShowtimeId = parseInt(id.split('-')[1])
    const movieName = showtime.attributes['data-name']
    const time = showtime.querySelector('p.time').text
    const format = showtime.querySelector('p.tag').text
    const price =
      format.split(' ')[0] === 'LUX'
        ? parseInt(showtime.attributes['data-high']) / 100
        : parseInt(showtime.attributes['data-low']) / 100

    const combinedDateWithTime = combineDateWithTime(dayTimestamp, time)

    const processedShowtime: CreateShowtimeDto = {
      internal_showtime_id: internalShowtimeId,
      movie: movieName,
      date: combinedDateWithTime,
      format: format,
      order_link: orderLink,
      price,
    }

    await this.showtimesService.validateAndCreateShowtime(processedShowtime, cinemaId)
  }

  async processMovie(movie: HTMLElement, cinemaId: number): Promise<void> {
    const schedule = movie.querySelectorAll('.mpp_schedule')

    await Promise.all(schedule.map(async (day) => {
      const dayTimestamp = day.attributes['data-selector']
      const allShowtimes = day.querySelectorAll('div.ns')

      /*
             Filtering showtimes, 
             we do not want to have showtimes that are sold out or showtimes with the 'buy_closest' class, 
             those are duplicates and made only for UI/UX
      */
      const filteredShowtimes = Array.from(allShowtimes).filter((showtime) => {
        const classes = showtime.getAttribute('class').split(' ')
        return !classes.includes('buy_closest') && !classes.includes('locked')
      })

      await Promise.all(filteredShowtimes.map(async (showtime) => {
        await this.formatAndCreateShowtime(showtime, dayTimestamp, cinemaId)
      }))
    }))
  }

  async updateShowtimes(url: string, cinemaId: number, cinemaInternalId: number): Promise<void> {
    const root = await this.scraperService.getRoot(url, cinemaInternalId)

    const movies: HTMLElement[] = root.querySelectorAll('div.mp_poster')

    await Promise.all(movies.map(async (movie) => {
      await this.processMovie(movie, cinemaId)
    }))
  }
}