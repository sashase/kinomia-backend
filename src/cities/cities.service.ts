import { Injectable } from '@nestjs/common'
import { CitiesRepository } from './cities.repository'

@Injectable()
export class CitiesService {
  constructor(private readonly citiesRepository: CitiesRepository) { }

}
