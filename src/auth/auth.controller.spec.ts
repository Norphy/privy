import { Test, TestingModule } from '@nestjs/testing';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthController } from './auth.controller';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { AuthService } from './auth.service';
import { OgmaModule } from '@ogma/nestjs-module';
import { AuthResponseDto } from './dto/auth-response.dto';
import {
  ArgumentMetadata,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';

describe('AuthController', () => {
  let authService: DeepMocked<AuthService>;
  let authController: AuthController;

  beforeEach(async () => {
    const mod: TestingModule = await Test.createTestingModule({
      imports: [
        OgmaModule.forRoot({
          color: true,
          json: false,
          application: 'Privy',
          masks: ['password'],
          logLevel: 'ALL', //TODO make log level configurable
        }),
        OgmaModule.forFeature(AuthController.name),
      ],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: createMock<AuthService>(),
        },
      ],
    }).compile();

    authController = mod.get<AuthController>(AuthController);
    authService = mod.get(AuthService);
  });

  describe('Test Sign up end point', () => {
    it('should create user and return expected Auth Response', async () => {
      const authDto = new AuthCredentialsDto();
      authDto.email = 'email';
      authDto.password = 'password';
      const authResponse = new AuthResponseDto('what', 'evs');
      const authResponseSec = new AuthResponseDto('what', 'evs');
      authService.signUp.mockImplementation(() => {
        return new Promise((r) => r(authResponse));
      });
      await expect(authController.signUp(authDto)).resolves.toStrictEqual(
        authResponseSec,
      );
    });
    describe('validate Auth Credentials DTO', () => {
      it('should validate Auth Credentials DTO: Email incorrect format.', async () => {
        const target: ValidationPipe = new ValidationPipe();
        const metadata: ArgumentMetadata = {
          type: 'body',
          metatype: AuthCredentialsDto,
          data: '',
        };
        const actualError = await getError(() =>
          target.transform(
            <AuthCredentialsDto>{ email: 'few@he', password: 'hello$Oooo' },
            metadata,
          ),
        );
        expect(actualError).not.toBe(NoErrorThrownError);
        expect(actualError).toBeInstanceOf(BadRequestException);
        expect(actualError).toHaveProperty('response', {
          message: ['Invalid Email Address.'],
          error: 'Bad Request',
          statusCode: 400,
        });
      });

      it('should validate Auth Credentials DTO: Password too short', async () => {
        const target: ValidationPipe = new ValidationPipe();
        const metadata: ArgumentMetadata = {
          type: 'body',
          metatype: AuthCredentialsDto,
          data: '',
        };

        const actualError = await getError(() =>
          target.transform(
            <AuthCredentialsDto>{ email: 'email@hi.coF', password: 'he$Go' },
            metadata,
          ),
        );
        expect(actualError).not.toBe(NoErrorThrownError);
        expect(actualError).toBeInstanceOf(BadRequestException);
        expect(actualError).toHaveProperty('response', {
          message: ['password must be longer than or equal to 8 characters'],
          error: 'Bad Request',
          statusCode: 400,
        });
      });

      it('should validate Auth Credentials DTO: Password too long', async () => {
        const target: ValidationPipe = new ValidationPipe();
        const metadata: ArgumentMetadata = {
          type: 'body',
          metatype: AuthCredentialsDto,
          data: '',
        };

        const actualError = await getError(() =>
          target.transform(
            <AuthCredentialsDto>{
              email: 'email@hi.co',
              password: 'F%finoifoinfoinfoinfoinfoinfoinfo',
            },
            metadata,
          ),
        );
        expect(actualError).not.toBe(NoErrorThrownError);
        expect(actualError).toBeInstanceOf(BadRequestException);
        expect(actualError).toHaveProperty('response', {
          message: ['password must be shorter than or equal to 32 characters'],
          error: 'Bad Request',
          statusCode: 400,
        });
      });

      it('should validate Auth Credentials DTO: Password too weak.', async () => {
        const target: ValidationPipe = new ValidationPipe();
        const metadata: ArgumentMetadata = {
          type: 'body',
          metatype: AuthCredentialsDto,
          data: '',
        };

        const actualError = await getError(() =>
          target.transform(
            <AuthCredentialsDto>{ email: 'email@hi.co', password: 'Hellooooo' },
            metadata,
          ),
        );
        expect(actualError).not.toBe(NoErrorThrownError);
        expect(actualError).toBeInstanceOf(BadRequestException);
        expect(actualError).toHaveProperty('response', {
          message: [
            'Password has to have at least 1 char or number, 1 upper case character and 1 lower case character',
          ],
          error: 'Bad Request',
          statusCode: 400,
        });
      });

      it('should validate Auth Credentials DTO: Password too weak.', async () => {
        const target: ValidationPipe = new ValidationPipe();
        const metadata: ArgumentMetadata = {
          type: 'body',
          metatype: AuthCredentialsDto,
          data: '',
        };

        const actualError = await getError(() =>
          target.transform(
            <AuthCredentialsDto>{ email: 'email@hi.co', password: 'elloooo4' },
            metadata,
          ),
        );
        expect(actualError).not.toBe(NoErrorThrownError);
        expect(actualError).toBeInstanceOf(BadRequestException);
        expect(actualError).toHaveProperty('response', {
          message: [
            'Password has to have at least 1 char or number, 1 upper case character and 1 lower case character',
          ],
          error: 'Bad Request',
          statusCode: 400,
        });
      });
    });

    it('should validate Auth Credentials DTO: Password too weak.', async () => {
      const target: ValidationPipe = new ValidationPipe();
      const metadata: ArgumentMetadata = {
        type: 'body',
        metatype: AuthCredentialsDto,
        data: '',
      };
      const actualError = await getError(() =>
        target.transform(
          <AuthCredentialsDto>{ email: 'email@hi.co', password: 'helloooo' },
          metadata,
        ),
      );
      expect(actualError).not.toBe(NoErrorThrownError);
      expect(actualError).toBeInstanceOf(BadRequestException);
      expect(actualError).toHaveProperty('response', {
        message: [
          'Password has to have at least 1 char or number, 1 upper case character and 1 lower case character',
        ],
        error: 'Bad Request',
        statusCode: 400,
      });
    });
  });
});

class NoErrorThrownError extends Error {}

const getError = async <Error>(call: () => unknown): Promise<Error> => {
  try {
    await call();

    throw new NoErrorThrownError('No Error Thrown');
  } catch (error: unknown) {
    return error as Error;
  }
};
