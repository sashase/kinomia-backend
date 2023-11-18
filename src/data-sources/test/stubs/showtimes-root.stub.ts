import { HTMLElement, parse } from 'node-html-parser'
import { MULTIPLEX_NETWORK_NAME, OSKAR_NETWORK_NAME } from '../../../networks/constants'

export const showtimesRootStub = (networkName: string): HTMLElement => {
  let html: string
  switch (networkName) {
    case MULTIPLEX_NETWORK_NAME:
      html = '<html><body><div class="mp_poster"></div><div class="mp_poster"></div><div class="mp_poster"></div><div class="mp_poster"></div></body></html>'
      break

    case OSKAR_NETWORK_NAME:
      html = '<html><body><div class="filter-result__item"></div><div class="filter-result__item"></div><div class="filter-result__item"></div><div class="filter-result__item"></div></body></html>'
      break

    default:
      html = null
      break
  }
  if (!html) return null
  return parse(html)
}
