import { PartialType } from '@nestjs/swagger';
import { CreateExpeditionDto } from './create-expedition.dto';

export class UpdateExpeditionDto extends PartialType(CreateExpeditionDto) {}
