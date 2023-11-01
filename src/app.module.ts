import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import configuration from './config/configuration'
import { MultiplexModule } from './data-sources/multiplex/multiplex.module'
import { OskarModule } from './data-sources/oskar/oskar.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    ScheduleModule.forRoot(),
    MultiplexModule,
    OskarModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
