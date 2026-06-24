import {
  Processor,
  WorkerHost,
} from '@nestjs/bullmq';

import { Job }
  from 'bullmq';

import { MailService }
  from '../mail/mail.service';

@Processor('email')
export class EmailProcessor
  extends WorkerHost {

  constructor(
    private readonly mailService:
      MailService,
  ) {
    super();
  }

  async process(
    job: Job,
  ) {

    console.log(
      'PROCESSING EMAIL',
      job.data,
    );

    switch (job.name) {

      case 'send-reset-password-email':

        await this.mailService
          .sendResetPasswordEmail(
            job.data.email,
            job.data.token,
          );

        break;
    }
  }
}