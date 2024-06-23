import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { MentorModule } from './mentor/mentor.module';
import { EducationModule } from './education/education.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CommonModule,
    UserModule,
    MentorModule,
    EducationModule,
    AuthenticationModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
