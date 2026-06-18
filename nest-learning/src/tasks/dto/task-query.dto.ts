import {
    IsBooleanString,
    IsIn,
    IsInt,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';

export class TaskQueryDto {
    @ApiPropertyOptional({
        example: 1,
    })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    page?: number = 1;

    @ApiPropertyOptional({
        example: 10,
    })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    limit?: number = 10;

    @ApiPropertyOptional({
        example: 'nestjs',
    })
    @IsString()
    @IsOptional()
    search?: string;

    @ApiPropertyOptional({
        example: 'true',
    })
    @IsBooleanString()
    @IsOptional()
    completed?: string;

    @ApiPropertyOptional({
        example: 'createdAt',
        enum: ['createdAt', 'title'],
    })
    @IsOptional()
    @IsIn(['createdAt', 'title'])
    sort?: string = 'createdAt';

    @ApiPropertyOptional({
        example: 'desc',
        enum: ['asc', 'desc'],
    })
    @IsOptional()
    @IsIn(['asc', 'desc'])
    order?: 'asc' | 'desc' = 'desc';
}