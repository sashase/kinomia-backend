import { Module } from '@nestjs/common'
import { MultiplexService } from './services/multiplex.service'
import { DataSourceModule } from '../data-sources.module'
import { CinemasModule } from '../../cinemas/cinemas.module'
import { ShowtimesModule } from '../../showtimes/showtimes.module'
import { MultiplexCinemasService } from './services/multiplex-cinemas.service'
import { MultiplexShowtimesService } from './services/multiplex-showtimes.service'

@Module({
    imports: [CinemasModule, ShowtimesModule, DataSourceModule],
    providers: [MultiplexService, MultiplexCinemasService, MultiplexShowtimesService],
    exports: [MultiplexService]
})
export class MultiplexModule { }
