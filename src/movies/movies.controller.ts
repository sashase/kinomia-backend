import { Controller, Get } from '@nestjs/common'
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { MoviesService } from './movies.service'
import { Movie } from './entities'

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) { }

  @ApiTags('Movies')
  @ApiOperation({ summary: 'Get all playing movies' })
  @ApiOkResponse({ description: 'Found movies', type: [Movie] })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @Get()
  getMovies() {
    return this.moviesService.getMovies()
  }
}
