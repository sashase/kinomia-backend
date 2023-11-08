import { Test, TestingModule } from '@nestjs/testing'
import { Showtime } from '@prisma/client'
import { ShowtimesController } from '../showtimes.controller'
import { ShowtimesService } from '../showtimes.service'
import { GetShowtimesDto } from '../dtos'
import { showtimesStub } from './stubs'

describe('ShowtimesController', () => {
  let controller: ShowtimesController
  let showtimesService: ShowtimesService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShowtimesController],
      providers: [{ provide: ShowtimesService, useValue: { getShowtimes: jest.fn() } }],
    }).compile()

    controller = module.get<ShowtimesController>(ShowtimesController)
    showtimesService = module.get<ShowtimesService>(ShowtimesService)

    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('getShowtimes', () => {
    describe('when getShowtimes is called', () => {
      const dto: GetShowtimesDto = {
        id: 100,
        movie_id: 83792
      }
      let showtimes: Showtime[]

      beforeEach(async () => {
        jest.spyOn(showtimesService, 'getShowtimes').mockResolvedValue(showtimesStub())

        showtimes = await controller.getShowtimes(dto)
      })

      test('then it should call showtimesService.getShowtimes', () => {
        expect(showtimesService.getShowtimes).toBeCalledWith(dto)
      })

      test('then it should return showtimes', () => {
        expect(showtimes).toEqual(showtimesStub())
      })
    })
  })
})
