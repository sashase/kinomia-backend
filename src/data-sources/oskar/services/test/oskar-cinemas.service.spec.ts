import { Test, TestingModule } from '@nestjs/testing'
import { OSKAR_NETWORK_NAME } from '../../../../networks/constants'
import { networkStub } from '../../../../networks/test/stubs'
import { CitiesRepository } from '../../../../cities/cities.repository'
import { cityStub } from '../../../../cities/test/stubs'
import { CinemasService } from '../../../../cinemas/cinemas.service'
import { processedCinemaStub } from '../../../../cinemas/test/stubs'
import { OskarCinemasService } from '../oskar-cinemas.service'
import { cinemaDataStub } from './stubs'

describe('OskarCinemasService', () => {
  let service: OskarCinemasService
  let cinemasService: CinemasService
  let citiesRepository: CitiesRepository

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OskarCinemasService,
        { provide: CinemasService, useValue: { validateAndCreateCinema: jest.fn() } },
        { provide: CitiesRepository, useValue: { getCity: jest.fn(), createCity: jest.fn() } },
      ],
    }).compile()

    service = module.get<OskarCinemasService>(OskarCinemasService)
    cinemasService = module.get<CinemasService>(CinemasService)
    citiesRepository = module.get<CitiesRepository>(CitiesRepository)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('updateCinemas', () => {
    it('should call all necessary methods to update cinemas', async () => {
      service.processCinema = jest.fn()

      await service.updateCinemas(networkStub(OSKAR_NETWORK_NAME).id)

      expect(service.processCinema).toBeCalledTimes(service['cinemas'].length)
    })
  })

  describe('processCinema', () => {
    it('should create createCinemaDto and call cinemasService', async () => {
      jest.spyOn(cinemasService, 'validateAndCreateCinema').mockResolvedValue()
      jest.spyOn(citiesRepository, 'getCity').mockResolvedValue(cityStub())
      const network = networkStub(OSKAR_NETWORK_NAME)

      await service.processCinema(cinemaDataStub(), network.id)

      expect(cinemasService.validateAndCreateCinema).toBeCalledWith(processedCinemaStub('oskar'))
    })
  })
})
