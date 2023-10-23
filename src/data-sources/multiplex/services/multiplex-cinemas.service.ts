import { Injectable } from '@nestjs/common'
import { Cinema } from '@prisma/client'
import { CinemasRepository } from '../../../cinemas/cinemas.repository'
import { ScraperService } from '../../scraper.service'
import { HTMLElement } from 'node-html-parser'

@Injectable()
export class MultiplexCinemasService {
  constructor(private readonly scraperService: ScraperService, private readonly cinemasRepository: CinemasRepository) { }

  async processCity(city: HTMLElement): Promise<void> {
    const cityName = city.attributes['data-cityname']

    const cinemas = city.querySelectorAll('.cinema')

    cinemas.forEach(async (cinema) => {
      const id = parseInt(cinema.attributes['data-id'])
      const name = cinema.attributes['data-name']
      const address = cinema.querySelector('p.address').text

      const cinemaAlreadyExists = await this.cinemasRepository.getCinema({ where: { id } })
      if (cinemaAlreadyExists) return

      const processedCinema: Cinema = {
        id,
        name,
        city: cityName,
        address
      }

      await this.cinemasRepository.createCinema({ data: processedCinema })
    })
  }


  async updateCinemas(url: string): Promise<void> {
    const root = await this.scraperService.getRoot(url)

    const citiesList = root.querySelectorAll('.rm_clist')

    citiesList.map(async (city) => {
      await this.processCity(city)
    })
  }
}