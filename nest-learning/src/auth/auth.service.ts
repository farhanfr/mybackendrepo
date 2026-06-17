import * as bcrypt from 'bcrypt';

import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    async register(dto: RegisterDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            },
        });

        if (existingUser) {
            throw new ConflictException(
                'Email sudah digunakan',
            );
        }

        const hashedPassword = await bcrypt.hash(
            dto.password,
            10,
        );

        return this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                password: hashedPassword,
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            },
        });

        if (!user) {
            throw new UnauthorizedException(
                'Email atau password salah',
            );
        }

        const isPasswordValid =
            await bcrypt.compare(
                dto.password,
                user.password,
            );

        if (!isPasswordValid) {
            throw new UnauthorizedException(
                'Email atau password salah',
            );
        }

        const tokens =
            await this.generateTokens(user);

        await this.updateRefreshToken(
            user.id,
            tokens.refresh_token,
        );

        return tokens;
    }

    async generateTokens(user: {
        id: number;
        email: string;
        role: string;
    }) {
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };

        const access_token =
            this.jwtService.sign(payload, {
                secret: process.env.JWT_SECRET,
                expiresIn: '15m',
            });

        const refresh_token =
            this.jwtService.sign(payload, {
                secret: process.env.JWT_REFRESH_SECRET,
                expiresIn: '7d',
            });

        return {
            access_token,
            refresh_token,
        };
    }


    async updateRefreshToken(
        userId: number,
        refreshToken: string,
    ) {
        const hashedRefreshToken =
            await bcrypt.hash(
                refreshToken,
                10,
            );

        await this.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                refreshToken:
                    hashedRefreshToken,
            },
        });
    }

    async refreshToken(
        refreshToken: string,
    ) {
        try {
            const payload = this.jwtService.verify(
                refreshToken,
                {
                    secret: process.env.JWT_REFRESH_SECRET,
                },
            );

            const user =
                await this.prisma.user.findUnique({
                    where: {
                        id: payload.userId,
                    },
                });

            if (!user || !user.refreshToken) {
                throw new UnauthorizedException(
                    'Refresh token tidak valid',
                );
            }

            const isMatch =
                await bcrypt.compare(
                    refreshToken,
                    user.refreshToken,
                );

            if (!isMatch) {
                throw new UnauthorizedException(
                    'Refresh token tidak valid',
                );
            }

            return this.generateTokens(user);
        } catch {
            throw new UnauthorizedException(
                'Refresh token tidak valid',
            );
        }
    }

    async logout(userId: number) {
        await this.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                refreshToken: null,
            },
        });

        return {
            message: 'Logout berhasil',
        };
    }

}
