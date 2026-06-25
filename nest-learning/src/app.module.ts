import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { ServeStaticModule }
  from '@nestjs/serve-static';
import { join } from 'path';
import { UploadsModule } from './uploads/uploads.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { MailModule } from './mail/mail.module';
import { RedisModule } from './redis/redis.module';
import { QueueModule } from './queue/queue.module';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 5,
      },
    ]),
    ServeStaticModule.forRoot({
      rootPath: join(
        process.cwd(),
        'uploads',
      ),
      serveRoot: '/uploads',
    }), ConfigModule.forRoot({
      isGlobal: true,
    }), ProductsModule, PrismaModule, AuthModule, TasksModule, UploadsModule, MailModule, RedisModule, QueueModule, LoggerModule],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_GUARD,
    useClass: ThrottlerGuard,
  },],
})
export class AppModule { }
