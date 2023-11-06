import { Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Cinema } from '@prisma/client'
import { MULTIPLEX_URL_PROPERTY_PATH } from '../../../config/constants'
import { NetworksService } from '../../../networks/networks.service'
import { MULTIPLEX_NETWORK_NAME } from '../../../networks/constants'
import { CinemasRepository } from '../../../cinemas/cinemas.repository'
import { DataSourceService, SourceServiceResponse } from '../../interfaces'
import { MultiplexCinemasService } from '../services/multiplex-cinemas.service'
import { MultiplexShowtimesService } from '../services/multiplex-showtimes.service'

@Injectable()
export class MultiplexService implements DataSourceService {
  constructor(private readonly configService: ConfigService,
    private readonly networksService: NetworksService,
    private readonly cinemasRepository: CinemasRepository,
    private readonly multiplexCinemasService: MultiplexCinemasService,
    private readonly multiplexShowtimesService: MultiplexShowtimesService) { }

  private readonly networkName: string = MULTIPLEX_NETWORK_NAME

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async updateData(): Promise<SourceServiceResponse> {
    const networkId: number = await this.networksService.getNetworkIdByName(this.networkName)
    const url: string = this.configService.get(MULTIPLEX_URL_PROPERTY_PATH, { infer: true })

    await this.multiplexCinemasService.updateCinemas(url, networkId)

    const cinemas: Cinema[] = await this.cinemasRepository.getCinemas({ where: { network_id: networkId } })

    if (!cinemas) throw new NotFoundException('Cinemas not found')

    for (let i = 0; i < cinemas.length; i++) {
      await this.multiplexShowtimesService.updateShowtimes(url, cinemas[i].id, cinemas[i].internal_cinema_id)
    }

    return {
      message: 'Multiplex Data Successfully Updated',
      code: 200
    }
  }
}