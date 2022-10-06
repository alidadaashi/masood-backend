import fs from "fs";

export const utCreateDirSync = (dir: string): string | undefined => fs.mkdirSync(dir, { recursive: true });

export const utDeleteFileSync = (fullPath: string): void => fs.unlinkSync(fullPath);
export const utDeleteFile = (fullPath: string, cb: () => void): void => fs.unlink(fullPath, cb);
export const utFileExistSync = (fullPath: string): boolean => fs.existsSync(fullPath);

export const utGetFileSync = (
  fullPath: string, encoding: BufferEncoding = "utf-8",
): string => fs.readFileSync(fullPath, { encoding });
export const utDirExistsSync = (
  dir: string,
): boolean => fs.existsSync(dir);

export const utWriteFileOnDiskSync = (fullFilePath: string, fileData: Buffer): void => fs
  .writeFileSync(fullFilePath, fileData);

export const utCreateOrReplaceFileOnDisk = (dir: string, fullFilePath: string, fileData: Buffer): void => {
  if (!utDirExistsSync(dir)) utCreateDirSync(dir);
  if (utFileExistSync(fullFilePath)) utDeleteFileSync(fullFilePath);
  utWriteFileOnDiskSync(fullFilePath, fileData);
};
