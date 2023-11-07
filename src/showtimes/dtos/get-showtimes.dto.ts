import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator'
import { Transform, Type } from 'class-transformer'

export class GetShowtimesDto {
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  id?: number

  @IsString()
  @IsOptional()
  format?: string

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  price?: number

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  cinema_id?: number

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  movie_id?: number

  @IsString()
  @IsOptional()
  movie_title?: string

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  date?: Date
}