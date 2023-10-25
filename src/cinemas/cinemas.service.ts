import { Injectable } from '@nestjs/common'
import { NetworksRepository } from '../networks/networks.repository'
import { CinemasRepository } from './cinemas.repository'
import { CreateCinemaDto } from './dtos'

@Injectable()
export class CinemasService {
  constructor(private readonly cinemasRepository: CinemasRepository, private readonly networksRepository: NetworksRepository) { }

  async validateAndCreateCinema(cinema: CreateCinemaDto, networkId: number): Promise<void> {
    const { internal_cinema_id } = cinema

    const networkExists = await this.networksRepository.getNetwork({ where: { id: networkId } })
    if (!networkExists) return

    const cinemaExists = await this.cinemasRepository.getCinema({ where: { internal_cinema_id, network_id: networkId } })
    if (cinemaExists) return

    await this.cinemasRepository.createCinema({
      data: {
        network: {
          connect: { id: networkId }
        },
        ...cinema
      }
    })
  }
}
