import {
  Injectable,
} from '@nestjs/common';

import {
  InjectQueue,
} from '@nestjs/bullmq';

import { Queue }
  from 'bullmq';

@Injectable()
export class QueueService {

  constructor(
    @InjectQueue('email')
    private readonly emailQueue:
      Queue,
  ) {}

  async addResetPasswordJob(
    email: string,
    token: string,
  ) {

    await this.emailQueue.add(
      'send-reset-password-email',

      {
        email,
        token,
      },
      {
        attempts: 3,
      }
    );
  }
}