export class CreateShowtimeDto {
  internal_showtime_id: number
  title: string
  date: Date
  movie_id: number
  format?: string
  price?: number
  order_link?: string
}