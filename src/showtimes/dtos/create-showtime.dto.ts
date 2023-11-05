import { Movie } from "@prisma/client"

export class CreateShowtimeDto {
  internal_showtime_id: number
  date: Date
  format?: string
  price?: number
  order_link?: string
  movie: Movie
}