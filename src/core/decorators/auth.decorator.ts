import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { REQUIRES_PERMISSIONS_KEY } from 'src/common/constants';
import { JwtAuthGuard, PermissionGuard } from '../guards';

export function Auth(...permission: string[]) {
  return applyDecorators(
    SetMetadata(REQUIRES_PERMISSIONS_KEY, permission),
    UseGuards(JwtAuthGuard, PermissionGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
