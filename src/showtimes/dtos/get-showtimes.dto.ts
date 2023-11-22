import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsOptional, IsString } from 'class-validator'
import { Transform } from 'class-transformer'

export class GetShowtimesDto {

  @ApiProperty({ example: 1764, description: 'ID of the showtime', required: false })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  id?: number

  @ApiProperty({ example: '3D SDH', description: 'Format of the showtime', required: false })
  @IsString()
  @IsOptional()
  format?: string

  @ApiProperty({ example: 180, description: 'Price of the showtime', required: false })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  price?: number

  @ApiProperty({ example: 15, description: 'ID of the cinema associated with the showtime', required: false })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  cinema_id?: number

  @ApiProperty({ example: 901362, description: 'ID of the movie as per TMDB', required: false })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  movie_id?: number

  @ApiProperty({ example: 'Тролі: Знову разом', description: 'Title of the movie', required: false })
  @IsString()
  @IsOptional()
  movie_title?: string
}