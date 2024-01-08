import { BadGatewayException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { Network } from '@prisma/client'
import { MULTIPLEX_NETWORK_NAME } from '../../../../networks/constants'
import { networkStub } from '../../../../networks/test/stubs'
import { CitiesRepository } from '../../../../cities/cities.repository'
import { cityStub } from '../../../../cities/test/stubs'
import { CinemasService } from '../../../../cinemas/cinemas.service'
import { processedCinemaStub } from '../../../../cinemas/test/stubs'
import { ScraperService } from '../../../../data-sources/scraper.service'
import { cinemasRootStub, emptyRootStub } from '../../../../data-sources/test/stubs'
import { MultiplexCinemasService } from '../../services/multiplex-cinemas.service'
import { cityElementStub, urlStub } from './stubs'

describe('MultiplexCinemasService', () => {
  let service: MultiplexCinemasService
  let scraperService: ScraperService
  let cinemasService: CinemasService
  let citiesRepository: CitiesRepository

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MultiplexCinemasService,
        { provide: ScraperService, useValue: { getRoot: jest.fn() } },
        { provide: CinemasService, useValue: { validateAndCreateCinema: jest.fn() } },
        { provide: CitiesRepository, useValue: { getCity: jest.fn(), createCity: jest.fn() } },
      ],
    }).compile()

    service = module.get<MultiplexCinemasService>(MultiplexCinemasService)
    scraperService = module.get<ScraperService>(ScraperService)
    cinemasService = module.get<CinemasService>(CinemasService)
    citiesRepository = module.get<CitiesRepository>(CitiesRepository)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('updateCinemas', () => {
    const url: string = urlStub()
    const network: Network = networkStub(MULTIPLEX_NETWORK_NAME)

    it('should call all necessary methods to update cinemas', async () => {
      service.processCity = jest.fn()
      jest.spyOn(scraperService, 'getRoot').mockResolvedValue(cinemasRootStub())

      const numberOfCities: number = cinemasRootStub().querySelectorAll('.rm_clist').length

      await service.updateCinemas(url, network.id)

      expect(scraperService.getRoot).toBeCalledWith(url, service['networkName'])
      expect(service.processCity).toBeCalledTimes(numberOfCities)
    })

    it('should throw an error if no city is found', async () => {
      jest.spyOn(scraperService, 'getRoot').mockResolvedValue(emptyRootStub())

      await expect(service.updateCinemas(url, network.id)).rejects.toThrowError(BadGatewayException)
    })
  })

  describe('processCity', () => {
    it('should call cinemasService for each cinema', async () => {
      jest.spyOn(cinemasService, 'validateAndCreateCinema').mockResolvedValue()
      jest.spyOn(citiesRepository, 'getCity').mockResolvedValue(cityStub())

      const network = networkStub(MULTIPLEX_NETWORK_NAME)

      const numberOfCinemas: number = cityElementStub().querySelectorAll('.cinema').length

      await service.processCity(cityElementStub(), network.id)

      expect(cinemasService.validateAndCreateCinema).toBeCalledTimes(numberOfCinemas)
      expect(cinemasService.validateAndCreateCinema).toBeCalledWith(processedCinemaStub('multiplex'))
    })
  })
})
