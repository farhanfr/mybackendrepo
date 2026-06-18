import { Injectable, NotFoundException } from '@nestjs/common';

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
        const task =
            await this.prisma.task.findFirst({
                where: {
                    id: taskId,
                    userId,
                },
            });

        if (!task) {
            throw new NotFoundException(
                'Task tidak ditemukan',
            );
        }

        return task;
    }

    async update(
        taskId: number,
        userId: number,
        dto: UpdateTaskDto,
    ) {
        const task =
            await this.prisma.task.findFirst({
                where: {
                    id: taskId,
                    userId,
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
            data: dto,
        });
    }

    async remove(
        taskId: number,
        userId: number,
    ) {
        const task =
            await this.prisma.task.findFirst({
                where: {
                    id: taskId,
                    userId,
                },
            });

        if (!task) {
            throw new NotFoundException(
                'Task tidak ditemukan',
            );
        }

        await this.prisma.task.delete({
            where: {
                id: taskId,
            },
        });

        return {
            message:
                'Task berhasil dihapus',
        };
    }
}