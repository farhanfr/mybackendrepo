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

  async setJson(
    key: string,
    value: any,
    ttl: number,
  ) {
    return this.redis.set(
      key,
      JSON.stringify(value),
      'EX',
      ttl,
    );
  }

  async getJson<T>(
    key: string,
  ): Promise<T | null> {

    const data =
      await this.redis.get(key);

    if (!data) {
      return null;
    }

    return JSON.parse(data);
  }

  async deleteByPattern(
  pattern: string,
) {
  const keys =
    await this.redis.keys(
      pattern,
    );

  if (keys.length > 0) {
    await this.redis.del(
      ...keys,
    );
  }
}

}
