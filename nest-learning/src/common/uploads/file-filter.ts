// src/common/upload/file-filter.ts

import {
  BadRequestException,
} from '@nestjs/common';

import {
  ALLOWED_FILE_TYPES,
} from './upload.constants';

export const fileFilter = (
  req: any,
  file: Express.Multer.File,
  callback: Function,
) => {

  const isValid =
    ALLOWED_FILE_TYPES.test(
      file.originalname,
    );

  if (!isValid) {
    return callback(
      new BadRequestException(
        'Format file tidak didukung',
      ),
      false,
    );
  }

  callback(null, true);
};