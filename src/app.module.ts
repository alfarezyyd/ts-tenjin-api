import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { UserModule } from './user/user.module';
import { MentorsModule } from './mentors/mentors.module';
import { MentorModule } from './mentor/mentor.module';

@Module({
  imports: [CommonModule, UserModule, MentorsModule, MentorModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
