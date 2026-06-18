import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter
  implements ExceptionFilter
{
  catch(
    exception: unknown,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();

    const response =
      ctx.getResponse<Response>();

    const request =
      ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : null;

    let message =
      'Internal Server Error';

    if (
      typeof exceptionResponse ===
      'string'
    ) {
      message = exceptionResponse;
    }

    if (
      typeof exceptionResponse ===
        'object' &&
      exceptionResponse &&
      'message' in exceptionResponse
    ) {
      message = Array.isArray(
        exceptionResponse.message,
      )
        ? exceptionResponse.message.join(
            ', ',
          )
        : String(
            exceptionResponse.message,
          );
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      timestamp:
        new Date().toISOString(),
      path: request.url,
    });
  }
}