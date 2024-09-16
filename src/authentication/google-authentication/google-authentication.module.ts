import { Module } from '@nestjs/common';
import { GoogleAuthenticationService } from './google-authentication.service';
import { GoogleAuthenticationController } from './google-authentication.controller';
import { CommonModule } from '../../common/common.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [CommonModule, JwtModule],
  controllers: [GoogleAuthenticationController],
  providers: [GoogleAuthenticationService],
})
export class GoogleAuthenticationModule {}
