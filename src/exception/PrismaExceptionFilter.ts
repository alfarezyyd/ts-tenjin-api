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
        webResponse.errors.code = 'P2002';
        webResponse.errors.message = `Duplicate field value: ${exception.meta.target as string}`;
        response.status(400).json(webResponse);
        break;
      case 'P2003':
        webResponse.errors.code = 'P2003';
        webResponse.errors.message = `Foreign key constraint failed: ${exception.meta.target as string}`;
        response.status(400).json(webResponse);
        break;
      default:
        // handling all other errors
        webResponse.errors.message = `Something went wrong: ${exception.message}`;
        response.status(500).json(webResponse);
        break;
    }
  }
}
