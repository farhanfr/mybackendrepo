import { Module } from '@nestjs/common';

import {
  MailerModule,
} from '@nestjs-modules/mailer';

import { ConfigModule } from '@nestjs/config';

import { MailService } from './mail.service';
import { MailController } from './mail.controller';

@Module({
  imports: [
    ConfigModule,

    MailerModule.forRoot({
      transport: {
        host:
          process.env.MAIL_HOST,

        port:
          Number(
            process.env.MAIL_PORT,
          ),

        secure: false,

        auth: {
          user:
            process.env.MAIL_USER,

          pass:
            process.env.MAIL_PASSWORD,
        },
      },

      defaults: {
        from:
          process.env.MAIL_FROM,
      },
    }),
  ],

  providers: [MailService],

  exports: [MailService],

  controllers: [MailController],
})
export class MailModule {}