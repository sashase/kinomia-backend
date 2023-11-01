import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { NetworksRepository } from './networks.repository'
import { NetworksService } from './networks.service'

@Module({
  imports: [PrismaModule],
  providers: [NetworksService, NetworksRepository],
  exports: [NetworksService, NetworksRepository]
})
export class NetworksModule { }
