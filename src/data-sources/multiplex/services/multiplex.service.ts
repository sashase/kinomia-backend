import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cinema } from '@prisma/client'
import { CinemasRepository } from '../../../cinemas/cinemas.repository'
import { MultiplexCinemasService } from '../services/multiplex-cinemas.service'
import { MultiplexShowtimesService } from '../services/multiplex-showtimes.service'

@Injectable()
export class MultiplexService {
  constructor(private readonly configService: ConfigService, private readonly cinemasRepository: CinemasRepository, private readonly multiplexCinemasService: MultiplexCinemasService, private readonly multiplexShowtimesService: MultiplexShowtimesService) { }

  async updateData(): Promise<{ message: string, code: number }> {
    try {
      const url = this.configService.get('dataSources.multiplexUrl', { infer: true })

      await this.multiplexCinemasService.updateCinemas(url)

      const cinemas: Cinema[] = await this.cinemasRepository.getCinemas({ where: { network: 'multiplex' } })

      await Promise.all(cinemas.map(async (cinema) => {
        await this.multiplexShowtimesService.updateShowtimes(url, cinema.id)
      }))

      return {
        message: 'Multiplex Data Successfully Updated',
        code: 200
      }
    }
    catch (error) {
      console.log(error)
      throw new InternalServerErrorException(error)
    }
  }
}