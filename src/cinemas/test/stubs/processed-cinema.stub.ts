import { CreateCinemaDto } from '../../dtos'

export const processedCinemaStub = (networkName: string): CreateCinemaDto => {
  switch (networkName) {
    case 'multiplex':
      return {
        internal_cinema_id: '0000000017',
        name: 'Lavina IMAX Лазер',
        city: 'Київ',
        address: 'вул. Берковецька, 6Д'
      }

    case 'oskar':
      return {
        name: 'Oskar Gulliver',
        internal_cinema_id: 'gulliver',
        city: 'Київ',
        address: 'пл. Спортивна, 1а, 7 поверх'
      }
    default:
      return null
  }
}