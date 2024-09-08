import { PartialType } from '@nestjs/swagger';
import { RegisterMentorDto } from './register-mentor.dto';

export class UpdateMentorDto extends PartialType(RegisterMentorDto) {}
