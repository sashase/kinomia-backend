import { HTMLElement, parse } from 'node-html-parser'

export const showtimesRootStub = (networkName: string): HTMLElement => {
  let html: string
  switch (networkName) {
    case 'multiplex':
      html = '<html><body><div class="mp_poster"></div><div class="mp_poster"></div><div class="mp_poster"></div><div class="mp_poster"></div></body></html>'
      break

    case 'oskar':
      html = '<html><body><div class="filter-result__item"></div><div class="filter-result__item"></div><div class="filter-result__item"></div><div class="filter-result__item"></div></body></html>'
      break

    default:
      html = null
      break
  }
  if (!html) return null
  return parse(html)
}
