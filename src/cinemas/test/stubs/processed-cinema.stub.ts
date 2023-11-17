import { MULTIPLEX_NETWORK_NAME, OSKAR_NETWORK_NAME } from '../../../networks/constants'
import { CreateCinemaDto } from '../../dtos'

export const processedCinemaStub = (networkName: string): CreateCinemaDto => {
  switch (networkName) {
    case MULTIPLEX_NETWORK_NAME:
      return {
        networkId: 1,
        cityId: 1,
        internal_cinema_id: '0000000017',
        name: 'Lavina IMAX Лазер',
        address: 'вул. Берковецька, 6Д'
      }

    case OSKAR_NETWORK_NAME:
      return {
        networkId: 1,
        cityId: 1,
        name: 'Oskar Gulliver',
        internal_cinema_id: 'gulliver',
        address: 'пл. Спортивна, 1а, 7 поверх'
      }
    default:
      return null
  }
}