import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { ConfigGetOptions, ConfigService } from '@nestjs/config'
import { MULTIPLEX_URL_PROPERTY_PATH } from '../../../../config/constants'
import { sourceServiceResponseStub } from '../../../../data-sources/test/stubs'
import { NetworksService } from '../../../../networks/networks.service'
import { MULTIPLEX_NETWORK_NAME } from '../../../../networks/constants'
import { networkStub } from '../../../../networks/test/stubs'
import { CinemasRepository } from '../../../../cinemas/cinemas.repository'
import { cinemasStub } from '../../../../cinemas/test/stubs'
import { SourceServiceResponse } from '../../../interfaces'
import { CINEMAS_NOT_FOUND } from '../../../constants'
import { MultiplexService } from '../../services/multiplex.service'
import { MultiplexCinemasService } from '../../services/multiplex-cinemas.service'
import { MultiplexShowtimesService } from '../../services/multiplex-showtimes.service'
import { urlStub } from './stubs'

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

    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('updateData', () => {
    describe('when updateData is called', () => {
      let response: SourceServiceResponse
      const networkName: string = MULTIPLEX_NETWORK_NAME

      beforeEach(async () => {
        jest.spyOn(networksService, 'getNetworkIdByName').mockResolvedValue(networkStub(networkName).id)
        jest.spyOn(configService, 'get').mockReturnValue(urlStub())
        jest.spyOn(cinemasRepository, 'getCinemas').mockResolvedValue(cinemasStub())

        response = await service.updateData()
      })

      test('then it should call networksService.getNetworkIdByName', () => {
        expect(networksService.getNetworkIdByName).toBeCalledWith(networkName)
      })

      test('then it should call configService.get', () => {
        const propertyPath: string = MULTIPLEX_URL_PROPERTY_PATH
        const params: ConfigGetOptions = { infer: true }
        expect(configService.get).toBeCalledWith(propertyPath, params)
      })

      test('then it should call multiplexCinemasService.updateCinemas', () => {
        expect(multiplexCinemasService.updateCinemas).toBeCalledWith(urlStub(), networkStub(networkName).id)
      })

      test('then it should throw NotFoundException if no cinema is found', async () => {
        jest.spyOn(cinemasRepository, 'getCinemas').mockResolvedValue(null)
        await expect(service.updateData()).rejects.toThrowError(new NotFoundException(CINEMAS_NOT_FOUND))
      })

      test('then it should call multiplexShowtimesService.updateShowtimes for each cinema', () => {
        const numberOfCinemas: number = cinemasStub().length
        expect(multiplexShowtimesService.updateShowtimes).toBeCalledTimes(numberOfCinemas)
      })

      test('then it should return success message', () => {
        expect(response).toEqual(sourceServiceResponseStub(networkName))
      })
    })
  })
})
