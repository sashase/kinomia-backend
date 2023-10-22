import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { ConfigModule } from '@nestjs/config'
import { AppService } from './app.service'
import configuration from './config/configuration'
// import { PrismaModule } from './prisma/prisma.module'

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, load: [configuration] })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
