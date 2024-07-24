import { Injectable } from '@nestjs/common';
import { CreateAssistanceDto } from './dto/create-assistance.dto';
import { UpdateAssistanceDto } from './dto/update-assistance.dto';

@Injectable()
export class AssistanceService {
  create(createAssistanceDto: CreateAssistanceDto) {
    return 'This action adds a new assistance';
  }

  findAll() {
    return `This action returns all assistance`;
  }

  findOne(id: number) {
    return `This action returns a #${id} assistance`;
  }

  update(id: number, updateAssistanceDto: UpdateAssistanceDto) {
    return `This action updates a #${id} assistance`;
  }

  remove(id: number) {
    return `This action removes a #${id} assistance`;
  }
}
