import {
    Controller,
    Get,
    Param,
} from '@nestjs/common';

import { RedisService }
    from './redis.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Redis')
@Controller('redis')
export class RedisController {
    constructor(
        private readonly redisService:
            RedisService,
    ) { }

    @Get('set/:key/:value')
    async set(
        @Param('key')
        key: string,

        @Param('value')
        value: string,
    ) {
        await this.redisService.set(
            key,
            value,
        );

        return {
            message: 'OK',
        };
    }

    @Get('get/:key')
    async get(
        @Param('key')
        key: string,
    ) {
        const value =
            await this.redisService.get(
                key,
            );

        return {
            key,
            value,
        };
    }

    @Get(
        'set-expire/:key/:value/:ttl',
    )
    async setExpire(
        @Param('key')
        key: string,

        @Param('value')
        value: string,

        @Param('ttl')
        ttl: string,
    ) {

        await this.redisService
            .setWithExpiry(
                key,
                value,
                Number(ttl),
            );

        return {
            message:
                'Saved with expiry',
        };
    }

    @Get('ttl/:key')
    async ttl(
        @Param('key')
        key: string,
    ) {
        const ttl =
            await this.redisService.ttl(
                key,
            );

        return {
            key,
            ttl,
        };
    }

    @Get('delete/:key')
    async delete(
        @Param('key')
        key: string,
    ) {
        await this.redisService.delete(
            key,
        );

        return {
            message:
                'Deleted',
        };
    }

}