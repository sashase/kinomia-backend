import { Injectable } from '@nestjs/common'
import { NetworksRepository } from './networks.repository'

@Injectable()
export class NetworksService {
  constructor(private readonly networksRepository: NetworksRepository) { }

  async getNetworkIdByName(networkName: string): Promise<number> {
    const network = await this.networksRepository.getNetwork({ where: { name: networkName } })

    if (!network) {
      const createdNetwork = await this.networksRepository.createNetwork({ data: { name: networkName } })
      return createdNetwork.id
    }

    return network.id
  }
}
