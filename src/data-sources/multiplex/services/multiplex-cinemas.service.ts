import { Injectable } from '@nestjs/common'
import { HTMLElement } from 'node-html-parser'
import { CinemasService } from '../../../cinemas/cinemas.service'
import { CreateCinemaDto } from '../../../cinemas/dtos'
import { ScraperService } from '../../scraper.service'

@Injectable()
export class MultiplexCinemasService {
  constructor(private readonly scraperService: ScraperService, private readonly cinemasService: CinemasService) { }

  async processCity(city: HTMLElement, networkId: number): Promise<void> {
    const cityName = city.attributes['data-cityname']

    const cinemas = city.querySelectorAll('.cinema')

    await Promise.all(cinemas.map(async (cinema) => {
      const id = parseInt(cinema.attributes['data-id'])
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
    const root = await this.scraperService.getRoot(url)

    const citiesList = root.querySelectorAll('.rm_clist')

    await Promise.all(citiesList.map(async (city) => {
      await this.processCity(city, networkId)
    }))
  }
}