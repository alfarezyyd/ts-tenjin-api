import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { MentorModule } from './mentor/mentor.module';
import { EducationModule } from './education/education.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    CommonModule,
    UsersModule,
    MentorModule,
    EducationModule,
    AuthenticationModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
