import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import multer, { MulterError } from 'multer';
import { WebResponse } from '../model/web.response';
import { Response } from 'express';

@Catch(MulterError)
export default class MulterExceptionFilter
  implements ExceptionFilter<MulterError>
{
  catch(exception: multer.MulterError, host: ArgumentsHost): any {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    const webResponse: WebResponse<string> = new WebResponse<string>();
    webResponse.errors.message = exception.message;
    response.status(500).json(webResponse);
  }
}
