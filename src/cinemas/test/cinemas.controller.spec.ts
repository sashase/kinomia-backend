import { Test, TestingModule } from '@nestjs/testing'
import { Cinema } from '@prisma/client'
import { CinemasController } from '../cinemas.controller'
import { CinemasService } from '../cinemas.service'
import { cinemaStub } from './stubs'

describe('CinemasController', () => {
  let controller: CinemasController
  let cinemasService: CinemasService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CinemasController],
      providers: [{ provide: CinemasService, useValue: { getCinemas: jest.fn() } }],
    }).compile()

    controller = module.get<CinemasController>(CinemasController)
    cinemasService = module.get<CinemasService>(CinemasService)

    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('getCinemas', () => {
    describe('when getCinemas is called', () => {
      let Cinemas: Cinema[]

      beforeEach(async () => {
        jest.spyOn(cinemasService, 'getCinemas').mockResolvedValue([cinemaStub()])

        Cinemas = await controller.getCinemas({})
      })

      test('then it should call cinemasService.getCinemas', () => {
        expect(cinemasService.getCinemas).toBeCalled()
      })

      test('then it should return cinemas', () => {
        expect(Cinemas).toEqual([cinemaStub()])
      })
    })
  })
})
