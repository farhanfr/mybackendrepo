import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private redis!: Redis;

  onModuleInit() {
    this.redis = new Redis({
      host: 'localhost',
      port: 6379,
    });

    console.log('Redis Connected');
  }

  async set(
    key: string,
    value: string,
  ) {
    return this.redis.set(
      key,
      value,
    );
  }

  async setWithExpiry(
    key: string,
    value: string,
    ttl: number,
  ) {
    return this.redis.set(
      key,
      value,
      'EX',
      ttl,
    );
  }

  async get(
    key: string,
  ) {
    return this.redis.get(key);
  }

  async ttl(
    key: string,
  ) {
    return this.redis.ttl(key);
  }

  async delete(
    key: string,
  ) {
    return this.redis.del(key);
  }
}
