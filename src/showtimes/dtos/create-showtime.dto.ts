export class CreateShowtimeDto {
  internal_showtime_id: number
  movie: string
  date: Date
  format?: string
  price?: number
  order_link?: string
  imdb_link?: string
}