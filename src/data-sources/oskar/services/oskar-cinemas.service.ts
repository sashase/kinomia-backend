import { BadGatewayException, Injectable } from '@nestjs/common'
import { CinemasService } from '../../../cinemas/cinemas.service'
import { CreateCinemaDto } from '../../../cinemas/dtos'
import { DataSourceCinemasService } from '../../interfaces'
import { City } from '@prisma/client'
import { CitiesRepository } from '../../../cities/cities.repository'
import { OSKAR_CINEMAS_BAD_GATEWAY } from '../../constants'
import { cinemas as cinemasList } from '../data/cinemas'
import { CinemaData } from '../interfaces'

@Injectable()
export class OskarCinemasService implements DataSourceCinemasService {
  constructor(private readonly cinemasService: CinemasService, private readonly citiesRepository: CitiesRepository) { }

  private readonly cinemas: CinemaData[] = cinemasList

  async processCinema(cinema: CinemaData, networkId: number): Promise<void> {
    const cityName: string = cinema.city
    if (!cityName) throw new BadGatewayException(OSKAR_CINEMAS_BAD_GATEWAY)

    let city: City = await this.citiesRepository.getCity({ where: { name: cityName } })

    if (!city) city = await this.citiesRepository.createCity({ data: { name: cityName } })

    const processedCinema: CreateCinemaDto = {
      networkId,
      cityId: city.id,
      internal_cinema_id: cinema.internalId,
      name: cinema.name,
      address: cinema.address
    }

    await this.cinemasService.validateAndCreateCinema(processedCinema)
  }

  async updateCinemas(networkId: number): Promise<void> {
    for (let i = 0; i < this.cinemas.length; i++) {
      await this.processCinema(this.cinemas[i], networkId)
    }
  }
}