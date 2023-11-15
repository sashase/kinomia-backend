import { ApiProperty } from '@nestjs/swagger'

export class Movie {
  @ApiProperty({
    example: 1,
    description: 'ID of the movie',
  })
  id: number

  @ApiProperty({
    example: 'Inception',
    description: 'Title of the movie in English',
  })
  title: string

  @ApiProperty({
    example: 'Початок',
    description: 'Title of the movie in Ukrainian',
  })
  title_ua: string

  @ApiProperty({
    example: 'A mind-bending thriller',
    description: 'Overview of the movie',
  })
  overview: string

  @ApiProperty({
    example: '/path/to/backdrop.jpg',
    description: 'Backdrop path of the movie',
  })
  backdrop_path: string

  @ApiProperty({
    example: '/path/to/poster.jpg',
    description: 'Poster path of the movie',
  })
  poster_path: string

  @ApiProperty({
    example: 8.5,
    description: 'Rating of the movie',
  })
  rating: number
}