import {
    IsBoolean,
    IsOptional,
    IsString,
} from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTaskDto {
    @ApiPropertyOptional({
        example: 'Belajar NestJS Advanced',
    })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiPropertyOptional({
        example: 'Belajar Pagination',
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({
        example: true,
    })
    @IsBoolean()
    @IsOptional()
    completed?: boolean;
}