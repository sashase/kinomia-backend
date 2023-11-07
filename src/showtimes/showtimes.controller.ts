import { Controller, Get, Query } from '@nestjs/common'
import { ShowtimesService } from './showtimes.service'
import { GetShowtimesDto } from './dtos'

@Controller('showtimes')
export class ShowtimesController {
  constructor(private readonly showtimesService: ShowtimesService) { }

  @Get()
  getShowtimes(@Query() dto: GetShowtimesDto) {
    return this.showtimesService.getShowtimes(dto)
  }
}
