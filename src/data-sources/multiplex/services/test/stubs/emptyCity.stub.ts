import { HTMLElement, parse } from 'node-html-parser'

export const emptyCityStub = (): HTMLElement => {
  const html: string = '<html><body><div class="rm_clist" style = "display: block;" data-cityname="Київ" ></div></body></html>'
  const root = parse(html)
  const city = root.querySelector('.rm_clist')
  return city
}

