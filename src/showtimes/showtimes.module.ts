import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { CinemasModule } from '../cinemas/cinemas.module'
import { ShowtimesController } from './showtimes.controller'
import { ShowtimesService } from './showtimes.service'
import { ShowtimesRepository } from './showtimes.repository'

@Module({
  imports: [PrismaModule, CinemasModule],
  controllers: [ShowtimesController],
  providers: [ShowtimesRepository, ShowtimesService],
  exports: [ShowtimesService, ShowtimesRepository]
})
export class ShowtimesModule { }
