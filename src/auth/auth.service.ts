import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { UserRepository } from './user/user.repository';
import { JwtService } from './jwt.service';
import { compareSync, genSalt, hash } from 'bcrypt';
import { AuthResponseDto } from './dto/auth-response.dto';
import { OgmaLogger, OgmaService } from '@ogma/nestjs-module';

@Injectable()
export class AuthService {
  constructor(
    @Inject() private userRepository: UserRepository,
    @Inject() private jwtService: JwtService,
    @OgmaLogger(AuthService.name) private readonly logger: OgmaService,
  ) {}

  /**
   * This method helps sign in a user and returns an access token.
   * @param { AuthCredentialsDto } authCredDto is a DTO that holds the user's credentials
   * @returns a DTO that contains the Access and Refresh JWT Tokens
   */
  async signIn(authCredDto: AuthCredentialsDto): Promise<AuthResponseDto> {
    const { email, password } = authCredDto;
    const saltRounds = 10;
    const salt = await genSalt(saltRounds); //Get salt
    const hashedPass = await hash(password, salt); //Hash the password with salt
    await this.userRepository
      .getUserByEmail(email)
      .then((users) => {
        return (
          users[0].email === email && compareSync(hashedPass, users[0].password)
        );
      })
      .then((authPassed) => {
        if (!authPassed) {
          throw new UnauthorizedException('Invalid email or password.');
        }
      });

    //Return JWT token
    const accessToken = this.jwtService.createAccessToken(email);
    const refreshToken = this.jwtService.createAccessToken(email);
    return new AuthResponseDto(accessToken, refreshToken);
  }

  /**
   * This method helps create a user and returns Refresh and Access
   * JWT tokens
   * @param { AuthCredentialsDto } authCred -  is a DTO that contains the
   * user's credentials
   * @returns AuthResponseDto that contains the Access and Refresh JWT Tokens
   */
  async signUp(authCred: AuthCredentialsDto): Promise<AuthResponseDto> {
    const { email, password } = authCred;
    this.logger.log(`Sign up email: ${email}`);
    const refreshToken = this.jwtService.createRefreshToken(email);
    const created: boolean = await this.userRepository.createUser(
      email,
      password,
      refreshToken,
    );
    if (!created) {
      throw new BadRequestException('Bad User Sign up Request.');
    }
    const accessToken = this.jwtService.createAccessToken(email);
    return new AuthResponseDto(accessToken, refreshToken);
  }

  /**
   * This method validates the Access Token throws an error if token is
   * invalid
   * @param { string } accessToken - The JWT Access token that helps client
   * authenticate user action without having to sign in.
   * @returns boolean if access token is validated.
   */
  verifyAccessToken(accessToken: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        this.jwtService.verifyAccessToken(accessToken);
        return resolve(true);
      } catch (error) {
        //TokenExpiredError, JsonWebTokenError
        resolve(false);
      }
    });
  }

  /**
   * This method refreshes the access token using the JWT Refresh Token
   * @param { string } email - is the e-mail address of the user that owns
   * the access token
   * @param { string } refreshToken - is the JWT Refresh Token used to refresh
   * the Access Token
   * @returns new JWT Access Token
   */
  async refreshAccessToken(
    email: string,
    refreshToken: string,
  ): Promise<string> {
    await this.userRepository.getUserByEmail(email).then((users) => {
      if (users[0].refreshtoken !== refreshToken) {
        throw new UnauthorizedException('Invalid Refresh Token.');
      }
    });

    try {
      this.jwtService.verifyRefreshToken(refreshToken);
    } catch (error) {
      //TokenExpiredError, JsonWebTokenError
      throw new UnauthorizedException('Invalid Refresh Token.');
    }
    return this.jwtService.createAccessToken(email);
  }
}
