import { Cinema } from '@prisma/client'

export const cinemasStub = (): Cinema[] => {
  return [
    {
      id: 123,
      internal_cinema_id: '1',
      name: 'Lavina IMAX Лазер',
      city_id: 1,
      address: 'вул. Берковецька, 6Д',
      network_id: 3,
    },
    {
      id: 124,
      internal_cinema_id: '2',
      name: 'Respublika Park IMAX',
      city_id: 1,
      address: 'Кільцева дорога, 1',
      network_id: 3,
    }
  ]
}