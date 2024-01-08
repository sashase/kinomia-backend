const getDatesMock = jest.fn()

import { InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { ConfigGetOptions, ConfigService } from '@nestjs/config'
import { OSKAR_URL_PROPERTY_PATH } from '../../../../config/constants'
import { NetworksService } from '../../../../networks/networks.service'
import { OSKAR_NETWORK_NAME } from '../../../../networks/constants'
import { networkStub } from '../../../../networks/test/stubs'
import { CinemasRepository } from '../../../../cinemas/cinemas.repository'
import { cinemaStub } from '../../../../cinemas/test/stubs'
import { sourceServiceResponseStub } from '../../../test/stubs'
import { SourceServiceResponse } from '../../../interfaces'
import { CINEMAS_NOT_FOUND, DATES_ARRAY_CANNOT_BE_GENERATED } from '../../../constants'
import { OskarService } from '../oskar.service'
import { OskarCinemasService } from '../oskar-cinemas.service'
import { OskarShowtimesService } from '../oskar-showtimes.service'
import { datesStub, urlStub } from './stubs'

jest.mock('../../utils', () => ({
  getDates: getDatesMock
}))

describe('OskarService', () => {
  let service: OskarService
  let configService: ConfigService
  let networksService: NetworksService
  let cinemasRepository: CinemasRepository
  let oskarCinemasService: OskarCinemasService
  let oskarShowtimesService: OskarShowtimesService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OskarService,
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: NetworksService, useValue: { getNetworkIdByName: jest.fn() } },
        { provide: CinemasRepository, useValue: { getCinemas: jest.fn() } },
        { provide: OskarCinemasService, useValue: { updateCinemas: jest.fn() } },
        { provide: OskarShowtimesService, useValue: { updateShowtimes: jest.fn() } }
      ],
    }).compile()

    service = module.get<OskarService>(OskarService)
    configService = module.get<ConfigService>(ConfigService)
    networksService = module.get<NetworksService>(NetworksService)
    cinemasRepository = module.get<CinemasRepository>(CinemasRepository)
    oskarCinemasService = module.get<OskarCinemasService>(OskarCinemasService)
    oskarShowtimesService = module.get<OskarShowtimesService>(OskarShowtimesService)

    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('updateData', () => {
    describe('when updateData is called', () => {
      let response: SourceServiceResponse
      const networkName: string = OSKAR_NETWORK_NAME

      beforeEach(async () => {
        jest.spyOn(networksService, 'getNetworkIdByName').mockResolvedValue(networkStub(networkName).id)
        jest.spyOn(configService, 'get').mockReturnValue(urlStub())
        jest.spyOn(cinemasRepository, 'getCinemas').mockResolvedValue([cinemaStub()])
        getDatesMock.mockReturnValue(datesStub())

        response = await service.updateData()
      })

      test('then it should call networksService.getNetworkIdByName', () => {
        expect(networksService.getNetworkIdByName).toBeCalledWith(networkName)
      })

      test('then it should call configService.get', () => {
        const propertyPath: string = OSKAR_URL_PROPERTY_PATH
        const params: ConfigGetOptions = { infer: true }
        expect(configService.get).toBeCalledWith(propertyPath, params)
      })

      test('then it should call oskarCinemasService.updateCinemas', () => {
        expect(oskarCinemasService.updateCinemas).toBeCalledWith(networkStub(networkName).id)
      })

      test('then it should throw NotFoundException if no cinema is found', async () => {
        jest.spyOn(cinemasRepository, 'getCinemas').mockResolvedValue(null)
        await expect(service.updateData()).rejects.toThrowError(new NotFoundException(CINEMAS_NOT_FOUND))
      })

      test('then it should call getDates', () => {
        expect(getDatesMock).toBeCalled()
      })

      test('then it should throw InternalServerErrorException if no date can be generated', async () => {
        getDatesMock.mockReturnValue(null)
        await expect(service.updateData()).rejects.toThrowError(new InternalServerErrorException(DATES_ARRAY_CANNOT_BE_GENERATED))
      })

      test('then it should call oskarShowtimesService.updateShowtimes for each cinema and date', () => {
        const numberOfCinemas: number = [cinemaStub()].length
        const numberOfDates: number = datesStub().length
        const totalNumberOfCalls: number = numberOfCinemas * numberOfDates
        expect(oskarShowtimesService.updateShowtimes).toBeCalledTimes(totalNumberOfCalls)
      })

      test('then it should return success message', () => {
        expect(response).toEqual(sourceServiceResponseStub(networkName))
      })
    })
  })
})
