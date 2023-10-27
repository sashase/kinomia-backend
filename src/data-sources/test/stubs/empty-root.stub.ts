import { HTMLElement, parse } from 'node-html-parser'

export const emptyRootStub = (): HTMLElement => {
  const html: string = ''
  return parse(html)
}