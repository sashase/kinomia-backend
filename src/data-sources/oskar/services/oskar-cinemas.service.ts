import { Injectable } from '@nestjs/common'
import { DataSourceCinemasService } from '../../../interfaces/data-sources'
import { CinemasService } from '../../../cinemas/cinemas.service'
import { CreateCinemaDto } from '../../../cinemas/dtos'
import { cinemas as cinemasList } from '../data/cinemas'
import { CinemaData } from '../interfaces'

@Injectable()
export class OskarCinemasService implements DataSourceCinemasService {
  constructor(private readonly cinemasService: CinemasService) { }

  private readonly cinemas: CinemaData[] = cinemasList

  async processCinema(cinema: CinemaData, networkId: number): Promise<void> {
    const processedCinema: CreateCinemaDto = {
      internal_cinema_id: cinema.internalId,
      name: cinema.name,
      city: cinema.city,
      address: cinema.address
    }

    await this.cinemasService.validateAndCreateCinema(processedCinema, networkId)
  }

  async updateCinemas(networkId: number): Promise<void> {
    await Promise.all(this.cinemas.map(async (cinema) => {
      await this.processCinema(cinema, networkId)
    }))
  }
}