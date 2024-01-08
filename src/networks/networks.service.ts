import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { Network } from '@prisma/client'
import { REDIS_KEY_NETWORK, REDIS_KEY_NETWORKS } from '../common/constants'
import { NetworksRepository } from './networks.repository'

@Injectable()
export class NetworksService {
  constructor(
    private readonly networksRepository: NetworksRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) { }

  async getNetworkIdByName(networkName: string): Promise<number> {
    const redisKey: string = `${REDIS_KEY_NETWORK}?networkName=${networkName}`

    const cachedNetwork: string = await this.cacheManager.get(redisKey)

    if (cachedNetwork) {
      const parsedNetwork: Network = JSON.parse(cachedNetwork)
      return parsedNetwork.id
    }

    const network = await this.networksRepository.getNetwork({ where: { name: networkName } })

    if (!network) {
      const createdNetwork = await this.networksRepository.createNetwork({ data: { name: networkName } })
      return createdNetwork.id
    }

    return network.id
  }

  async getNetworks(): Promise<Network[]> {
    const redisKey: string = REDIS_KEY_NETWORKS

    const cachedNetworks: string = await this.cacheManager.get(redisKey)

    if (cachedNetworks) {
      const parsedNetworks: Network[] = JSON.parse(cachedNetworks)
      return parsedNetworks
    }

    const networks: Network[] = await this.networksRepository.getNetworks({})

    if (!networks.length) throw new NotFoundException()

    const redisValue: string = JSON.stringify(networks)

    await this.cacheManager.set(redisKey, redisValue)

    return networks
  }
}
