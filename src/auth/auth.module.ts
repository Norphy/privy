import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserRepository } from './user/user.repository';
import { JwtService } from './jwt.service';
import { DbModule } from 'src/db/db.module';
import { OgmaModule } from '@ogma/nestjs-module';

@Module({
  imports: [
    DbModule.forFeature('users'),
    OgmaModule.forFeature(AuthService.name),
    OgmaModule.forFeature(UserRepository.name),
    OgmaModule.forFeature(AuthController.name),
  ],
  providers: [AuthService, UserRepository, JwtService],
  controllers: [AuthController],
  exports: [UserRepository, JwtService, AuthService],
})
export class AuthModule {}
