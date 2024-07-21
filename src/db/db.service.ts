import { deserialize } from '@deepkit/type';
import { Inject, Type } from '@nestjs/common';
import { OgmaLogger, OgmaService } from '@ogma/nestjs-module';
import { Pool } from 'pg';
import { from, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import {
  DatabaseInterface,
  InsertParams,
  QueryParams,
  UpdateManyParams,
  UpdateParams,
} from './interfaces/db-service.interface';
import { DATABASE_POOL } from 'src/constants';
/**
 * This class manaages all Database interactions. Inspired by https://github.com/jmcdo29/zeldaPlay
 */
export class DatabaseService<T> implements DatabaseInterface<T> {
  constructor(
    @Inject(DATABASE_POOL) private readonly pool: Pool,
    readonly tableName: string,
    @OgmaLogger(DatabaseService.name) private readonly logger: OgmaService,
  ) {}

  private runQuery(
    query: string,
    params: any[],
    type: Type<T>,
  ): Observable<T[]> {
    const start = Date.now();
    return from(this.pool.query(query, params)).pipe(
      tap((qRes) => {
        this.logger.debug({
          query,
          time: Date.now() - start,
          rows: qRes.rowCount,
        });
      }),
      map((qRes) =>
        qRes.rows.map(this.underScoreToCamelCase).map((row) => {
          return deserialize<typeof type>(row);
        }),
      ),
      //TODO delete after testing
      tap((qRes) => {
        this.logger.debug(`Rows array: ${JSON.stringify(qRes)}`);
      }),
      catchError((err) => {
        this.logger.debug({
          query,
          time: Date.now() - start,
        });
        this.logger.printError(err);
        return of([]);
      }),
    );
  }

  private underScoreToCamelCase(
    record: Record<string, any>,
  ): Record<string, any> {
    const newObj = {};
    Object.keys(record).forEach((key) => {
      const origKey = key;
      while (key.indexOf('_') > -1) {
        const _index = key.indexOf('_');
        const nextChar = key.charAt(_index + 1);
        key = key.replace(`_${nextChar}`, nextChar.toUpperCase());
      }
      newObj[key] = record[origKey];
    });
    return newObj;
  }

  query(params: QueryParams, type: Type<T>): Observable<T[]> {
    const query =
      'SELECT ' +
      params.query +
      ' FROM ' +
      this.tableName +
      ' WHERE ' +
      params.where;
    return this.runQuery(query, params.variables, type);
  }

  insert(params: InsertParams, type: Type<T>): Observable<T[]> {
    const query =
      'INSERT INTO ' +
      this.tableName +
      ' (' +
      params.query +
      ') VALUES (' +
      params.where +
      ') RETURNING *;';
    return this.runQuery(query, params.variables, type);
  }

  // tslint:disable-next-line: no-identical-functions
  update(params: UpdateParams, type: Type<T>): Observable<T[]> {
    const query =
      'UPDATE ' +
      this.tableName +
      ' SET ' +
      params.query +
      ' WHERE ' +
      params.where +
      ' RETURNING *;';
    return this.runQuery(query, params.variables, type);
  }

  updateMany(params: UpdateManyParams, type: Type<T>): Observable<T[]> {
    const query =
      'UPDATE ' +
      this.tableName +
      ' AS ' +
      params.tableAlias +
      ' SET ' +
      params.query +
      ' FROM ' +
      params.tempTable +
      ' WHERE ' +
      params.where +
      ' RETURNING *;';
    return this.runQuery(query, params.variables, type);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  delete(params: QueryParams): Observable<T[]> {
    return of([]);
  }
}
