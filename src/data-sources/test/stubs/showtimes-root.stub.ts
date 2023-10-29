import { HTMLElement, parse } from 'node-html-parser'

export const showtimesRootStub = (): HTMLElement => {
  const html: string = '<html><body><div class="mp_poster"></div><div class="mp_poster"></div><div class="mp_poster"></div><div class="mp_poster"></div></body></html>'
  return parse(html)
}
