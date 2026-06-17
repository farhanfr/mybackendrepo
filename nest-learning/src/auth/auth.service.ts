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

        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };

        const access_token =
            this.jwtService.sign(payload);

        return {
            message: 'Login berhasil',
            access_token,
        };
    }

}
