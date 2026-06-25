import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

import 'winston-daily-rotate-file';

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),

            winston.format.printf(
              ({
                timestamp,
                level,
                message,
                context,
              }) => {
                return `[${timestamp}] [${level.toUpperCase()}] ${context ?? 'App'}: ${message}`;
              },
            ),
          ),
        }),
        new winston.transports.DailyRotateFile({
          dirname: 'logs/app',

          filename: '%DATE%.log',

          datePattern: 'YYYY-MM-DD',

          zippedArchive: true,

          maxSize: '20m',

          maxFiles: '14d',

          level: 'info',
        }),
        new winston.transports.DailyRotateFile({
          dirname: 'logs/error',

          filename: '%DATE%.error.log',

          datePattern: 'YYYY-MM-DD',

          zippedArchive: true,

          maxSize: '20m',

          maxFiles: '30d',

          level: 'error',
        }),
      ],
    }),
  ],

  exports: [WinstonModule],
})
export class LoggerModule { }