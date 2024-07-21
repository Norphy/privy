import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtService } from './jwt.service';
import { UserRepository } from './user/user.repository';
import { OgmaModule } from '@ogma/nestjs-module';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { AuthResponseDto } from './dto/auth-response.dto';
import { BadRequestException } from '@nestjs/common';

describe('Auth Service', () => {
  let authService: AuthService;
  let userRepositoryMock: DeepMocked<UserRepository>;
  let jwtServiceMock: DeepMocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        OgmaModule.forRoot({
          color: true,
          json: false,
          application: 'Privy',
          masks: ['password'],
          logLevel: 'ALL', //TODO make log level configurable
        }),
        OgmaModule.forFeature(AuthService.name),
      ],
      //   providers: [AuthService, JwtService],
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: createMock<JwtService>(),
        },
        {
          provide: UserRepository,
          useValue: createMock<UserRepository>(),
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepositoryMock = module.get(UserRepository);
    jwtServiceMock = module.get(JwtService);
    // jwtService = module.get<JwtService>(JwtService);
  });

  //   async signUp(authCred: AuthCredentialsDto): Promise<AuthResponseDto> {
  //     const { email, password } = authCred;
  //     this.logger.log(`Sign up email: ${email}`);
  //     const refreshToken = this.jwtService.createRefreshToken(email);
  //     const created: boolean = await this.userRepository.createUser(
  //       email,
  //       password,
  //       refreshToken,
  //     );
  //     if (!created) {
  //       throw new BadRequestException('Bad User Sign up Request.');
  //     }
  //     const accessToken = this.jwtService.createAccessToken(email);
  //     return new AuthResponseDto(accessToken, refreshToken);
  //   }

  //   let httpService: DeepMocked<HttpService>;

  //   beforeEach(async () => {
  //     const module: TestingModule = await Test.createTestingModule({
  //       providers: [
  //         PokemonService,
  //         {
  //           provide: HttpService,
  //           useValue: createMock<HttpService>(),
  //         },
  //       ],
  //     }).compile();

  describe('signUpHappyPath', () => {
    it('It should create a new user and save in Database.', () => {
      //Arrange
      const expectedRefreshToken = 'refreshTok';
      const expectedAccessToken = 'accessTok';
      const expectedAuthCredentials = new AuthResponseDto(
        expectedAccessToken,
        expectedRefreshToken,
      );

      //Mock Implementations
      userRepositoryMock.createUser.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolve(true);
          }),
      );
      jwtServiceMock.createAccessToken.mockImplementation(
        () => expectedAccessToken,
      );
      jwtServiceMock.createRefreshToken.mockImplementation(
        () => expectedRefreshToken,
      );

      //Act
      const authCredDto: AuthCredentialsDto = new AuthCredentialsDto();
      authCredDto.email = 'email';
      authCredDto.password = 'password';
      const actualAuthDto = authService.signUp(authCredDto);

      //Assert
      expect(actualAuthDto).resolves.toStrictEqual(expectedAuthCredentials);
    }, 15000);
  });

  describe('signUpUserNotCreated', () => {
    it('It should attempt and fail to create a new user.', async () => {
      //Arrange
      const expectedRefreshToken = 'refreshTok';
      const expectedAccessToken = 'accessTok';

      //Mock Implementations
      userRepositoryMock.createUser.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolve(false);
          }),
      );
      jwtServiceMock.createAccessToken.mockImplementation(
        () => expectedAccessToken,
      );
      jwtServiceMock.createRefreshToken.mockImplementation(
        () => expectedRefreshToken,
      );

      //Act
      const authCredDto: AuthCredentialsDto = new AuthCredentialsDto();
      authCredDto.email = 'email';
      authCredDto.password = 'password';

      //Assert
      await expect(authService.signUp(authCredDto)).rejects.toThrow(
        new BadRequestException('Bad User Sign up Request.'),
      );
      expect(userRepositoryMock.createUser).toHaveBeenCalled();
      expect(jwtServiceMock.createRefreshToken).toHaveBeenCalled();
    }, 15000);
  });

  describe('signUpUserNotCreated', () => {
    it('It should attempt and fail to create a new user.', async () => {
      //Arrange
      const expectedRefreshToken = 'refreshTok';
      const expectedAccessToken = 'accessTok';

      //Mock Implementations
      userRepositoryMock.createUser.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolve(false);
          }),
      );
      jwtServiceMock.createAccessToken.mockImplementation(
        () => expectedAccessToken,
      );
      jwtServiceMock.createRefreshToken.mockImplementation(
        () => expectedRefreshToken,
      );

      //Act
      const authCredDto: AuthCredentialsDto = new AuthCredentialsDto();
      authCredDto.email = 'email';
      authCredDto.password = 'password';

      //Assert
      await expect(authService.signUp(authCredDto)).rejects.toThrow(
        new BadRequestException('Bad User Sign up Request.'),
      );
      expect(userRepositoryMock.createUser).toHaveBeenCalled();
      expect(jwtServiceMock.createRefreshToken).toHaveBeenCalled();
    }, 15000);
  });
});
