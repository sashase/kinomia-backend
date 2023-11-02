import { Injectable } from '@nestjs/common'
import { MoviesRepository } from './movies.repository'

@Injectable()
export class MoviesService {
  constructor(private readonly moviesRepository: MoviesRepository) { }

}
