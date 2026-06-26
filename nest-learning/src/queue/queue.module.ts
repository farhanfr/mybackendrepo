import { Module }
  from '@nestjs/common';

import {
  BullModule,
} from '@nestjs/bullmq';

import { QueueService }
  from './queue.service';

import { EmailProcessor }
  from './email.processor';

import { MailModule }
  from '../mail/mail.module';

@Module({
  imports: [

    MailModule,

    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: 6379,
      },
    }),

    BullModule.registerQueue({
      name: 'email',
    }),
  ],

  providers: [
    QueueService,
    EmailProcessor,
  ],

  exports: [
    QueueService,
  ],
})
export class QueueModule {}