import { CreateAssistanceDto } from './create-assistance.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateAssistanceDto extends PartialType(CreateAssistanceDto) {
  deletedFilesName: number[];
}
