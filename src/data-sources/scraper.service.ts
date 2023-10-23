import { Injectable } from '@nestjs/common'
import axios from 'axios'
import { HTMLElement, parse } from 'node-html-parser'

@Injectable()
export class ScraperService {
  constructor() { }

  async getRoot(url: string, cinemaId?: number): Promise<HTMLElement> {
    let cookie: string
    if (cinemaId) cookie = `cinemaN=${cinemaId.toString().padStart(10, '0')}`

    const config = { headers: { Cookie: cookie ?? '' } }

    const { data } = await axios.get(url, config)
    const root = parse(data)

    return root
  }
}