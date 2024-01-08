import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsOptional } from 'class-validator'
import { Transform } from 'class-transformer'

export class GetCinemasDto {

  @ApiProperty({ example: 1, description: 'ID of the cinema', required: false })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  id?: number

  @ApiProperty({ example: 1, description: 'ID of the network associated with the cinema', required: false })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  network_id?: number

  @ApiProperty({ example: 1, description: 'ID of the city associated with the cinema', required: false })
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  city_id?: number
}