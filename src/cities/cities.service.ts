import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { City } from '@prisma/client'
import { Cache } from 'cache-manager'
import { CitiesRepository } from './cities.repository'

@Injectable()
export class CitiesService {
  constructor(private readonly citiesRepository: CitiesRepository, @Inject(CACHE_MANAGER) private readonly cacheManager: Cache) { }

  async getCities(): Promise<City[]> {
    const redisKey: string = `cities`

    const cachedCities: string = await this.cacheManager.get(redisKey)

    if (cachedCities) {
      const parsedCities: City[] = JSON.parse(cachedCities)
      return parsedCities
    }

    const cities: City[] = await this.citiesRepository.getCities({})
    if (!cities.length) throw new NotFoundException()
    const redisValue = JSON.stringify(cities)
    await this.cacheManager.set(redisKey, redisValue)
    return cities
  }
}
