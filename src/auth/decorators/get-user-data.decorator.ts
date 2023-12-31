import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const GetUserData = createParamDecorator((data: string, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();
  if (!data) return request.user;
  return request.user[data];
});
