import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { CinemasModule } from '../cinemas/cinemas.module'
import { ShowtimesService } from './showtimes.service'
import { ShowtimesRepository } from './showtimes.repository'

@Module({
  imports: [PrismaModule, CinemasModule],
  providers: [ShowtimesRepository, ShowtimesService],
  exports: [ShowtimesService, ShowtimesRepository]
})
export class ShowtimesModule { }
