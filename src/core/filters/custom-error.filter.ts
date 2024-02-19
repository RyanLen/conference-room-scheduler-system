import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger
} from '@nestjs/common';
import { Response } from 'express';
import { AuthorizationError, InternalOAuthError, TokenError } from 'passport-oauth2';
import { ERR_AUTHORIZATION, ERR_CODE_INVALID, ERR_INTERNAL_OAUTH } from 'src/common/constants';

@Catch(AuthorizationError, InternalOAuthError, TokenError)
export class CustomErrorFilter implements ExceptionFilter {

  protected logger = new Logger(CustomErrorFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>()

    let code = exception.code || 500;
    const message = exception.message || 'Unknown error';
    const error = exception.name || 'Internal Server Error';

    if (exception instanceof TokenError) {
      code = ERR_CODE_INVALID
    } else if (exception instanceof AuthorizationError) {
      code = ERR_AUTHORIZATION
    } else if (exception instanceof InternalOAuthError) {
      code = ERR_INTERNAL_OAUTH
    }

    response.status(HttpStatus.OK).json({
      code,
      message,
      data: error,
    });
  }
}
