import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import multer, { MulterError } from 'multer';
import { WebResponse } from '../model/web.response';
import { Response } from 'express';

export default class MulterExceptionFilter
  implements ExceptionFilter<MulterError>
{
  catch(exception: multer.MulterError, host: ArgumentsHost): any {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    const webResponse: WebResponse<MulterError> =
      new WebResponse<MulterError>();
    webResponse.errors = exception.message;
    response.status(400).json(webResponse);
  }
}