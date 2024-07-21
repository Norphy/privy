import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DbModule } from './db/db.module';
import { OgmaModule } from '@ogma/nestjs-module';
import { ConfigModule } from '@nestjs/config';
import { configProps } from './config/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configProps],
      // ignoreEnvFile: true,
    }),
    AuthModule,
    DbModule,
    OgmaModule.forRoot({
      color: true,
      json: false,
      application: 'Privy',
      masks: ['password'],
      logLevel: 'ALL', //TODO make log level configurable
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
