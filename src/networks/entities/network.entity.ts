import { ApiProperty } from "@nestjs/swagger"

export class Network {
  @ApiProperty({
    example: 6,
    description: 'ID of the network'
  })
  id: number

  @ApiProperty({
    example: 'multiplex',
    description: 'Name of the network'
  })
  name: string
}