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
} from '@nestjs/common';

import {
    ApiBearerAuth,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard }
    from '../auth/guards/jwt-auth.guard';

import { CreateTaskDto }
    from './dto/create-task.dto';

import { TasksService }
    from './tasks.service';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';

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
        return this.tasksService.create(
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
}