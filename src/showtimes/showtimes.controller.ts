import { Controller, Get, Query } from '@nestjs/common'
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { ShowtimesService } from './showtimes.service'
import { GetShowtimesDto } from './dtos'
import { Showtime } from './entities'

@Controller('showtimes')
export class ShowtimesController {
  constructor(private readonly showtimesService: ShowtimesService) { }

  @ApiTags('Showtimes')
  @ApiOperation({ summary: 'Filter and get showtimes' })
  @ApiOkResponse({ description: 'Found showtimes', type: [Showtime] })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @Get()
  getShowtimes(@Query() dto: GetShowtimesDto) {
    return this.showtimesService.getShowtimes(dto)
  }
}
