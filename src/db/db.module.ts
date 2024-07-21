import { DynamicModule, Module } from '@nestjs/common';
import { DatabaseTestService } from './db-test.service';
import { OgmaModule } from '@ogma/nestjs-module';
import {
  createDatabasePoolConnection,
  createDatabaseServiceProviders,
} from './db.provider';
import { DatabaseService } from './db.service';
import { DATABASE_CONNECTION_LOGGER_CONST } from 'src/constants';

@Module({})
export class DbModule {
  static forFeature(tableName: string): DynamicModule {
    const databaseProvider = createDatabaseServiceProviders(tableName);
    return {
      imports: [
        OgmaModule.forFeature(DatabaseTestService.name),
        OgmaModule.forFeature(DatabaseService.name),
        OgmaModule.forFeature(DATABASE_CONNECTION_LOGGER_CONST),
      ],
      module: DbModule,
      providers: [
        {
          provide: 'DatabaseInterface',
          useClass: DatabaseTestService,
        },
        createDatabasePoolConnection(),
        ...databaseProvider,
      ],
      exports: [
        {
          provide: 'DatabaseInterface',
          useClass: DatabaseTestService,
        },
        ...databaseProvider,
      ],
    };
  }
}
