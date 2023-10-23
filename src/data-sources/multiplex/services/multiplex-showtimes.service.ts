import { ShowtimesRepository } from '../../../showtimes/showtimes.repository'
import { Injectable } from '@nestjs/common'
import { ScraperService } from '../../scraper.service'
import { CinemasRepository } from '../../../cinemas/cinemas.repository'
import { combineDateWithTime, getOrderLink } from '../utils'
import { HTMLElement } from 'node-html-parser'

interface ShowtimeDto {
  movie: string
  date: Date
  format?: string
  price?: number
  order_link?: string
  imdb_link?: string
}

@Injectable()
export class MultiplexShowtimesService {
  constructor(private readonly scraperService: ScraperService, private readonly cinemasRepository: CinemasRepository, private readonly showtimesRepository: ShowtimesRepository) { }

  async processMovie(movie: HTMLElement, cinemaId: number): Promise<void> {
    const schedule = movie.querySelectorAll('.mpp_schedule')

    schedule.forEach((day) => {
      const dayTimestamp = day.attributes['data-selector']

      /*
             Filtering showtimes, 
             we do not want to have showtimes that are sold out or showtimes with the 'buy_closest' class, 
             those are duplicates and made only for UI/UX
      */
      const showtimes = day.querySelectorAll('div.ns').filter((showtime) => {
        const classes = showtime.getAttribute('class').split(' ')
        for (let i = 0; i < classes.length; i++) {
          if (classes[i] === 'buy_closest' || classes[i] === 'locked')
            return false
          else return true
        }
      })

      showtimes.forEach(async (showtime) => {
        const id = showtime.attributes['data-id']
        if (!id) return

        const orderLink = getOrderLink(id)

        const movieName = showtime.attributes['data-name']
        const time = showtime.querySelector('p.time').text
        const format = showtime.querySelector('p.tag').text
        const price =
          format.split(' ')[0] === 'LUX'
            ? parseInt(showtime.attributes['data-high']) / 100
            : parseInt(showtime.attributes['data-low']) / 100

        const combinedDateWithTime = combineDateWithTime(dayTimestamp, time)

        const processedShowtime: ShowtimeDto = {
          movie: movieName,
          date: combinedDateWithTime,
          format: format,
          order_link: orderLink,
          price,
        }

        await this.addShowtimeToDb(processedShowtime, cinemaId)
      })
    })
  }

  async addShowtimeToDb(showtime: ShowtimeDto, cinemaId: number): Promise<void> {
    const cinemaExists = await this.cinemasRepository.getCinema({ where: { id: cinemaId } })
    if (!cinemaExists) return

    this.showtimesRepository.createShowtime({
      data: {
        cinema: {
          connect: { id: cinemaId }
        },
        ...showtime
      }
    })
  }

  async updateShowtimes(url: string, cinemaId: number): Promise<void> {
    const root = await this.scraperService.getRoot(url, cinemaId)

    const movies: HTMLElement[] = root.querySelectorAll('div.mp_poster')

    movies.map(async (movie) => {
      await this.processMovie(movie, cinemaId)
    })
  }
}