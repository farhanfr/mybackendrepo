// src/common/upload/multer.config.ts

import { diskStorage } from 'multer';

import { extname } from 'path';

import { v4 as uuidv4 } from 'uuid';

import {
  MAX_FILE_SIZE,
} from './upload.constants';

import {
  fileFilter,
} from './file-filter';

export const multerOptions = {
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

  limits: {
    fileSize:
      MAX_FILE_SIZE,
  },

  fileFilter,
};