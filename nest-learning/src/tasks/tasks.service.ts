import * as fs from 'fs';
import * as path from 'path';

import { Injectable, NotFoundException } from '@nestjs/common';

import { Response }
  from 'express';

import { PrismaService } from '../prisma/prisma.service';

import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from 'src/tasks/dto/task-query.dto';

@Injectable()
export class TasksService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async create(
        userId: number,
        dto: CreateTaskDto,
    ) {
        return this.prisma.task.create({
            data: {
                title: dto.title,
                description: dto.description,

                user: {
                    connect: {
                        id: userId,
                    },
                },
            },
        });
    }

    async findAll(
        userId: number,
        query: TaskQueryDto,
    ) {
        const {
            page = 1,
            limit = 10,
            search,
            completed,
            sort = 'createdAt',
            order = 'desc',
        } = query;

        const where = {
            userId,
            deletedAt: null,
            ...(search && {
                title: {
                    contains: search,
                    mode: 'insensitive' as const,
                },
            }),

            ...(completed !== undefined && {
                completed: completed === 'true',
            }),
        };

        const [tasks, total] =
            await Promise.all([
                this.prisma.task.findMany({
                    where,

                    orderBy: {
                        [sort]: order,
                    },

                    skip: (page - 1) * limit,
                    take: limit,
                }),

                this.prisma.task.count({
                    where,
                }),
            ]);

        return {
            data: tasks,

            meta: {
                page,
                limit,
                total,

                totalPages: Math.ceil(
                    total / limit,
                ),

                hasNextPage:
                    page * limit < total,

                hasPreviousPage:
                    page > 1,
            },
        };

        // return this.prisma.task.findMany({
        //     where: {
        //         userId,

        //         ...(search && {
        //             title: {
        //                 contains: search,
        //                 mode: 'insensitive',
        //             },
        //         }),

        //         ...(completed !== undefined && {
        //             completed: completed === 'true',
        //         }),
        //     },

        //     orderBy: {
        //         [sort]: order,
        //     },

        //     skip: (page - 1) * limit,
        //     take: limit,
        // });
    }

    async findOne(
        taskId: number,
        userId: number,
    ) {
        return this.prisma.task.findFirst({
            where: {
                id: taskId,
                userId,
                deletedAt: null,
            },

            include: {
                attachments: true,
            },
        });
    }

    async update(
        taskId: number,
        userId: number,
        dto: UpdateTaskDto,
    ) {
        await this.findTaskOrThrow(
            taskId,
            userId,
        );

        return this.prisma.task.update({
            where: {
                id: taskId,
            },
            data: dto,
        });
    }

    async remove(
        taskId: number,
        userId: number,
    ) {
        await this.findTaskOrThrow(
            taskId,
            userId,
        );

        await this.prisma.task.update({
            where: {
                id: taskId,
            },

            data: {
                deletedAt: new Date(),
            },
        });

        return {
            message:
                'Task berhasil dihapus',
        };
    }

    async createWithTransaction(
        userId: number,
        dto: CreateTaskDto,
    ) {
        return this.prisma.$transaction(
            async (tx) => {

                const task =
                    await tx.task.create({
                        data: {
                            title: dto.title,
                            description:
                                dto.description,

                            user: {
                                connect: {
                                    id: userId,
                                },
                            },
                        },
                    });

                await tx.user.update({
                    where: {
                        id: userId,
                    },
                    data: {
                        updatedAt: new Date(),
                    },
                });

                return task;
            },
        );
    }

    async restore(
        taskId: number,
        userId: number,
    ) {
        const task =
            await this.prisma.task.findFirst({
                where: {
                    id: taskId,
                    userId,
                    NOT: {
                        deletedAt: null,
                    },
                },
            });

        if (!task) {
            throw new NotFoundException(
                'Task tidak ditemukan',
            );
        }

        return this.prisma.task.update({
            where: {
                id: taskId,
            },
            data: {
                deletedAt: null,
            },
        });
    }

    private async findTaskOrThrow(
        taskId: number,
        userId: number,
    ) {
        const task =
            await this.prisma.task.findFirst({
                where: {
                    id: taskId,
                    userId,
                    deletedAt: null,
                },
            });

        if (!task) {
            throw new NotFoundException(
                'Task tidak ditemukan',
            );
        }

        return task;
    }

    async uploadAttachments(
        taskId: number,
        userId: number,
        files: Express.Multer.File[],
    ) {

        await this.findTaskOrThrow(
            taskId,
            userId,
        );

        return this.prisma.taskAttachment.createManyAndReturn({
            data: files.map(
                (file) => ({
                    fileName:
                        file.originalname,

                    fileUrl:
                        `/uploads/${file.filename}`,

                    taskId,
                }),
            ),
        });
    }

    async deleteAttachment(
        attachmentId: number,
        userId: number,
    ) {

        const attachment =
            await this.prisma.taskAttachment.findFirst({
                where: {
                    id: attachmentId,

                    task: {
                        userId,
                    },
                },

                include: {
                    task: true,
                },
            });

        if (!attachment) {
            throw new NotFoundException(
                'Attachment tidak ditemukan',
            );
        }

        const filePath =
            path.join(
                process.cwd(),
                attachment.fileUrl.replace(
                    '/uploads/',
                    'uploads/',
                ),
            );

        if (
            fs.existsSync(filePath)
        ) {
            fs.unlinkSync(filePath);
        }

        await this.prisma.taskAttachment.delete({
            where: {
                id: attachmentId,
            },
        });

        return {
            message:
                'Attachment berhasil dihapus',
        };
    }

    async downloadAttachment(
        attachmentId: number,
        userId: number,
        response: Response,
    ) {

        const attachment =
            await this.prisma.taskAttachment.findFirst({
                where: {
                    id: attachmentId,

                    task: {
                        userId,
                    },
                },
            });

        if (!attachment) {
            throw new NotFoundException(
                'Attachment tidak ditemukan',
            );
        }

        const filePath =
            path.join(
                process.cwd(),
                attachment.fileUrl.replace(
                    '/uploads/',
                    'uploads/',
                ),
            );

        return response.download(
            filePath,
            attachment.fileName,
        );
    }
}