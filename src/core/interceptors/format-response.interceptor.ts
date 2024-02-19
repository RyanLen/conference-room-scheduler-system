import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class FormatResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const handler = next.handle();
    return handler.pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse();
        return {
          // code: response.code || response.statusCode,
          code: 0,
          message: 'success',
          data,
        };
      }),
    );
  }
}
