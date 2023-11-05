import { Module } from '@nestjs/common'
import { MoviesService } from './movies.service'
import { PrismaModule } from '../prisma/prisma.module'
import { AxiosModule } from '../axios/axios.module'
import { MoviesRepository } from './movies.repository'

@Module({
  imports: [PrismaModule, AxiosModule],
  providers: [MoviesService, MoviesRepository],
  exports: [MoviesService, MoviesRepository]
})
export class MoviesModule { }
