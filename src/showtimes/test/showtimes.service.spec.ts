import { Test, TestingModule } from '@nestjs/testing'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Prisma, Showtime } from '@prisma/client'
import { Cache } from 'cache-manager'
import { CinemasRepository } from '../../cinemas/cinemas.repository'
import { cinemasStub } from '../../cinemas/test/stubs'
import { movieStub } from '../../movies/test/stubs'
import { ShowtimesService } from '../showtimes.service'
import { ShowtimesRepository } from '../showtimes.repository'
import { CreateShowtimeDto, GetShowtimesDto } from '../dtos'
import { showtimesStub } from './stubs'

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
        internal_showtime_id: 20324,
        date: new Date(2023, 10, 15, 10, 45),
        format: '3D',
        price: 180,
        order_link: 'https://cinema.com/showtime/20324',
        movie: movieStub()
      }
      const cinemaId: number = 10

      const { movie, internal_showtime_id, ...rest } = dto
      const { id, title } = movie

      beforeEach(async () => {
        jest.spyOn(showtimesRepository, 'getShowtime').mockResolvedValue(null)
        jest.spyOn(showtimesRepository, 'createShowtime').mockResolvedValue(showtimesStub()[0])
        jest.spyOn(cinemasRepository, 'getCinema').mockResolvedValue(cinemasStub()[0])

        await service.validateAndCreateShowtime(dto, cinemaId)
      })

      test('then it should call cinemasRepository.getCinema', () => {
        const cinemaWhereInput: Prisma.CinemaWhereInput = { id: cinemaId }

        expect(cinemasRepository.getCinema).toBeCalledWith({ where: cinemaWhereInput })
      })

      test('then it should return if cinema is not found', () => {
        jest.clearAllMocks()
        jest.spyOn(cinemasRepository, 'getCinema').mockResolvedValue(null)

        expect(showtimesRepository.getShowtime).not.toBeCalled()
      })

      test('then it should call showtimesRepository.getShowtime', () => {
        const showtimeWhereInput: Prisma.ShowtimeWhereInput = {
          internal_showtime_id,
          cinema_id: cinemaId
        }

        expect(showtimesRepository.getShowtime).toBeCalledWith({ where: showtimeWhereInput })
      })

      test('then it should return if showtime already exists', () => {
        jest.clearAllMocks()
        jest.spyOn(showtimesRepository, 'getShowtime').mockResolvedValue(showtimesStub()[0])

        expect(showtimesRepository.createShowtime).not.toBeCalled()
      })

      test('then it should call showtimesRepository.createShowtime', () => {
        const showtimeCreateInput: Prisma.ShowtimeCreateInput = {
          cinema: {
            connect: { id: cinemaId }
          },
          movie: {
            connect: { id_title: { id, title } }
          },
          internal_showtime_id,
          ...rest
        }

        expect(showtimesRepository.createShowtime).toBeCalledWith({ data: showtimeCreateInput })
      })
    })
  })

  describe('getShowtimes', () => {
    describe('when getShowtimes is called', () => {
      const dto: GetShowtimesDto = {
        id: 1764,
        movie_id: 901362
      }

      const { id, format, price, cinema_id, movie_id, movie_title, date } = dto
      const redisKey: string = `showtimes?id=${id}&format=undefined&price=undefined&cinema_id=undefined&movie_id=${movie_id}&movie_title=undefined&date=undefined`

      let showtimes: Showtime[]

      beforeEach(async () => {
        jest.spyOn(showtimesRepository, 'getShowtimes').mockResolvedValue(showtimesStub())
        jest.spyOn(cacheManager, 'get').mockResolvedValue('[{"id":1764,"internal_showtime_id":73071,"date":"2023-11-09T12:00:00.000Z","format":"3D SDH","price":180,"order_link":"https://new.multiplex.ua/order/cinema/0000000005/session/73071","cinema_id":15,"movie_id":901362,"movie_title":"Тролі: Знову разом"}]')

        showtimes = await service.getShowtimes(dto)
      })

      test('then it should call cacheManager.get', () => {
        expect(cacheManager.get).toBeCalledWith(redisKey)
      })

      test('then it should return showtimes', () => {
        expect(showtimesRepository.getShowtimes).not.toBeCalled()
        expect(showtimes).toEqual(showtimesStub())
      })

      // BUG: Jest does not detecting showtimesRepository.getShowtimes call, despite there is an actual call
      test('then it should call showtimesRepository.getShowtimes if no showtime is found in redis', () => {
        jest.clearAllMocks()
        jest.spyOn(cacheManager, 'get').mockResolvedValue(undefined)

        const showtimeWhereInput: Prisma.ShowtimeWhereInput = {
          id: id ?? undefined,
          format: format ? { contains: format } : undefined,
          price: price ?? undefined,
          cinema_id: cinema_id ?? undefined,
          movie_id: movie_id ?? undefined,
          movie_title: movie_title ? { contains: movie_title } : undefined,
          date: date ?? undefined
        }

        expect(showtimesRepository.getShowtimes).toBeCalledWith({ where: showtimeWhereInput })
      })
    })
  })
})