import { ApiProperty } from '@nestjs/swagger'

export class Showtime {
  @ApiProperty({
    example: 1764,
    description: 'ID of the showtime'
  })
  id: number

  @ApiProperty({
    example: 73071,
    description: 'ID of the showtime within a specific cinema or network'
  })
  internal_showtime_id: number

  @ApiProperty({
    example: '2023-11-09T12:00:00.000Z',
    description: 'Date and time of the showtime in ISO 8601 format'
  })
  date: string

  @ApiProperty({
    example: '3D SDH',
    description: 'Format of the showtime'
  })
  format: string

  @ApiProperty({
    example: 180,
    description: 'Price of the showtime'
  })
  price: number

  @ApiProperty({
    example: 'https://new.multiplex.ua/order/cinema/0000000005/session/73071',
    description: 'Order link of the showtime'
  })
  order_link: string

  @ApiProperty({
    example: 15,
    description: 'ID of the cinema associated with the showtime'
  })
  cinema_id: number

  @ApiProperty({
    example: 901362,
    description: 'ID of the movie as per TMDB'
  })
  movie_id: number

  @ApiProperty({
    example: 'Тролі: Знову разом',
    description: 'Title of the movie'
  })
  movie_title: string
}