import * as fs from 'fs';
import * as path from 'path';

import { Injectable, NotFoundException } from '@nestjs/common';

import { Response }
    from 'express';

import { PrismaService } from '../prisma/prisma.service';

import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from 'src/tasks/dto/task-query.dto';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class TasksService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly redisService: RedisService,
    ) { }

    async create(
        userId: number,
        dto: CreateTaskDto,
    ) {
        const task =
            await this.prisma.task.create({
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

        await this.clearTasksCache(
            userId,
        );

        return task;
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

        const cacheKey =
            `tasks:${userId}:${page}:${limit}:${search ?? ''}:${completed ?? ''}:${sort}:${order}`;

        const cachedTasks =
            await this.redisService.getJson(cacheKey);

        if (cachedTasks) {
            console.log('FROM REDIS');

            return cachedTasks;
        }

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
                completed:
                    completed === 'true',
            }),
        };

        console.log('FROM DATABASE');

        const [tasks, total] =
            await Promise.all([
                this.prisma.task.findMany({
                    where,

                    orderBy: {
                        [sort]: order,
                    },

                    skip:
                        (page - 1) * limit,

                    take: limit,
                }),

                this.prisma.task.count({
                    where,
                }),
            ]);

        const result = {
            data: tasks,

            meta: {
                page,
                limit,
                total,

                totalPages:
                    Math.ceil(
                        total / limit,
                    ),

                hasNextPage:
                    page * limit < total,

                hasPreviousPage:
                    page > 1,
            },
        };

        await this.redisService.setJson(
            cacheKey,
            result,
            60,
        );

        return result;
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

        const task =
            await this.prisma.task.update({
                where: {
                    id: taskId,
                },
                data: dto,
            });

        await this.clearTasksCache(
            userId,
        );

        return task;
    }

    async remove(
        taskId: number,
        userId: number,
    ) {
        await this.findTaskOrThrow(
            taskId,
            userId,
        );

        const task =
            await this.prisma.task.update({
                where: {
                    id: taskId,
                },
                data: {
                    deletedAt: new Date(),
                },
            });

        await this.clearTasksCache(
            userId,
        );

        return task;
    }

    async createWithTransaction(
        userId: number,
        dto: CreateTaskDto,
    ) {
        const task = await this.prisma.$transaction(
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

        await this.clearTasksCache(
            userId,
        );

        return task;
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

        const restoredTask =
            await this.prisma.task.update({
                where: {
                    id: taskId,
                },
                data: {
                    deletedAt: null,
                },
            });

        await this.clearTasksCache(
            userId,
        );

        return restoredTask;
    }

    private async clearTasksCache(
        userId: number,
    ) {
        console.log('CACHE CLEARED');
        await this.redisService.deleteByPattern(
            `tasks:${userId}:*`,
        );
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

        const attachments =
            await this.prisma.taskAttachment.createManyAndReturn({
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

        await this.clearTasksCache(
            userId,
        );

        return attachments;
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

await this.clearTasksCache(
  userId,
);

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