import {
  SetMetadata,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { EmailUser } from '@prisma/client';
import { IS_PUBLIC_KEY } from './newbie-jwt.constants';

export const CurrentUser = createParamDecorator(
  (_: undefined, context: ExecutionContext): EmailUser => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as EmailUser;
    return user;
  },
);

/** if non-login user can access this endpoint */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const ApiBearerAuthNewbie = () => ApiBearerAuth('newbie');
