import { Injectable } from '@nestjs/common'
import axios from 'axios'
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

    const { data } = await axios.get(url, config)
    const root = parse(data)

    return root
  }
}