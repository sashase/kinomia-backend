import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { Cinema } from '@prisma/client'
import { REDIS_KEY_CINEMAS } from '../common/constants'
import { NetworksRepository } from '../networks/networks.repository'
import { CinemasRepository } from './cinemas.repository'
import { CreateCinemaDto, GetCinemasDto } from './dtos'

@Injectable()
export class CinemasService {
  constructor(
    private readonly cinemasRepository: CinemasRepository,
    private readonly networksRepository: NetworksRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) { }

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

  async getCinemas(dto: GetCinemasDto): Promise<Cinema[]> {
    const { id, network_id, city_id } = dto
    const redisKey: string = `${REDIS_KEY_CINEMAS}?id=${id}&network_id=${network_id}&city_id=${city_id}`

    const cachedCinemas: string = await this.cacheManager.get(redisKey)

    if (cachedCinemas) {
      const parsedCinemas: Cinema[] = JSON.parse(cachedCinemas)
      return parsedCinemas
    }

    const cinemas: Cinema[] = await this.cinemasRepository.getCinemas({
      where: {
        id: id ?? undefined,
        network_id,
        city_id,
      },
      include: {
        network: true,
        city: true
      }
    })

    if (!cinemas.length) throw new NotFoundException()

    const redisValue: string = JSON.stringify(cinemas)

    await this.cacheManager.set(redisKey, redisValue)

    return cinemas
  }
}
