import { Controller, Get } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger'
import { CitiesService } from './cities.service'
import { City } from './entities'

@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) { }

  @ApiTags('Cities')
  @ApiOperation({ summary: 'Get all cities' })
  @ApiOkResponse({ description: 'Found cities', type: [City] })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @Get()
  getCities() {
    return this.citiesService.getCities()
  }
}
