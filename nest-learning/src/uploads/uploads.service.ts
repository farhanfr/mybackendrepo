import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService }
    from 'src/prisma/prisma.service';

import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadsService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async uploadAvatar(
        userId: number,
        file: Express.Multer.File,
    ) {
        const avatarUrl =
            `/uploads/${file.filename}`;

        const existingUser =
            await this.prisma.user.findUnique({
                where: {
                    id: userId,
                },
            });

        if (existingUser?.avatar) {

            const oldFilePath =
                path.join(
                    process.cwd(),
                    existingUser.avatar.replace(
                        '/uploads/',
                        'uploads/',
                    ),
                );

            if (
                fs.existsSync(oldFilePath)
            ) {
                fs.unlinkSync(
                    oldFilePath,
                );
            }
        }

        const user =
            await this.prisma.user.update({
                where: {
                    id: userId,
                },

                data: {
                    avatar: avatarUrl,
                },
            });

        return {
            avatar: user.avatar,
        };
    }

    async deleteAvatar(
        userId: number,
    ) {
        const user =
            await this.prisma.user.findUnique({
                where: {
                    id: userId,
                },
            });

        if (!user) {
            throw new NotFoundException(
                'User tidak ditemukan',
            );
        }

        if (!user.avatar) {
            throw new NotFoundException(
                'Avatar tidak ditemukan',
            );
        }

        const filePath =
            path.join(
                process.cwd(),
                user.avatar.replace(
                    '/uploads/',
                    'uploads/',
                ),
            );

        if (
            fs.existsSync(filePath)
        ) {
            fs.unlinkSync(filePath);
        }

        await this.prisma.user.update({
            where: {
                id: userId,
            },

            data: {
                avatar: null,
            },
        });

        return {
            message:
                'Avatar berhasil dihapus',
        };
    }
}