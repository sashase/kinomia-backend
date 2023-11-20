import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { City } from '@prisma/client'
import { Cache } from 'cache-manager'
import { REDIS_KEY_CITIES } from '../../common/constants/'
import { CitiesService } from '../cities.service'
import { CitiesRepository } from '../cities.repository'
import { cityStub, cityCachedStub } from './stubs'

describe('CitiesService', () => {
  let service: CitiesService
  let citiesRepository: CitiesRepository
  let cacheManager: Cache

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CitiesService,
        {
          provide: CitiesRepository,
          useValue: {
            getCities: jest.fn(),
          }
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<CitiesService>(CitiesService)
    citiesRepository = module.get<CitiesRepository>(CitiesRepository)
    cacheManager = module.get<Cache>(CACHE_MANAGER)

    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getCities', () => {
    describe('when getCities is called', () => {
      const redisKey: string = REDIS_KEY_CITIES
      let cities: City[]

      test('then it should call cacheManager.get and return cachedCities', async () => {
        jest.spyOn(cacheManager, 'get').mockResolvedValue(`[${cityCachedStub()}]`)

        cities = await service.getCities()

        expect(cacheManager.get).toBeCalledWith(redisKey)
        expect(citiesRepository.getCities).not.toBeCalled()
        expect(cities).toEqual([cityStub()])
      })

      test('then it should call citiesRepository.getCities and return cities from the repository if no city is found in redis', async () => {
        jest.spyOn(citiesRepository, 'getCities').mockResolvedValue([cityStub()])
        jest.spyOn(cacheManager, 'get').mockResolvedValue(undefined)

        await service.getCities()

        expect(citiesRepository.getCities).toBeCalled()
        expect(cities).toEqual([cityStub()])
      })

      test('then it should throw a NotFoundException if no city was returned from the citiesRepository', async () => {
        jest.spyOn(citiesRepository, 'getCities').mockResolvedValue([])
        jest.spyOn(cacheManager, 'get').mockResolvedValue(undefined)

        await expect(service.getCities()).rejects.toThrowError(NotFoundException)
      })
    })
  })
})