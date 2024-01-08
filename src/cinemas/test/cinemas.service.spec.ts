import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cinema } from '@prisma/client'
import { Cache } from 'cache-manager'
import { REDIS_KEY_CINEMAS } from '../../common/constants/'
import { NetworksRepository } from '../../networks/networks.repository'
import { networkStub } from '../../networks/test/stubs'
import { CinemasService } from '../cinemas.service'
import { CinemasRepository } from '../cinemas.repository'
import { CreateCinemaDto, GetCinemasDto } from '../dtos'
import { cinemaCachedStub, cinemaStub } from './stubs'

describe('CinemasService', () => {
  let service: CinemasService
  let cinemasRepository: CinemasRepository
  let networksRepository: NetworksRepository
  let cacheManager: Cache

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CinemasService,
        {
          provide: CinemasRepository,
          useValue: {
            getCinemas: jest.fn(),
            getCinema: jest.fn(),
            createCinema: jest.fn(),
          }
        },
        {
          provide: NetworksRepository,
          useValue: {
            getNetwork: jest.fn(),
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

    service = module.get<CinemasService>(CinemasService)
    cinemasRepository = module.get<CinemasRepository>(CinemasRepository)
    networksRepository = module.get<NetworksRepository>(NetworksRepository)
    cacheManager = module.get<Cache>(CACHE_MANAGER)

    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('validateAndCreateCinema', () => {
    describe('when validateAndCreateCinema is called', () => {
      const dto: CreateCinemaDto = {
        networkId: 1,
        cityId: 1,
        internal_cinema_id: '1',
        name: 'Lavina IMAX Лазер',
        address: 'вул. Берковецька, 6Д',
      }

      test('then it should call networksRepository.getNetwork and return if network does not exist', async () => {
        jest.spyOn(networksRepository, 'getNetwork').mockResolvedValue(null)

        await service.validateAndCreateCinema(dto)

        expect(networksRepository.getNetwork).toBeCalledWith({ where: { id: dto.networkId } })
        expect(cinemasRepository.getCinema).not.toBeCalled()
        expect(cinemasRepository.createCinema).not.toBeCalled()
      })

      test('then it should call cinemasRepository.getCinema and return if cinema already exists', async () => {
        jest.spyOn(networksRepository, 'getNetwork').mockResolvedValue(networkStub(dto.networkId))
        jest.spyOn(cinemasRepository, 'getCinema').mockResolvedValue(cinemaStub())

        await service.validateAndCreateCinema(dto)

        expect(cinemasRepository.getCinema).toBeCalledWith({ where: { internal_cinema_id: dto.internal_cinema_id, network_id: dto.networkId } })
        expect(cinemasRepository.createCinema).not.toBeCalled()
      })

      test('then it should call cinemasRepository.createCinema', async () => {
        jest.spyOn(networksRepository, 'getNetwork').mockResolvedValue(networkStub(dto.networkId))
        jest.spyOn(cinemasRepository, 'getCinema').mockResolvedValue(null)
        jest.spyOn(cinemasRepository, 'createCinema').mockResolvedValue(cinemaStub())

        const { networkId, cityId, ...rest } = dto

        await service.validateAndCreateCinema(dto)

        expect(cinemasRepository.createCinema).toBeCalledWith({
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
      })
    })
  })

  describe('getCinemas', () => {
    describe('when getCinemas is called', () => {
      const dto: GetCinemasDto = {
        id: 123,
        network_id: 1,
        city_id: 1
      }

      const redisKey: string = `${REDIS_KEY_CINEMAS}?id=${dto.id}&network_id=${dto.network_id}&city_id=${dto.city_id}`
      let cinemas: Cinema[]

      test('then it should call cacheManager.get and return cachedCinemas', async () => {
        jest.spyOn(cacheManager, 'get').mockResolvedValue(`[${cinemaCachedStub()}]`)

        cinemas = await service.getCinemas(dto)

        expect(cacheManager.get).toBeCalledWith(redisKey)
        expect(cinemasRepository.getCinemas).not.toBeCalled()
        expect(cinemas).toEqual([cinemaStub()])
      })

      test('then it should call cinemasRepository.getCinemas and return cinemas from the repository if no cinema is found in redis', async () => {
        jest.spyOn(cinemasRepository, 'getCinemas').mockResolvedValue([cinemaStub()])
        jest.spyOn(cacheManager, 'get').mockResolvedValue(undefined)

        await service.getCinemas(dto)

        expect(cinemasRepository.getCinemas).toBeCalledWith({
          where: {
            id: dto.id ?? undefined,
            network_id: dto.network_id,
            city_id: dto.city_id,
          },
          include: {
            network: true,
            city: true
          }
        })
        expect(cinemas).toEqual([cinemaStub()])
      })

      test('then it should throw a NotFoundException if no cinema was returned from the cinemasRepository', async () => {
        jest.spyOn(cinemasRepository, 'getCinemas').mockResolvedValue([])
        jest.spyOn(cacheManager, 'get').mockResolvedValue(undefined)

        await expect(service.getCinemas(dto)).rejects.toThrowError(NotFoundException)
      })
    })
  })
})