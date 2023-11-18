import { Injectable, NotFoundException } from '@nestjs/common'
import { HTMLElement } from 'node-html-parser'
import { MULTIPLEX_NETWORK_NAME } from '../../../networks/constants'
import { CinemasService } from '../../../cinemas/cinemas.service'
import { CreateCinemaDto } from '../../../cinemas/dtos'
import { ScraperService } from '../../scraper.service'
import { DataSourceCinemasService } from '../../interfaces'

@Injectable()
export class MultiplexCinemasService implements DataSourceCinemasService {
  constructor(private readonly scraperService: ScraperService, private readonly cinemasService: CinemasService) { }

  private readonly networkName: string = MULTIPLEX_NETWORK_NAME

  async processCity(city: HTMLElement, networkId: number): Promise<void> {
    const cityName = city.attributes['data-cityname']

    const cinemas = city.querySelectorAll('.cinema')

    await Promise.all(cinemas.map(async (cinema) => {
      const id = cinema.attributes['data-id']
      const name = cinema.attributes['data-name']
      const address = cinema.querySelector('p.address').text

      const processedCinema: CreateCinemaDto = {
        internal_cinema_id: id,
        name,
        city: cityName,
        address
      }

      await this.cinemasService.validateAndCreateCinema(processedCinema, networkId)
    }))
  }

  async updateCinemas(url: string, networkId: number): Promise<void> {
    const root = await this.scraperService.getRoot(url, this.networkName)

    const citiesList = root.querySelectorAll('.rm_clist')

    if (!citiesList.length) throw new NotFoundException('No city is found on the page | Multiplex')

    await Promise.all(citiesList.map(async (city) => {
      await this.processCity(city, networkId)
    }))
  }
}