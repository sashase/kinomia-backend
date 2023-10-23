import { Module } from '@nestjs/common'
import { CinemasRepository } from './cinemas.repository'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  providers: [CinemasRepository],
  exports: [CinemasRepository]
})
export class CinemasModule { }
