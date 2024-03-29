import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { WebResponse } from '../model/web.response';

@Catch(Prisma.PrismaClientKnownRequestError)
export default class PrismaExceptionFilter
  implements ExceptionFilter<Prisma.PrismaClientKnownRequestError>
{
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost): any {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    const webResponse: WebResponse<string> = new WebResponse();
    switch (exception.code) {
      case 'P2002':
        webResponse.errors = `Duplicate field value: ${exception.meta.target as string}`;
        response.status(401).json(webResponse);
        break;
      default:
        // handling all other errors
        webResponse.errors = `Something went wrong: ${exception.message}`;
        response.status(500).json(webResponse);
        break;
    }
  }
}
