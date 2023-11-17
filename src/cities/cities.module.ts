import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { CitiesController } from './cities.controller'
import { CitiesService } from './cities.service'
import { CitiesRepository } from './cities.repository'

@Module({
  imports: [PrismaModule],
  controllers: [CitiesController],
  providers: [CitiesService, CitiesRepository],
  exports: [CitiesService, CitiesRepository]
})
export class CitiesModule { }
