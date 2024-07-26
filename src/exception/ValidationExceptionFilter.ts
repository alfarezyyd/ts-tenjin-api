import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ZodError, ZodIssue } from 'zod';
import { Response } from 'express';
import { WebResponse } from '../model/web.response';

@Catch(ZodError)
export default class ValidationExceptionFilter
  implements ExceptionFilter<ZodError>
{
  catch(exception: ZodError, host: ArgumentsHost): any {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    const webResponse: WebResponse<ZodIssue[]> = new WebResponse<ZodIssue[]>();
    webResponse.errors.message = exception.issues; // Set errors to exception issues
    response.status(400).json(webResponse);
  }
}
