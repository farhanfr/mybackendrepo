import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter
  implements ExceptionFilter
{
  private readonly logger =
    new Logger(HttpExceptionFilter.name);

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

    const logMessage =
      `${request.method} ${request.url} - ${message}`;

    if (status >= 500) {
      this.logger.error(
        logMessage,
        exception instanceof Error
          ? exception.stack
          : undefined,
      );
    } else {
      this.logger.warn(
        logMessage,
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