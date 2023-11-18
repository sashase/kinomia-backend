import { Test, TestingModule } from '@nestjs/testing'
import { City } from '@prisma/client'
import { CitiesController } from '../cities.controller'
import { CitiesService } from '../cities.service'
import { cityStub } from './stubs'

describe('CitiesController', () => {
  let controller: CitiesController
  let citiesService: CitiesService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CitiesController],
      providers: [{ provide: CitiesService, useValue: { getCities: jest.fn() } }],
    }).compile()

    controller = module.get<CitiesController>(CitiesController)
    citiesService = module.get<CitiesService>(CitiesService)

    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('getCities', () => {
    describe('when getCities is called', () => {
      let cities: City[]

      beforeEach(async () => {
        jest.spyOn(citiesService, 'getCities').mockResolvedValue([cityStub()])

        cities = await controller.getCities()
      })

      test('then it should call citiesService.getCities', () => {
        expect(citiesService.getCities).toBeCalled()
      })

      test('then it should return cities', () => {
        expect(cities).toEqual([cityStub()])
      })
    })
  })
})
