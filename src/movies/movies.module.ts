import { Module } from '@nestjs/common'
import { MoviesService } from './movies.service'
import { PrismaModule } from '../prisma/prisma.module'
import { AxiosModule } from '../axios/axios.module'
import { MoviesController } from './movies.controller'
import { MoviesRepository } from './movies.repository'

@Module({
  imports: [PrismaModule, AxiosModule],
  controllers: [MoviesController],
  providers: [MoviesService, MoviesRepository],
  exports: [MoviesService, MoviesRepository]
})
export class MoviesModule { }
