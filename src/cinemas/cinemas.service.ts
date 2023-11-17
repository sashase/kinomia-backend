import { Injectable } from '@nestjs/common'
import { NetworksRepository } from '../networks/networks.repository'
import { CinemasRepository } from './cinemas.repository'
import { CreateCinemaDto } from './dtos'

@Injectable()
export class CinemasService {
  constructor(private readonly cinemasRepository: CinemasRepository, private readonly networksRepository: NetworksRepository) { }

  async validateAndCreateCinema(cinema: CreateCinemaDto): Promise<void> {
    const { networkId, cityId, ...rest } = cinema

    const networkExists = await this.networksRepository.getNetwork({ where: { id: networkId } })
    if (!networkExists) return

    const cinemaExists = await this.cinemasRepository.getCinema({ where: { internal_cinema_id: cinema.internal_cinema_id, network_id: networkId } })
    if (cinemaExists) return

    await this.cinemasRepository.createCinema({
      data: {
        city: {
          connect: { id: cityId }
        },
        network: {
          connect: { id: networkId }
        },
        ...rest
      }
    })
  }
}
