import { Injectable } from '@nestjs/common'
import { HTMLElement } from 'node-html-parser'
import { DataSourceShowtimesService } from '../../../interfaces/data-sources'
import { ShowtimesService } from '../../../showtimes/showtimes.service'
import { CreateShowtimeDto } from '../../../showtimes/dtos'
import { ScraperService } from '../../scraper.service'
import { combineDateWithTime, combineFormatElements } from '../utils'

@Injectable()
export class OskarShowtimesService implements DataSourceShowtimesService {
  constructor(private readonly scraperService: ScraperService, private readonly showtimesService: ShowtimesService) { }

  private readonly networkName: string = 'oskar'

  async processMovie(movie: HTMLElement, cinemaId: number, date: string): Promise<void> {
    const movieName: string = movie
      .querySelector('div.filter-result__name')
      .querySelector('a').text

    const showtimesWrapper: HTMLElement = movie.querySelector('div.filter-result__time-wrap')

    const times: HTMLElement[] = showtimesWrapper.querySelectorAll('a.filter-result__time')
    const formats: HTMLElement[] = showtimesWrapper.querySelectorAll(
      'span.filter-result__time-bullet'
    )

    for (let i = 0; i < times.length; i++) {
      const time = times[i].text
      const combinedDate = combineDateWithTime(date, time)

      const combinedFormats: string = combineFormatElements(formats[i])

      const orderLink = `https://oskar.kyiv.ua${times[i].getAttribute('href')}`

      const processedShowtime: CreateShowtimeDto = {
        movie: movieName,
        date: combinedDate,
        format: combinedFormats,
        order_link: orderLink
      }

      await this.showtimesService.validateAndCreateShowtime(processedShowtime, cinemaId)
    }
  }

  async updateShowtimes(url: string, cinemaId: number, cinemaInternalId: string, date: string): Promise<void> {
    const root = await this.scraperService.getRoot(url, this.networkName, cinemaInternalId, date)

    const movies = root.querySelectorAll('div.filter-result__item')

    await Promise.all(movies.map(async (movie) => {
      await this.processMovie(movie, cinemaId, date)
    }))
  }
}