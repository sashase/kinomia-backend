import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Network } from '@prisma/client'
import { Cache } from 'cache-manager'
import { REDIS_KEY_NETWORK, REDIS_KEY_NETWORKS } from '../../common/constants'
import { NetworksService } from '../networks.service'
import { NetworksRepository } from '../networks.repository'
import { networkStub, networkCachedStub } from './stubs'

describe('NetworksService', () => {
  let service: NetworksService
  let networksRepository: NetworksRepository
  let cacheManager: Cache

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NetworksService,
        {
          provide: NetworksRepository,
          useValue: {
            getNetworks: jest.fn(),
            getNetwork: jest.fn(),
            createNetwork: jest.fn(),
          }
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<NetworksService>(NetworksService)
    networksRepository = module.get<NetworksRepository>(NetworksRepository)
    cacheManager = module.get<Cache>(CACHE_MANAGER)

    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getNetworkIdByName', () => {
    describe('when getNetworkIdByName is called', () => {
      const networkName: string = 'testNetwork'
      const redisKey: string = `${REDIS_KEY_NETWORK}?networkName=${networkName}`

      test('then it should call cacheManager.get and return cached networkId', async () => {
        jest.spyOn(cacheManager, 'get').mockResolvedValue(`${networkCachedStub(networkName)}`)

        const networkId: number = await service.getNetworkIdByName(networkName)

        expect(cacheManager.get).toBeCalledWith(redisKey)
        expect(networksRepository.getNetworks).not.toBeCalled()
        expect(networkId).toEqual(networkStub(networkName).id)
      })

      test('then it should call networksRepository.getNetworks and return networkId from the repository if no network is found in redis', async () => {
        jest.spyOn(networksRepository, 'getNetwork').mockResolvedValue(networkStub(networkName))
        jest.spyOn(cacheManager, 'get').mockResolvedValue(undefined)

        const networkId: number = await service.getNetworkIdByName(networkName)

        expect(networksRepository.getNetwork).toBeCalledWith({ where: { name: networkName } })
        expect(networkId).toEqual(networkStub(networkName).id)
      })

      test('then it should call networksRepository.createNetwork and return networkId if no network was returned from the networksRepository.getNetwork', async () => {
        jest.spyOn(networksRepository, 'getNetwork').mockResolvedValue(null)
        jest.spyOn(networksRepository, 'createNetwork').mockResolvedValue(networkStub(networkName))
        jest.spyOn(cacheManager, 'get').mockResolvedValue(undefined)

        const networkId: number = await service.getNetworkIdByName(networkName)

        expect(networksRepository.createNetwork).toBeCalledWith({ data: { name: networkName } })
        expect(networkId).toEqual(networkStub(networkName).id)
      })
    })
  })

  describe('getNetworks', () => {
    describe('when getNetworks is called', () => {
      const networkName: string = 'testNetwork'
      const redisKey: string = REDIS_KEY_NETWORKS

      test('then it should call cacheManager.get and return cachedNetworks', async () => {
        jest.spyOn(cacheManager, 'get').mockResolvedValue(`[${networkCachedStub(networkName)}]`)

        const networks: Network[] = await service.getNetworks()

        expect(cacheManager.get).toBeCalledWith(redisKey)
        expect(networksRepository.getNetworks).not.toBeCalled()
        expect(networks).toEqual([networkStub(networkName)])
      })

      test('then it should call networksRepository.getNetworks and return networks from the repository if no network is found in redis', async () => {
        jest.spyOn(networksRepository, 'getNetworks').mockResolvedValue([networkStub(networkName)])
        jest.spyOn(cacheManager, 'get').mockResolvedValue(undefined)

        const networks: Network[] = await service.getNetworks()

        expect(networksRepository.getNetworks).toBeCalled()
        expect(networks).toEqual([networkStub(networkName)])
      })

      test('then it should throw a NotFoundException if no network was returned from the NetworksRepository', async () => {
        jest.spyOn(networksRepository, 'getNetworks').mockResolvedValue([])
        jest.spyOn(cacheManager, 'get').mockResolvedValue(undefined)

        await expect(service.getNetworks()).rejects.toThrowError(NotFoundException)
      })
    })
  })
})