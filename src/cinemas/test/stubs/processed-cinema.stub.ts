import { CreateCinemaDto } from '../../dtos'

export const processedCinemaStub = (): CreateCinemaDto => {
  return {
    internal_cinema_id: '0000000017',
    name: 'Lavina IMAX Лазер',
    city: 'Київ',
    address: 'вул. Берковецька, 6Д'
  }
}