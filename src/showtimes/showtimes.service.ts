import { Injectable } from '@nestjs/common'
import { CinemasRepository } from '../cinemas/cinemas.repository'
import { ShowtimesRepository } from './showtimes.repository'
import { CreateShowtimeDto } from './dtos'

@Injectable()
export class ShowtimesService {
  constructor(private readonly showtimesRepository: ShowtimesRepository, private readonly cinemasRepository: CinemasRepository) { }

  async validateAndCreateShowtime(showtime: CreateShowtimeDto, cinemaId: number): Promise<void> {
    const { internal_showtime_id, tmdb_id, ...rest } = showtime

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
          connect: { id: tmdb_id }
        },
        ...rest
      }
    })
  }
}
