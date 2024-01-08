import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger'
import { CinemasService } from './cinemas.service'
import { GetCinemasDto } from './dtos'
import { Cinema } from './entities'

@Controller('cinemas')
export class CinemasController {
  constructor(private readonly cinemasService: CinemasService) { }

  @ApiTags('Cinemas')
  @ApiOperation({ summary: 'Filter and get cinemas' })
  @ApiOkResponse({ description: 'Found cinemas', type: [Cinema] })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @Get()
  getCinemas(@Query() dto: GetCinemasDto) {
    return this.cinemasService.getCinemas(dto)
  }
}
