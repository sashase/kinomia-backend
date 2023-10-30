import { Module } from '@nestjs/common'
import { NetworksModule } from '../../networks/networks.module'
import { CinemasModule } from '../../cinemas/cinemas.module'
import { ShowtimesModule } from '../../showtimes/showtimes.module'
import { DataSourceModule } from '../data-sources.module'
import { OskarService } from './services/oskar.service'
import { OskarCinemasService } from './services/oskar-cinemas.service'
import { OskarShowtimesService } from './services/oskar-showtimes.service'

@Module({
  imports: [NetworksModule, CinemasModule, ShowtimesModule, DataSourceModule],
  providers: [OskarService, OskarCinemasService, OskarShowtimesService],
  exports: [OskarService]
})
export class OskarModule { }
