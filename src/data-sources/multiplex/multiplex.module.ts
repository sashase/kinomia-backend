import { Module } from '@nestjs/common'
import { MultiplexService } from './services/multiplex.service'
import { DataSourceModule } from '../data-sources.module'
import { NetworksModule } from '../../networks/networks.module'
import { CinemasModule } from '../../cinemas/cinemas.module'
import { ShowtimesModule } from '../../showtimes/showtimes.module'
import { MoviesModule } from '../../movies/movies.module'
import { MultiplexCinemasService } from './services/multiplex-cinemas.service'
import { MultiplexShowtimesService } from './services/multiplex-showtimes.service'

@Module({
  imports: [NetworksModule, CinemasModule, ShowtimesModule, DataSourceModule, MoviesModule],
  providers: [MultiplexService, MultiplexCinemasService, MultiplexShowtimesService],
  exports: [MultiplexService]
})
export class MultiplexModule { }
