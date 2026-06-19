import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';

import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';


import { FileInterceptor } from '@nestjs/platform-express';

import { diskStorage } from 'multer';

import { v4 as uuidv4 }
  from 'uuid';

import { extname }
  from 'path';

@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
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
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',

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
    }),
  )
  uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize:
              5 * 1024 * 1024,
          }),

          new FileTypeValidator({
            fileType:
              /(jpg|jpeg|png|pdf)$/,
          }),
        ],
      }),
    )
    file: Express.Multer.File
  ) {
    return {
      filename: file.filename,

      originalName:
        file.originalname,

      mimetype:
        file.mimetype,

      size: file.size,

      url: `/uploads/${file.filename}`,
    };
  }
}