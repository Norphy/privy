import { Provider } from '@nestjs/common';
import { OgmaService, createProviderToken } from '@ogma/nestjs-module';
import { firstValueFrom, from, retry, timer } from 'rxjs';
import {
  DATABASE_CONNECTION_LOGGER_CONST,
  DATABASE_POOL,
  DATABASE_SERVICE,
} from 'src/constants';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from './db.service';

export function createDatabasePoolConnection(): Provider {
  return {
    provide: DATABASE_POOL,
    useFactory: async (configService: ConfigService, logger: OgmaService) => {
      const poolOpts = {
        host: configService.get<string>('db.host'),
        password: configService.get<string>('db.password'),
        ssl: configService.get<boolean>('db.ssl'),
        user: configService.get<string>('db.username'),
        port: configService.get<number>('db.port'),
        database: configService.get<string>('db.databaseName'),
      };
      logger.info(`Pool Opts: ${JSON.stringify(poolOpts)}`);
      const pool = new Pool(poolOpts);
      return firstValueFrom(
        from(pool.connect()).pipe(
          retry({
            count: 10,
            delay: (error, retryCount) => {
              logger.warn(
                `Attempted to connect to DB and failed ${retryCount} times. Error: ${error}`,
              );

              return timer(1000);
            },
          }),
        ),
      );
    },
    inject: [
      ConfigService,
      createProviderToken(DATABASE_CONNECTION_LOGGER_CONST),
    ],
  };
}

export function createDatabaseServiceProviderToken(tableName: string): string {
  return `${DATABASE_SERVICE}:${tableName}`;
}

export function createDatabaseServiceProviders(tableName: string): Provider[] {
  const token = createDatabaseServiceProviderToken(tableName);
  return [
    {
      inject: [DATABASE_POOL, createProviderToken(DatabaseService.name)],
      provide: token,
      useFactory: (pool: any, ogmaService: OgmaService) => {
        return new DatabaseService(pool, tableName, ogmaService);
      },
    },
  ];
}
