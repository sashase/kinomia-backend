import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { NetworksService } from '../../../../networks/networks.service'
import { MULTIPLEX_NETWORK_NAME } from '../../../../networks/constants'
import { networkStub } from '../../../../networks/test/stubs'
import { CinemasRepository } from '../../../../cinemas/cinemas.repository'
import { cinemasStub } from '../../../../cinemas/test/stubs'
import { MultiplexService } from '../../services/multiplex.service'
import { MultiplexCinemasService } from '../../services/multiplex-cinemas.service'
import { MultiplexShowtimesService } from '../../services/multiplex-showtimes.service'
import { resultStub, urlStub } from './stubs'

describe('MultiplexService', () => {
  let service: MultiplexService
  let configService: ConfigService
  let networksService: NetworksService
  let cinemasRepository: CinemasRepository
  let multiplexCinemasService: MultiplexCinemasService
  let multiplexShowtimesService: MultiplexShowtimesService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MultiplexService,
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: NetworksService, useValue: { getNetworkIdByName: jest.fn() } },
        { provide: CinemasRepository, useValue: { getCinemas: jest.fn() } },
        { provide: MultiplexCinemasService, useValue: { updateCinemas: jest.fn() } },
        { provide: MultiplexShowtimesService, useValue: { updateShowtimes: jest.fn() } }
      ],
    }).compile()

    service = module.get<MultiplexService>(MultiplexService)
    configService = module.get<ConfigService>(ConfigService)
    networksService = module.get<NetworksService>(NetworksService)
    cinemasRepository = module.get<CinemasRepository>(CinemasRepository)
    multiplexCinemasService = module.get<MultiplexCinemasService>(MultiplexCinemasService)
    multiplexShowtimesService = module.get<MultiplexShowtimesService>(MultiplexShowtimesService)

    jest.spyOn(networksService, 'getNetworkIdByName').mockResolvedValue(networkStub(MULTIPLEX_NETWORK_NAME).id)
    jest.spyOn(configService, 'get').mockReturnValue(urlStub())
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('updateData', () => {
    it('should call all necessary methods to update data successfully', async () => {
      jest.spyOn(cinemasRepository, 'getCinemas').mockResolvedValue(cinemasStub())

      const numberOfCinemas = cinemasStub().length

      const result = await service.updateData()

      expect(multiplexCinemasService.updateCinemas).toBeCalledWith(urlStub(), networkStub(MULTIPLEX_NETWORK_NAME).id)
      expect(cinemasRepository.getCinemas).toBeCalled()
      expect(multiplexShowtimesService.updateShowtimes).toBeCalledTimes(numberOfCinemas)

      expect(result).toEqual(resultStub())
    })

    it('should throw an error if no cinema is found', async () => {
      jest.spyOn(cinemasRepository, 'getCinemas').mockResolvedValue(null)

      await expect(service.updateData()).rejects.toThrowError(NotFoundException)
    })
  })
})
