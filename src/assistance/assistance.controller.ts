import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AssistanceService } from './assistance.service';
import { CreateAssistanceDto } from './dto/create-assistance.dto';
import { UpdateAssistanceDto } from './dto/update-assistance.dto';
import { WebResponse } from '../model/web.response';

@Controller('assistants')
export class AssistanceController {
  constructor(private readonly assistanceService: AssistanceService) {}

  @Post('')
  async create(
    @Body() createAssistanceDto: CreateAssistanceDto,
  ): Promise<WebResponse<string>> {
    return {
      result: {
        message: await this.assistanceService.create(createAssistanceDto),
      },
    };
  }

  @Get()
  findAll() {
    return this.assistanceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assistanceService.findOne(+id);
  }

  @Patch(':assistanceId')
  async update(
    @Param('assistanceId') assistanceId: bigint,
    @Body() updateAssistanceDto: UpdateAssistanceDto,
  ): Promise<WebResponse<string>> {
    return {
      result: {
        message: await this.assistanceService.update(
          assistanceId,
          updateAssistanceDto,
        ),
      },
    };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assistanceService.remove(+id);
  }
}
