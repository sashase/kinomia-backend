import { ApiProperty } from "@nestjs/swagger"
import { Network } from "../../networks/entities"

export class Cinema {
  @ApiProperty({
    example: 113,
    description: 'ID of the cinema'
  })
  id: number

  @ApiProperty({
    example: '0000000017',
    description: 'Internal ID of the cinema'
  })
  internal_cinema_id: string

  @ApiProperty({
    example: 'Lavina IMAX Лазер',
    description: 'Name of the cinema'
  })
  name: string

  @ApiProperty({
    example: 'вул. Берковецька, 6Д',
    description: 'Address of the cinema'
  })
  address: string

  @ApiProperty({
    example: 61,
    description: 'ID of the city where the cinema is located'
  })
  city_id: number

  @ApiProperty({
    example: 6,
    description: 'ID of the network associated with the cinema'
  })
  network_id: number

  @ApiProperty({
    type: Network,
    description: 'Information about the network associated with the cinema'
  })
  network: Network
}