import { ApiProperty }
    from '@nestjs/swagger';

import {
    IsString,
    MinLength,
} from 'class-validator';

export class ResetPasswordDto {

    @ApiProperty({
        example:
            'e5c70dd1-7a3d-4d52-92c2-0cb37cf8fdc8',
    })
    @IsString()
    token!: string;

    @ApiProperty({
        example:
            'passwordbaru123',
        minLength: 6,
    })
    @IsString()
    @MinLength(6)
    password!: string;
}