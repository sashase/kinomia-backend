import { BadGatewayException, Injectable } from '@nestjs/common'
import { City } from '@prisma/client'
import { HTMLElement } from 'node-html-parser'
import { MULTIPLEX_NETWORK_NAME } from '../../../networks/constants'
import { CitiesRepository } from '../../../cities/cities.repository'
import { CinemasService } from '../../../cinemas/cinemas.service'
import { CreateCinemaDto } from '../../../cinemas/dtos'
import { ScraperService } from '../../scraper.service'
import { DataSourceCinemasService } from '../../interfaces'
import { MULTIPLEX_CINEMAS_BAD_GATEWAY } from '../../constants'

@Injectable()
export class MultiplexCinemasService implements DataSourceCinemasService {
  constructor(
    private readonly scraperService: ScraperService,
    private readonly cinemasService: CinemasService,
    private readonly citiesRepository: CitiesRepository
  ) { }

  private readonly networkName: string = MULTIPLEX_NETWORK_NAME

  async processCinema(cinema: HTMLElement, networkId: number, cityId: number) {
    const id = cinema.attributes['data-id']
    const name = cinema.attributes['data-name']
    const address = cinema.querySelector('p.address').text

    const processedCinema: CreateCinemaDto = {
      networkId,
      cityId,
      internal_cinema_id: id,
      name,
      address
    }

    await this.cinemasService.validateAndCreateCinema(processedCinema)
  }

  async processCity(cityElement: HTMLElement, networkId: number): Promise<void> {
    const cityName: string = cityElement.attributes['data-cityname']
    if (!cityName) throw new BadGatewayException(MULTIPLEX_CINEMAS_BAD_GATEWAY)

    let city: City = await this.citiesRepository.getCity({ where: { name: cityName } })

    if (!city) city = await this.citiesRepository.createCity({ data: { name: cityName } })

    const cinemas: HTMLElement[] = cityElement.querySelectorAll('.cinema')

    for (let i = 0; i < cinemas.length; i++) {
      await this.processCinema(cinemas[i], networkId, city.id)
    }
  }

  async updateCinemas(url: string, networkId: number): Promise<void> {
    const root = await this.scraperService.getRoot(url, this.networkName)

    const citiesList = root.querySelectorAll('.rm_clist')

    if (!citiesList.length) throw new BadGatewayException(MULTIPLEX_CINEMAS_BAD_GATEWAY)

    await Promise.all(citiesList.map(async (city) => {
      await this.processCity(city, networkId)
    }))
  }
}