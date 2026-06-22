import {
    Body,
    Controller,
    Get,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

import {
    ApiBearerAuth,
    ApiTags,
} from '@nestjs/swagger';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Throttle } from '@nestjs/throttler';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) { }

    @Post('register')
    register(
        @Body() dto: RegisterDto,
    ) {
        return this.authService.register(dto);
    }

    @Throttle({
        default: {
            limit: 3,
            ttl: 60000,
        },
    })
    @Post('login')
    login(
        @Body() dto: LoginDto,
    ) {
        return this.authService.login(dto);
    }

    @Get('profile')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    profile(
        @Req() req: any,
    ) {
        return {
            message: 'Profile berhasil diakses',
            user: req.user,
        };
    }

    @Post('refresh')
    refresh(
        @Body()
        dto: RefreshTokenDto,
    ) {
        return this.authService.refreshToken(
            dto.refreshToken,
        );
    }

    @Post('logout')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    logout(@Req() req: any) {
        return this.authService.logout(
            req.user.userId,
        );
    }

    @Post('forgot-password')
    forgotPassword(
        @Body()
        dto: ForgotPasswordDto,
    ) {
        return this.authService
            .forgotPassword(dto);
    }

}