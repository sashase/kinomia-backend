import { Injectable } from '@nestjs/common'
import { HTMLElement } from 'node-html-parser'
import { combineDateWithTime, getOrderLink } from '../utils'
import { ScraperService } from '../../scraper.service'
import { CinemasRepository } from '../../../cinemas/cinemas.repository'
import { ShowtimesRepository } from '../../../showtimes/showtimes.repository'

interface ShowtimeDto {
  internal_showtime_id: number
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

    await Promise.all(schedule.map(async (day) => {
      const dayTimestamp = day.attributes['data-selector']

      /*
             Filtering showtimes, 
             we do not want to have showtimes that are sold out or showtimes with the 'buy_closest' class, 
             those are duplicates and made only for UI/UX
      */
      const showtimes = Array.from(day.querySelectorAll('div.ns')).filter((showtime) => {
        const classes = showtime.getAttribute('class').split(' ')
        return !classes.includes('buy_closest') && !classes.includes('locked')
      })

      await Promise.all(showtimes.map(async (showtime) => {
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

        const processedShowtime: ShowtimeDto = {
          internal_showtime_id: internalShowtimeId,
          movie: movieName,
          date: combinedDateWithTime,
          format: format,
          order_link: orderLink,
          price,
        }

        await this.addShowtimeToDb(processedShowtime, cinemaId)
      }))
    }))
  }

  async addShowtimeToDb(showtime: ShowtimeDto, cinemaId: number): Promise<void> {
    const { internal_showtime_id } = showtime

    const cinemaExists = await this.cinemasRepository.getCinema({ where: { id: cinemaId } })
    if (!cinemaExists) return

    const showtimeExists = await this.showtimesRepository.getShowtime({ where: { internal_showtime_id, cinema_id: cinemaId } })
    if (showtimeExists) return

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

    await Promise.all(movies.map(async (movie) => {
      await this.processMovie(movie, cinemaId)
    }))
  }
}