const getDatesMock = jest.fn()

import { InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { NetworksService } from '../../../../networks/networks.service'
import { OSKAR_NETWORK_NAME } from '../../../../networks/constants'
import { networkStub } from '../../../../networks/test/stubs'
import { CinemasRepository } from '../../../../cinemas/cinemas.repository'
import { cinemasStub } from '../../../../cinemas/test/stubs'
import { OskarService } from '../oskar.service'
import { OskarCinemasService } from '../oskar-cinemas.service'
import { OskarShowtimesService } from '../oskar-showtimes.service'
import { datesStub, resultStub, urlStub } from './stubs'

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

    jest.spyOn(networksService, 'getNetworkIdByName').mockResolvedValue(networkStub(OSKAR_NETWORK_NAME).id)
    jest.spyOn(configService, 'get').mockReturnValue(urlStub())
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('updateData', () => {
    it('should call all necessary methods to update data successfully', async () => {
      jest.spyOn(cinemasRepository, 'getCinemas').mockResolvedValue(cinemasStub())
      getDatesMock.mockReturnValue(datesStub())

      const numberOfCinemas: number = cinemasStub().length
      const numberOfDates: number = datesStub().length
      const numberOfShowtimesServiceCalls: number = numberOfCinemas * numberOfDates

      const result = await service.updateData()

      expect(oskarCinemasService.updateCinemas).toBeCalledWith(networkStub(OSKAR_NETWORK_NAME).id)
      expect(cinemasRepository.getCinemas).toBeCalled()
      expect(oskarShowtimesService.updateShowtimes).toBeCalledTimes(numberOfShowtimesServiceCalls)

      expect(result).toEqual(resultStub())
    })

    it('should throw an error if no cinema is found', async () => {
      jest.spyOn(cinemasRepository, 'getCinemas').mockResolvedValue(null)

      await expect(service.updateData()).rejects.toThrowError(NotFoundException)
    })

    it('should throw an error if no date can be generated', async () => {
      jest.spyOn(cinemasRepository, 'getCinemas').mockResolvedValue(cinemasStub())
      getDatesMock.mockReturnValue(null)

      await expect(service.updateData()).rejects.toThrowError(InternalServerErrorException)
    })
  })
})
