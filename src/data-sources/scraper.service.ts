import { BadGatewayException, HttpException, Injectable, InternalServerErrorException } from '@nestjs/common'
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { HTMLElement, parse } from 'node-html-parser'
import { MULTIPLEX_NETWORK_NAME, OSKAR_NETWORK_NAME } from '../networks/constants'

@Injectable()
export class ScraperService {
  constructor() { }

  async getHtml(url: string, config: AxiosRequestConfig): Promise<any> {
    const { data } = await axios
      .get(url, config)
      .then((res: AxiosResponse) => Promise.resolve(res))
      .catch((error: AxiosError) => {
        console.log(error)
        throw new HttpException(error.response.statusText, error.response.status)
      })
    return data
  }

  async getRoot(url: string, network: string, internalCinemaId?: string, dateStart?: string, dateEnd?: string): Promise<HTMLElement> {
    switch (network) {
      case MULTIPLEX_NETWORK_NAME: {
        const config = { headers: { Cookie: `cinemaN=${internalCinemaId}` } }
        const html = await this.getHtml(url, config)
        return parse(html)
      }

      case OSKAR_NETWORK_NAME: {
        if (!dateStart) throw new InternalServerErrorException('dateStart is undefined | Oskar | Scraper service')

        const requestUrl: string = `${url}/${internalCinemaId}/sessions/ajax?date_select=${dateStart}`
        const html = await this.getHtml(requestUrl, {})

        if (!html.filter_results) throw new BadGatewayException('Bad response from the external resource | Oskar | Scraper Service')

        return parse(html.filter_results)
      }
      default:
        throw new InternalServerErrorException('network has unprocessable value | Scraper service')
    }
  }
}