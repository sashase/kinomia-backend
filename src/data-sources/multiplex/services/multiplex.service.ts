import { Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cinema } from '@prisma/client'
import { DataSourceService } from '../../../interfaces/data-sources'
import { NetworksService } from '../../../networks/networks.service'
import { CinemasRepository } from '../../../cinemas/cinemas.repository'
import { MultiplexCinemasService } from '../services/multiplex-cinemas.service'
import { MultiplexShowtimesService } from '../services/multiplex-showtimes.service'

@Injectable()
export class MultiplexService implements DataSourceService {
  constructor(private readonly configService: ConfigService,
    private readonly networksService: NetworksService,
    private readonly cinemasRepository: CinemasRepository,
    private readonly multiplexCinemasService: MultiplexCinemasService,
    private readonly multiplexShowtimesService: MultiplexShowtimesService) { }

  async updateData(): Promise<{ message: string, code: number }> {
    const networkName: string = 'multiplex'
    const networkId: number = await this.networksService.getNetworkIdByName(networkName)
    const url: string = this.configService.get('dataSources.multiplexUrl', { infer: true })

    await this.multiplexCinemasService.updateCinemas(url, networkId)

    const cinemas: Cinema[] = await this.cinemasRepository.getCinemas({ where: { network_id: networkId } })

    if (!cinemas) throw new NotFoundException('Cinemas not found')

    await Promise.all(cinemas.map(async (cinema) => {
      await this.multiplexShowtimesService.updateShowtimes(url, cinema.id, cinema.internal_cinema_id)
    }))

    return {
      message: 'Multiplex Data Successfully Updated',
      code: 200
    }
  }
}