import { HTMLElement } from 'node-html-parser'

export const filterShowtimes = (showtimes: HTMLElement[]): HTMLElement[] => {
  /*
      Filtering showtimes, 
      we do not want to have showtimes that are sold out or showtimes with the 'buy_closest' class, 
      those are duplicates and made only for UI/UX.
      As well as showtimes without 'data-id' attribute.
  */
  const filteredShowtimes = Array.from(showtimes).filter((showtime) => {
    const classes = showtime.getAttribute('class').split(' ')
    const hasDataId = showtime.getAttribute('data-id') !== null

    return !classes.includes('buy_closest') && !classes.includes('locked') && hasDataId
  })
  return filteredShowtimes
}