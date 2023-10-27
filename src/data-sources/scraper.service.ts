import { HttpException, Injectable } from '@nestjs/common'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { HTMLElement, parse } from 'node-html-parser'

@Injectable()
export class ScraperService {
  constructor() { }

  async getRoot(url: string, network?: string, internalCinemaId?: string): Promise<HTMLElement> {
    let cookie: string

    switch (network) {
      case 'multiplex':
        if (internalCinemaId) cookie = `cinemaN=${internalCinemaId.padStart(10, '0')}`
        break

      default:
        cookie = ''
        break
    }

    const config = { headers: { Cookie: cookie ?? '' } }

    const { data } = await axios
      .get(url, config)
      .then((res: AxiosResponse) => Promise.resolve(res))
      .catch((error: AxiosError) => {
        console.log(error)
        throw new HttpException(error.response.statusText, error.response.status)
      })

    const root = parse(data)

    return root
  }
}