import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { REQUIRES_PERMISSIONS_KEY } from 'src/common/constants';
import { ERR_PERMISSIONS_INSUFFICIENT } from 'src/common/constants/exceptions.cons';
import { CustomException } from '../exceptions';

@Injectable()
export class PermissionGuard implements CanActivate {
  @Inject(Reflector)
  private reflector: Reflector;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    if (!request.user) {
      return true;
    }

    if (request.user.isAdmin) {
      return true;
    }

    const permissions = request.user.permissions;

    if (permissions.some(it => it.code === '*:*:*')) {
      return true
    }

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      REQUIRES_PERMISSIONS_KEY,
      [context.getClass(), context.getHandler()],
    );

    if (!requiredPermissions) {
      return true;
    }

    for (let i = 0; i < requiredPermissions.length; i++) {
      const curPermission = requiredPermissions[i];
      const found = permissions.find((item) => item.code === curPermission);
      if (!found) {
        throw new CustomException('您没有访问该接口的权限', ERR_PERMISSIONS_INSUFFICIENT)
      }
    }

    return true;
  }
}
