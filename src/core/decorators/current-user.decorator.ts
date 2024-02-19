import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string, context: ExecutionContext) => {
    const request: Express.Request = context.switchToHttp().getRequest();
    if (!request.user) {
      return null
    }
    return data ? request.user[data] : request.user;
  },
);
