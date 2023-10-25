import { Injectable } from '@nestjs/common'
import { Cinema } from '@prisma/client'
import { HTMLElement } from 'node-html-parser'
import { ScraperService } from '../../scraper.service'
import { CinemasRepository } from '../../../cinemas/cinemas.repository'

@Injectable()
export class MultiplexCinemasService {
  constructor(private readonly scraperService: ScraperService, private readonly cinemasRepository: CinemasRepository) { }

  async processCity(city: HTMLElement): Promise<void> {
    const cityName = city.attributes['data-cityname']

    const cinemas = city.querySelectorAll('.cinema')

    await Promise.all(cinemas.map(async (cinema) => {
      const id = parseInt(cinema.attributes['data-id'])
      const name = cinema.attributes['data-name']
      const address = cinema.querySelector('p.address').text

      const cinemaAlreadyExists = await this.cinemasRepository.getCinema({ where: { id } })
      if (cinemaAlreadyExists) return

      const processedCinema: Cinema = {
        id,
        name,
        network: 'multiplex',
        city: cityName,
        address
      }

      await this.cinemasRepository.createCinema({ data: processedCinema })
    }))
  }


  async updateCinemas(url: string): Promise<void> {
    const root = await this.scraperService.getRoot(url)

    const citiesList = root.querySelectorAll('.rm_clist')

    await Promise.all(citiesList.map(async (city) => {
      await this.processCity(city)
    }))
  }
}