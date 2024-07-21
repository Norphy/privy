import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { User } from './user.entity';
import { firstValueFrom, iif, map, mergeMap, of, throwError } from 'rxjs';
import { OgmaLogger, OgmaService } from '@ogma/nestjs-module';
import { DatabaseTable } from 'src/db/db-service.decorator';
import { DatabaseService } from 'src/db/db.service';
import { DB_TABLE_NAME_USERS } from 'src/constants';
import { v4 as uuid } from 'uuid';

/**
 * This class manages User entity interactions with the Database
 */
const TABLE_NAME = DB_TABLE_NAME_USERS;
@Injectable()
export class UserRepository {
  constructor(
    @DatabaseTable(TABLE_NAME)
    private dbService: DatabaseService<User>,
    @OgmaLogger(UserRepository.name) private readonly logger: OgmaService,
  ) {}

  async createUser(
    email: string,
    password: string,
    refreshToken: string,
  ): Promise<boolean> {
    this.logger.info(`Create new user. Email: ${email}`);
    await this.getUserByEmail(email).then((users) => {
      if (users.length >= 1) {
        this.logger.error(`User already exists with email. Email: ${email}`);
        throw new ConflictException('Email already exists.');
      }
    });
    const fields: string[] = [];
    const values: string[] = [];
    const variables: any[] = [];
    const createdAt = new Date().getTime();
    const id: string = uuid();
    fields.push('uuid');
    variables.push(id);
    fields.push('email');
    variables.push(email);
    fields.push('password');
    variables.push(password);
    fields.push('refresh_token');
    variables.push(refreshToken);
    fields.push('created_at');
    variables.push(createdAt);
    for (let i = 1; i <= fields.length; i++) {
      values.push(`$${i}`);
    }
    const createObservable = this.dbService
      .insert(
        {
          query: fields.join(', '),
          where: values.join(', '),
          variables: variables,
        },
        User,
      )
      .pipe(
        mergeMap((newUsers) =>
          iif(
            () => newUsers.length !== 0,
            of(newUsers[0]),
            throwError(
              () =>
                new BadRequestException(
                  'No user was created. Please contact your ' +
                    'system administrator for details.',
                ),
            ),
          ),
        ),
        map(() => true),
      );
    return firstValueFrom(createObservable);
  }

  getUserByEmail(email: string): Promise<User[]> {
    const where = 'email = $1;';
    const usersObservable = this.dbService.query(
      {
        query: 'uuid, email, password, refresh_token, created_at',
        where,
        variables: [email],
      },
      User,
    );
    return firstValueFrom(usersObservable);
  }

  updateUser(email: string): Promise<User[]> {
    const where = 'email = $1;';
    const usersObservable = this.dbService.query(
      {
        query: 'uuid, email, password, refresh_token, created_at',
        where,
        variables: [email],
      },
      User,
    );
    return firstValueFrom(usersObservable);
  }
}
