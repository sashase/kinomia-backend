import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Prisma, Showtime } from '@prisma/client'
import { Cache } from 'cache-manager'
import { REDIS_KEY_SHOWTIMES } from '../../common/constants'
import { CinemasRepository } from '../../cinemas/cinemas.repository'
import { cinemasStub } from '../../cinemas/test/stubs'
import { movieStub } from '../../movies/test/stubs'
import { ShowtimesService } from '../showtimes.service'
import { ShowtimesRepository } from '../showtimes.repository'
import { CreateShowtimeDto, GetShowtimesDto } from '../dtos'
import { showtimeCachedStub, showtimeStub } from './stubs'

describe('ShowtimesService', () => {
  let service: ShowtimesService
  let cinemasRepository: CinemasRepository
  let showtimesRepository: ShowtimesRepository
  let cacheManager: Cache

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShowtimesService,
        {
          provide: ShowtimesRepository,
          useValue: {
            getShowtimes: jest.fn(),
            getShowtime: jest.fn(),
            createShowtime: jest.fn()
          }
        },
        {
          provide: CinemasRepository,
          useValue: {
            getCinema: jest.fn()
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

    service = module.get<ShowtimesService>(ShowtimesService)
    showtimesRepository = module.get<ShowtimesRepository>(ShowtimesRepository)
    cinemasRepository = module.get<CinemasRepository>(CinemasRepository)
    cacheManager = module.get<Cache>(CACHE_MANAGER)

    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('validateAndCreateShowtime', () => {
    describe('when validateAndCreateShowtime is called', () => {
      const dto: CreateShowtimeDto = {
        cinemaId: 1,
        internal_showtime_id: 20324,
        date: new Date(2023, 10, 15, 10, 45),
        format: '3D',
        price: 180,
        order_link: 'https://cinema.com/showtime/20324',
        movie: movieStub()
      }

      const { movie, cinemaId, ...rest } = dto
      const { id, title } = movie

      test('then it should create a showtime if cinema exists and showtime with the same id doesn\'t', async () => {
        jest.spyOn(cinemasRepository, 'getCinema').mockResolvedValue(cinemasStub()[0])
        jest.spyOn(showtimesRepository, 'getShowtime').mockResolvedValue(null)

        const cinemaWhereInput: Prisma.CinemaWhereInput = { id: cinemaId }
        const showtimeWhereInput: Prisma.ShowtimeWhereInput = {
          internal_showtime_id: dto.internal_showtime_id,
          cinema_id: cinemaId
        }

        const showtimeCreateInput: Prisma.ShowtimeCreateInput = {
          cinema: {
            connect: { id: cinemaId }
          },
          movie: {
            connect: { id_title: { id, title } }
          },
          ...rest
        }

        await service.validateAndCreateShowtime(dto)

        expect(cinemasRepository.getCinema).toBeCalledWith({ where: cinemaWhereInput })
        expect(showtimesRepository.getShowtime).toBeCalledWith({ where: showtimeWhereInput })
        expect(showtimesRepository.createShowtime).toBeCalledWith({ data: showtimeCreateInput })
      })

      test('then it should return if cinema doesn\'t exist', async () => {
        jest.spyOn(cinemasRepository, 'getCinema').mockResolvedValue(null)

        await service.validateAndCreateShowtime(dto)

        expect(showtimesRepository.getShowtime).not.toBeCalled()
      })

      test('then it should return if showtime with the same id exists', async () => {
        jest.spyOn(cinemasRepository, 'getCinema').mockResolvedValue(cinemasStub()[0])
        jest.spyOn(showtimesRepository, 'getShowtime').mockResolvedValue(showtimeStub())

        await service.validateAndCreateShowtime(dto)

        expect(showtimesRepository.createShowtime).not.toBeCalled()
      })
    })
  })

  describe('getShowtimes', () => {
    describe('when getShowtimes is called', () => {
      const dto: GetShowtimesDto = {
        id: 1764,
        movie_id: 901362
      }

      const { id, format, price, cinema_id, movie_id, movie_title } = dto
      const redisKey: string = `${REDIS_KEY_SHOWTIMES}?id=${id}&format=undefined&price=undefined&cinema_id=undefined&movie_id=${movie_id}&movie_title=undefined`

      let showtimes: Showtime[]

      test('then it should call cacheManager.get and return cached showtimes', async () => {
        jest.spyOn(cacheManager, 'get').mockResolvedValue(`[${showtimeCachedStub()}]`)

        showtimes = await service.getShowtimes(dto)

        expect(cacheManager.get).toBeCalledWith(redisKey)
        expect(showtimesRepository.getShowtimes).not.toBeCalled()
        expect(showtimes).toEqual([showtimeStub()])
      })

      test('then it should cache and return showtimes from the showtimesRepository if no showtime is found in cache', async () => {
        jest.spyOn(cacheManager, 'get').mockResolvedValue(undefined)
        jest.spyOn(showtimesRepository, 'getShowtimes').mockResolvedValue([showtimeStub()])

        const todayMidnight: Date = new Date(new Date().setHours(0, 0, 0, 0))
        const tomorrowMidnightTimestamp: number = new Date().setHours(24, 0, 0, 0)

        const showtimeWhereInput: Prisma.ShowtimeWhereInput = {
          id: id ?? undefined,
          format: format ? { contains: format } : undefined,
          price: price ?? undefined,
          cinema_id: cinema_id ?? undefined,
          movie_id: movie_id ?? undefined,
          movie_title: movie_title ? { contains: movie_title } : undefined,
          date: {
            gte: todayMidnight
          }
        }

        const showtimeInclude: Prisma.ShowtimeInclude = {
          cinema: {
            include: { network: true }
          },
        }

        const redisValue = JSON.stringify([showtimeStub()])
        const redisTtl: number = Math.floor((tomorrowMidnightTimestamp - Date.now()) + 1)

        showtimes = await service.getShowtimes(dto)

        expect(cacheManager.get).toBeCalledWith(redisKey)
        expect(showtimesRepository.getShowtimes).toBeCalledWith({ where: showtimeWhereInput, include: showtimeInclude })
        expect(cacheManager.set).toBeCalledWith(redisKey, redisValue, redisTtl)
        expect(showtimes).toEqual([showtimeStub()])
      })

      test('then it should throw a NotFoundException if no showtime was returned from the showtimesRepository', async () => {
        jest.spyOn(cacheManager, 'get').mockResolvedValue(undefined)
        jest.spyOn(showtimesRepository, 'getShowtimes').mockResolvedValue([])

        await expect(service.getShowtimes(dto)).rejects.toThrowError(NotFoundException)
      })
    })
  })
})