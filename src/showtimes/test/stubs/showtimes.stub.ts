import { Showtime } from '@prisma/client'

export const showtimesStub = (): Showtime[] => {
  return [
    {
      id: 1764,
      internal_showtime_id: 73071,
      date: new Date('2023-11-09T12:00:00.000Z'),
      format: '3D SDH',
      price: 180,
      order_link: 'https://new.multiplex.ua/order/cinema/0000000005/session/73071',
      cinema_id: 15,
      movie_id: 901362,
      movie_title: 'Тролі: Знову разом'
    }
  ]
}

