import { Test, TestingModule } from '@nestjs/testing'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { City } from '@prisma/client'
import { Cache } from 'cache-manager'
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
      const redisKey: string = 'cities'
      let cities: City[]

      beforeEach(async () => {
        jest.spyOn(citiesRepository, 'getCities').mockResolvedValue([cityStub()])
        jest.spyOn(cacheManager, 'get').mockResolvedValue(`[${cityCachedStub()}]`)
        cities = await service.getCities()
      })

      test('then it should call cacheManager.get', () => {
        expect(cacheManager.get).toBeCalledWith(redisKey)
      })


      test('then it should return cities', () => {
        expect(citiesRepository.getCities).not.toBeCalled()
        expect(cities).toEqual([cityStub()])
      })

      //
      test('then it should call citiesRepository.getCities if no city is found in redis', () => {
        jest.clearAllMocks()
        jest.spyOn(cacheManager, 'get').mockResolvedValue(undefined)

        expect(citiesRepository.getCities).toBeCalled()
      })
    })
  })
})