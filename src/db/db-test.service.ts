import { Injectable, Type } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import {
  DatabaseInterface,
  QueryParams,
} from './interfaces/db-service.interface';
import { OgmaLogger, OgmaService } from '@ogma/nestjs-module';

@Injectable()
export class DatabaseTestService<T> implements DatabaseInterface<T> {
  tableName: string;
  constructor(
    @OgmaLogger(DatabaseTestService.name) private logger: OgmaService,
  ) {}
  query(params: QueryParams, type: Type<T>): Observable<T[]> {
    this.logger.info('Query DONE');
    return of([]);
  }
  insert(params: QueryParams, type: Type<T>): Observable<T[]> {
    this.logger.info('INSERT DONE');
    return of([]);
  }
  update(params: QueryParams, type: Type<T>): Observable<T[]> {
    this.logger.info('UPDATE DONE');
    return of([]);
  }
  delete(params: QueryParams): Observable<T[]> {
    this.logger.info('DELETE DONE');
    return of([]);
  }
}
