import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
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

  async updateData(): Promise<{ message: string, code: number }> {
    try {
      const networkId: number = await this.networksService.getNetworkIdByName(this.networkName)
      const url: string = this.configService.get('dataSources.oskarUrl', { infer: true })

      await this.oskarCinemasService.updateCinemas(networkId)

      const cinemas: Cinema[] = await this.cinemasRepository.getCinemas({ where: { network_id: networkId } })

      // Array of dates in format 'yyyy-mm-dd' until next Wednesday
      const dates: string[] = getDates()

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
    catch (error) {
      console.log(error)
      throw new InternalServerErrorException(error)
    }
  }
}