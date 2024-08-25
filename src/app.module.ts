import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { MentorModule } from './mentor/mentor.module';
import { EducationModule } from './education/education.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { SkillModule } from './skill/skill.module';
import { ExperienceModule } from './experience/experience.module';
import { CategoryModule } from './category/category.module';
import { ChatModule } from './chat/chat.module';
import { AssistanceModule } from './assistance/assistance.module';
import { OrderModule } from './order/order.module';
import { TagModule } from './tag/tag.module';
import { ReviewModule } from './review/review.module';
import { LanguageModule } from './language/language.module';
import { CartModule } from './cart/cart.module';

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
    SkillModule,
    ExperienceModule,
    CategoryModule,
    ChatModule,
    AssistanceModule,
    OrderModule,
    TagModule,
    ReviewModule,
    LanguageModule,
    CartModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
