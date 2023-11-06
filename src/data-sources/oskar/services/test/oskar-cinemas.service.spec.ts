import { Test, TestingModule } from '@nestjs/testing'
import { OSKAR_NETWORK_NAME } from '../../../../networks/constants'
import { networkStub } from '../../../../networks/test/stubs'
import { CinemasService } from '../../../../cinemas/cinemas.service'
import { processedCinemaStub } from '../../../../cinemas/test/stubs'
import { ScraperService } from '../../../../data-sources/scraper.service'
import { OskarCinemasService } from '../oskar-cinemas.service'
import { cinemaDataStub } from './stubs'

describe('OskarCinemasService', () => {
  let service: OskarCinemasService
  let scraperService: ScraperService
  let cinemasService: CinemasService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OskarCinemasService,
        { provide: ScraperService, useValue: { getRoot: jest.fn() } },
        { provide: CinemasService, useValue: { validateAndCreateCinema: jest.fn() } },
      ],
    }).compile()

    service = module.get<OskarCinemasService>(OskarCinemasService)
    scraperService = module.get<ScraperService>(ScraperService)
    cinemasService = module.get<CinemasService>(CinemasService)
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
      const network = networkStub(OSKAR_NETWORK_NAME)

      await service.processCinema(cinemaDataStub(), network.id)

      expect(cinemasService.validateAndCreateCinema).toBeCalledWith(processedCinemaStub('oskar'), network.id)
    })
  })
})
