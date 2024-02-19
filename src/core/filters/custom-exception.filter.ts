import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class CustomExceptionFilter implements ExceptionFilter {

  protected logger = new Logger(CustomExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    const res = exception.getResponse() as {
      code: number,
      message: string,
      data: unknown
    };

    const result = {
      code: res.code || exception.getStatus(),
      message: res.message || 'fail',
      data: res.data || null
    }

    this.logger.error(result)

    response
      .status(HttpStatus.OK)
      .json(result)
      .end();
  }
}
