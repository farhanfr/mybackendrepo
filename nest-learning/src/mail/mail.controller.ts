import {
  Controller,
  Post,
  Query,
} from '@nestjs/common';

import { MailService }
  from './mail.service';

@Controller('mail')
export class MailController {
  constructor(
    private readonly mailService:
      MailService,
  ) {}

  @Post('test')
  sendTestEmail(
    @Query('email')
    email: string,
  ) {
    return this.mailService
      .sendTestEmail(email);
  }
}