import { HTMLElement } from 'node-html-parser'

export const combineFormatElements = (format: HTMLElement): string => {
  const allFormats: string[] = []

  const formatsElements: HTMLElement[] = format.querySelectorAll(
    'span.bullet-description'
  )

  formatsElements.forEach((format) => {
    allFormats.push(format.text)
  })

  const combinedFormats: string = allFormats.join(' ')
  return combinedFormats
}