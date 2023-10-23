import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { ShowtimesRepository } from './showtimes.repository'

@Module({
  imports: [PrismaModule],
  providers: [ShowtimesRepository],
  exports: [ShowtimesRepository]
})
export class ShowtimesModule { }
