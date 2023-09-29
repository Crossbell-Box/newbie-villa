import { HttpException } from '@nestjs/common';

export class WebException extends HttpException {
  constructor(
    message: string,
    {
      status = 400,
    }: {
      status?: number;
    } = {},
  ) {
    super({ ok: false, message }, status);
  }
}
