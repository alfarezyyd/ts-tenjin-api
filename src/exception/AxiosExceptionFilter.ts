import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { AxiosError } from 'axios';
import { WebResponse } from '../model/web.response';
import { Response } from 'express';

export class AxiosExceptionFilter implements ExceptionFilter<AxiosError> {
  catch(exception: AxiosError, host: ArgumentsHost): any {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    const webResponse: WebResponse<AxiosError> = new WebResponse<AxiosError>();
    webResponse.errors.message = exception.message;
    response.status(500).json(webResponse);
  }
}
