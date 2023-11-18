import { ApiProperty } from '@nestjs/swagger'

export class City {
  @ApiProperty({
    example: 1,
    description: 'ID of the city'
  })
  id: number

  @ApiProperty({
    example: 'Київ',
    description: 'Name of the city'
  })
  name: string
}