import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { networkIdStub } from '../../../../networks/test/stubs/network-id.stub'
import { CinemasService } from '../../../../cinemas/cinemas.service'
import { processedCinemaStub } from '../../../../cinemas/test/stubs'
import { ScraperService } from '../../../../data-sources/scraper.service'
import { rootStub, emptyRootStub } from '../../../../data-sources/test/stubs'
import { MultiplexCinemasService } from '../../services/multiplex-cinemas.service'
import { cityStub, emptyCityStub, urlStub } from './stubs'


describe('MultiplexCinemasService', () => {
  let service: MultiplexCinemasService
  let scraperService: ScraperService
  let cinemasService: CinemasService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MultiplexCinemasService,
        { provide: ScraperService, useValue: { getRoot: jest.fn() } },
        { provide: CinemasService, useValue: { validateAndCreateCinema: jest.fn() } },
      ],
    }).compile()

    service = module.get<MultiplexCinemasService>(MultiplexCinemasService)
    scraperService = module.get<ScraperService>(ScraperService)
    cinemasService = module.get<CinemasService>(CinemasService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('updateCinemas', () => {
    it('should call all necessary methods to update cinemas', async () => {
      service.processCity = jest.fn()
      jest.spyOn(scraperService, 'getRoot').mockResolvedValue(rootStub())

      const numberOfCities: number = rootStub().querySelectorAll('.rm_clist').length

      await service.updateCinemas(urlStub(), networkIdStub())

      expect(service.processCity).toBeCalledTimes(numberOfCities)
    })


    it('should throw an error if no city is found', async () => {
      jest.spyOn(scraperService, 'getRoot').mockResolvedValue(emptyRootStub())

      await expect(service.updateCinemas(urlStub(), networkIdStub())).rejects.toThrowError(NotFoundException)
    })
  })

  describe('processCity', () => {
    it('should call cinemasService for each cinema', async () => {
      jest.spyOn(cinemasService, 'validateAndCreateCinema').mockResolvedValue()

      const numberOfCinemas: number = cityStub().querySelectorAll('.cinema').length

      await service.processCity(cityStub())

      expect(cinemasService.validateAndCreateCinema).toBeCalledTimes(numberOfCinemas)
      expect(cinemasService.validateAndCreateCinema).toBeCalledWith(processedCinemaStub(), undefined)
      // networkId is undefined in a scope of *.spec.ts files, because it's a private property
    })

    it('should throw an error if no cinema is found', async () => {
      await expect(service.processCity(emptyCityStub())).rejects.toThrowError(NotFoundException)
    })
  })
})
