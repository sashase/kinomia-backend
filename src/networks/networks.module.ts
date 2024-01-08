import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { NetworksRepository } from './networks.repository'
import { NetworksService } from './networks.service'
import { NetworksController } from './networks.controller'

@Module({
  imports: [PrismaModule],
  providers: [NetworksService, NetworksRepository],
  exports: [NetworksService, NetworksRepository],
  controllers: [NetworksController]
})
export class NetworksModule { }
