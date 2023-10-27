import { Injectable, NotFoundException } from '@nestjs/common'
import { HTMLElement } from 'node-html-parser'
import { DataSourceCinemasService } from '../../../interfaces/data-sources'
import { CinemasService } from '../../../cinemas/cinemas.service'
import { CreateCinemaDto } from '../../../cinemas/dtos'
import { ScraperService } from '../../scraper.service'

@Injectable()
export class MultiplexCinemasService implements DataSourceCinemasService {
  constructor(private readonly scraperService: ScraperService, private readonly cinemasService: CinemasService) { }

  private networkId: number

  async processCity(city: HTMLElement): Promise<void> {
    const cityName = city.attributes['data-cityname']

    const cinemas = city.querySelectorAll('.cinema')

    if (!cinemas.length) throw new NotFoundException('No cinemas found on the page | Multiplex')

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

      await this.cinemasService.validateAndCreateCinema(processedCinema, this.networkId)
    }))
  }

  async updateCinemas(url: string, networkId: number): Promise<void> {
    this.networkId = networkId

    const root = await this.scraperService.getRoot(url)

    const citiesList = root.querySelectorAll('.rm_clist')

    if (!citiesList.length) throw new NotFoundException('No city found on the page | Multiplex')

    await Promise.all(citiesList.map(async (city) => {
      await this.processCity(city)
    }))
  }
}