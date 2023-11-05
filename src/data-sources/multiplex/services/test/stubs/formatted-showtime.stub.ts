import { CreateShowtimeDto } from '../../../../../showtimes/dtos'
import { movieStub } from '../../../../../movies/test/stubs'

export const formattedShowtimeStub = (format?: string): CreateShowtimeDto => {
  switch (format) {
    case 'LUX':
      return {
        internal_showtime_id: 224146,
        date: new Date(2023, 11, 30, 12, 0, 0),
        format: 'LUX',
        price: 270,
        order_link: 'https://new.multiplex.ua/order/cinema/0000000017/session/224146',
        movie: movieStub()
      }

    default:
      return {
        internal_showtime_id: 224146,
        date: new Date(2023, 11, 30, 12, 0, 0),
        format: '',
        price: 170,
        order_link: 'https://new.multiplex.ua/order/cinema/0000000017/session/224146',
        movie: movieStub()
      }
  }
}

