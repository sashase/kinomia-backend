import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { CacheModule } from '@nestjs/cache-manager'
import type { RedisClientOptions } from 'redis'
import { redisStore } from 'cache-manager-redis-yet'
import { ScheduleModule } from '@nestjs/schedule'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import configuration from './config/configuration'
import { MultiplexModule } from './data-sources/multiplex/multiplex.module'
import { OskarModule } from './data-sources/oskar/oskar.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    CacheModule.registerAsync<RedisClientOptions>({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          url: configService.get('redis.url'),
          ttl: configService.get('redis.ttl'),
        }),
      }),
      inject: [ConfigService],
      isGlobal: true
    }),
    ScheduleModule.forRoot(),
    MultiplexModule,
    OskarModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
