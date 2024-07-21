import { Inject } from '@nestjs/common';
import { createDatabaseServiceProviderToken } from './db.provider';

export const DatabaseTable = (tableName: string) => {
  return Inject(createDatabaseServiceProviderToken(tableName));
};
