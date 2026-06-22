import {
    Injectable,
} from '@nestjs/common';

import {
    MailerService,
} from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
    constructor(
        private readonly mailerService:
            MailerService,
    ) { }

    async sendTestEmail(
        email: string,
    ) {

        await this.mailerService.sendMail({
            to: email,

            subject:
                'NestJS Mail Test',

            html: `
      <h1>Hello</h1>

      <p>Email berhasil dikirim 🚀</p>
    `,
        });

        return {
            message:
                'Email berhasil dikirim',
        };
    }

    async sendResetPasswordEmail(
        email: string,
        token: string,
    ) {

        const resetLink =
            `http://localhost:3000/reset-password?token=${token}`;

        await this.mailerService.sendMail({
            to: email,

            subject:
                'Reset Password',

            html: `
      <h2>Reset Password</h2>

      <p>
        Klik link berikut:
      </p>

      <a href="${resetLink}">
        Reset Password
      </a>
    `,
        });
    }
}
