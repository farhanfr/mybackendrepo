import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  UseGuards,
  Req,
  Delete,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

import { diskStorage } from 'multer';

import { v4 as uuidv4 } from 'uuid';

import { extname } from 'path';

import { UploadsService } from './uploads.service';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { multerOptions } from 'src/common/uploads/multer.config';

@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
  constructor(
    private readonly uploadsService: UploadsService,
  ) { }

  @Post()
  @ApiOperation({
    summary: 'Upload file',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', multerOptions),
  )
  uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize:
              5 * 1024 * 1024,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return {
      filename: file.filename,

      originalName:
        file.originalname,

      mimetype:
        file.mimetype,

      size: file.size,

      url:
        `/uploads/${file.filename}`,
    };
  }

  @Post('avatar')
  @ApiOperation({
    summary: 'Upload avatar',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', multerOptions),
  )
  uploadAvatar(
    @Req() req: any,

    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize:
              5 * 1024 * 1024,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.uploadsService.uploadAvatar(
      req.user.userId,
      file,
    );
  }

  @Delete('avatar')
  @ApiOperation({
    summary: 'Delete avatar',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  deleteAvatar(
    @Req() req: any,
  ) {
    return this.uploadsService.deleteAvatar(
      req.user.userId,
    );
  }

  @Post('multiple')
  @ApiOperation({
    summary: 'Upload multiple files',
  })
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
  uploadMultipleFiles(
    @UploadedFiles()
    files: Express.Multer.File[],
  ) {
    return files.map(
      (file) => ({
        filename:
          file.filename,

        originalName:
          file.originalname,

        size:
          file.size,

        url:
          `/uploads/${file.filename}`,
      }),
    );
  }
}