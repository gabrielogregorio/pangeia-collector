import fs from 'fs';
import path from 'path';
import { CustomError } from '../error';

type OptionsFindRecursiveFiles = {
  directory: string;
  bannedPaths: string[];
};

type OptionsFindRecursiveFilesReturn = {
  files: string[];
  bannedPaths: string[];
  ignoredFiles: string[];
};

const findRecursiveFilesInternal = ({ directory, bannedPaths }: OptionsFindRecursiveFiles) => {
  const response: OptionsFindRecursiveFilesReturn = {
    files: [],
    bannedPaths: [],
    ignoredFiles: []
  };

  function scanDirectory(currentDir: string) {
    const files = fs.readdirSync(currentDir);

    files.forEach((file) => {
      const filePath = path.join(currentDir, file);
      const isDirectory = fs.statSync(filePath).isDirectory();

      const pathIsBanned = bannedPaths.some((regex) => RegExp(regex).test(filePath));
      if (pathIsBanned) {
        response.bannedPaths.push(filePath);
        return;
      }

      if (isDirectory) {
        scanDirectory(filePath);
        return;
      }
      response.files.push(filePath);
    });
  }

  scanDirectory(directory);

  return response;
};

export const findRecursiveFiles = (options: OptionsFindRecursiveFiles): OptionsFindRecursiveFilesReturn => {
  try {
    return findRecursiveFilesInternal(options);
  } catch (error: unknown) {
    if (!error) {
      throw new CustomError(`An unknown error occurred when reading the directory with the following options "${JSON.stringify(options)}"`);
    }

    if (error && typeof error === 'object' && 'message' in error) {
      throw new CustomError(String(error?.message));
    }

    throw new CustomError(`Unknown error getting paths "${error}"`);
  }
};
