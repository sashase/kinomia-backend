import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { NetworksModule } from '../networks/networks.module'
import { CinemasService } from './cinemas.service'
import { CinemasRepository } from './cinemas.repository'

@Module({
  imports: [PrismaModule, NetworksModule],
  providers: [CinemasRepository, CinemasService],
  exports: [CinemasService, CinemasRepository]
})
export class CinemasModule { }
