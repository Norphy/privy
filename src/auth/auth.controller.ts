import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { OgmaLogger, OgmaService } from '@ogma/nestjs-module';
import { throttle } from 'src/common/throttle.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    @OgmaLogger(AuthController.name) private logger: OgmaService,
  ) {}

  @Post('/signin')
  @throttle(1000)
  signIn(@Body() authCredDto: AuthCredentialsDto): Promise<AuthResponseDto> {
    return this.authService.signIn(authCredDto);
  }

  @Post('/signup')
  @throttle(1000)
  signUp(@Body() authCredDto: AuthCredentialsDto): Promise<AuthResponseDto> {
    return this.authService.signUp(authCredDto);
  }

  @Get('/verify-access-token/:accessToken')
  @throttle(1000)
  verifyAccessToken(@Param() accessToken: string): Promise<boolean> {
    return this.authService.verifyAccessToken(accessToken);
  }
}
