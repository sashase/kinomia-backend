import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Cinema } from '@prisma/client'
import { DataSourceService } from '../../../interfaces/data-sources'
import { NetworksService } from '../../../networks/networks.service'
import { CinemasRepository } from '../../../cinemas/cinemas.repository'
import { OskarCinemasService } from './oskar-cinemas.service'
import { OskarShowtimesService } from './oskar-showtimes.service'
import { getDates } from '../utils'

@Injectable()
export class OskarService implements DataSourceService {
  constructor(private readonly configService: ConfigService,
    private readonly networksService: NetworksService,
    private readonly cinemasRepository: CinemasRepository,
    private readonly oskarCinemasService: OskarCinemasService,
    private readonly oskarShowtimesService: OskarShowtimesService,
  ) { }

  private readonly networkName: string = 'oskar'

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async updateData(): Promise<{ message: string, code: number }> {
    const networkId: number = await this.networksService.getNetworkIdByName(this.networkName)
    const url: string = this.configService.get('dataSources.oskarUrl', { infer: true })

    await this.oskarCinemasService.updateCinemas(networkId)

    const cinemas: Cinema[] = await this.cinemasRepository.getCinemas({ where: { network_id: networkId } })

    if (!cinemas) throw new NotFoundException('Cinemas not found')

    // Array of dates in format 'yyyy-mm-dd' until next Wednesday
    const dates: string[] = getDates()

    if (!dates || !dates.length) throw new InternalServerErrorException('Dates array cannot be generated')

    await Promise.all(cinemas.map(async (cinema) => {
      await dates.map(async (date) => {
        await this.oskarShowtimesService.updateShowtimes(url, cinema.id, cinema.internal_cinema_id, date)
      })
    }))

    return {
      message: 'Oskar Data Successfully Updated',
      code: 200
    }
  }
}