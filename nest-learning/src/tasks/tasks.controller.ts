import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
    UploadedFiles,
    UseInterceptors,
    Res
} from '@nestjs/common';

import {
    FilesInterceptor,
} from '@nestjs/platform-express';

import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';

import { v4 as uuidv4 } from 'uuid';

import { JwtAuthGuard }
    from '../auth/guards/jwt-auth.guard';

import { CreateTaskDto }
    from './dto/create-task.dto';

import { TasksService }
    from './tasks.service';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Response } from 'express';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TasksController {
    constructor(
        private readonly tasksService: TasksService,
    ) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Create a new task',
    })
    create(
        @Req() req: any,
        @Body() dto: CreateTaskDto,
    ) {
        return this.tasksService.createWithTransaction(
            req.user.userId,
            dto,
        );
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Get all tasks of current user',
    })
    findAll(
        @Req() req: any,

        @Query()
        query: TaskQueryDto,
    ) {
        return this.tasksService.findAll(
            req.user.userId,
            query,
        );
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Get task by id',
    })
    findOne(
        @Param('id', ParseIntPipe)
        id: number,

        @Req() req: any,
    ) {
        return this.tasksService.findOne(
            id,
            req.user.userId,
        );
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Update task',
    })
    update(
        @Param('id', ParseIntPipe)
        id: number,

        @Req() req: any,

        @Body()
        dto: UpdateTaskDto,
    ) {
        return this.tasksService.update(
            id,
            req.user.userId,
            dto,
        );
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Delete task',
    })
    remove(
        @Param('id', ParseIntPipe)
        id: number,

        @Req() req: any,
    ) {
        return this.tasksService.remove(
            id,
            req.user.userId,
        );
    }

    @Patch(':id/restore')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Restore task',
    })
    restore(
        @Param('id', ParseIntPipe)
        id: number,

        @Req() req: any,
    ) {
        return this.tasksService.restore(
            id,
            req.user.userId,
        );
    }

    @Post(':id/attachments')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                files: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                },
            },
        },
    })
    @UseInterceptors(
        FilesInterceptor(
            'files',
            10,
            {
                storage: diskStorage({
                    destination:
                        './uploads',

                    filename: (
                        req,
                        file,
                        callback,
                    ) => {

                        const uniqueName =
                            `${uuidv4()}${extname(
                                file.originalname,
                            )}`;

                        callback(
                            null,
                            uniqueName,
                        );
                    },
                }),
            },
        ),
    )
    uploadAttachments(
        @Param('id', ParseIntPipe)
        taskId: number,

        @Req() req: any,

        @UploadedFiles()
        files: Express.Multer.File[],
    ) {
        return this.tasksService
            .uploadAttachments(
                taskId,
                req.user.userId,
                files,
            );
    }

    @Delete('attachments/:attachmentId')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Delete attachment',
    })
    deleteAttachment(
        @Param(
            'attachmentId',
            ParseIntPipe,
        )
        attachmentId: number,

        @Req() req: any,
    ) {
        return this.tasksService.deleteAttachment(
            attachmentId,
            req.user.userId,
        );
    }

    @Get('attachments/:attachmentId/download')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiOperation({
  summary:
    'Download attachment',
})
downloadAttachment(
  @Param(
    'attachmentId',
    ParseIntPipe,
  )
  attachmentId: number,

  @Req() req: any,

  @Res()
  response: Response,
) {
  return this.tasksService
    .downloadAttachment(
      attachmentId,
      req.user.userId,
      response,
    );
}
}