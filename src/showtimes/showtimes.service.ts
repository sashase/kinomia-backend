import { Injectable } from '@nestjs/common'
import { CinemasRepository } from '../cinemas/cinemas.repository'
import { ShowtimesRepository } from './showtimes.repository'
import { CreateShowtimeDto } from './dtos'

@Injectable()
export class ShowtimesService {
  constructor(private readonly showtimesRepository: ShowtimesRepository, private readonly cinemasRepository: CinemasRepository) { }

  async validateAndCreateShowtime(showtime: CreateShowtimeDto, cinemaId: number): Promise<void> {
    const { movie, internal_showtime_id, ...rest } = showtime
    const { id, title } = movie

    const cinemaExists = await this.cinemasRepository.getCinema({ where: { id: cinemaId } })
    if (!cinemaExists) return

    const showtimeExists = await this.showtimesRepository.getShowtime({ where: { internal_showtime_id, cinema_id: cinemaId } })
    if (showtimeExists) return

    await this.showtimesRepository.createShowtime({
      data: {
        cinema: {
          connect: { id: cinemaId }
        },
        movie: {
          connect: { id_title: { id, title } }
        },
        internal_showtime_id,
        ...rest
      }
    })
  }
}
