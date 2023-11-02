import { Module } from '@nestjs/common'
import { MoviesService } from './movies.service'
import { PrismaModule } from 'src/prisma/prisma.module'
import { MoviesRepository } from './movies.repository'

@Module({
  imports: [PrismaModule],
  providers: [MoviesService, MoviesRepository],
  exports: [MoviesService, MoviesRepository]
})
export class MoviesModule { }
