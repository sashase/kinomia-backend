import { HTMLElement, parse } from 'node-html-parser'

export const rootStub = (): HTMLElement => {
  const html: string = '<html><body><div class="rm_clist"></div><div class="rm_clist"></div><div class="rm_clist"></div><div class="rm_clist"></div></body></html>'
  return parse(html)
}

