import { Transaction } from "knex";
import path from "path";
import { utGetYMDHPath } from "../../utils/utString";
import { utCreateOrReplaceFileOnDisk, utDeleteFileSync, utFileExistSync } from "../../utils/utFile";
import { ExtensionType, TypeType } from "../../types/tpShared";
import MdUnprocessableEntityError from "../../../../base/errors/mdUnprocessableEntityError";
import cfgApp from "../../../../base/configs/cfgApp";
import DoFile from "./doFile";
import { ERR_FILE_NOT_EXISTS } from "../../constants/dtOtherConstants";
import MdFiles from "./mdFile";

class SrFile {
  static saveFile(entityId: string, file: Express.Multer.File, type: string): string {
    const pathFromRootAssetsDir = path.normalize(
      path.join(cfgApp.assetsPath, utGetYMDHPath()),
    );
    const dirFullPath = path.resolve(pathFromRootAssetsDir);
    const filePathInDir = path.join(pathFromRootAssetsDir, `${entityId}-${type}${path.extname(file.originalname)}`);
    utCreateOrReplaceFileOnDisk(
      dirFullPath, filePathInDir, file.buffer,
    );

    return filePathInDir;
  }

  static async addFile(trx: Transaction, entityId: string, file: Express.Multer.File, type: string): Promise<MdFiles> {
    const filePathInDir = this.saveFile(entityId, file, type);
    const [fileModel] = await DoFile.insertOne(trx, {
      fEntityId: entityId,
      fExtension: path.extname(file.originalname) as ExtensionType,
      fName: file.originalname,
      fSizeBytes: file.size,
      fPath: filePathInDir,
      fType: type as TypeType,
    });

    return fileModel;
  }

  static async addFiles(
    trx: Transaction, entityId: string, files: Express.Multer.File[], fType: TypeType,
  ): Promise<MdFiles[]> {
    const filesData: MdFiles[] = files.map((file) => ({
      fEntityId: entityId,
      fExtension: path.extname(file.originalname) as ExtensionType,
      fName: file.originalname,
      fSizeBytes: file.size,
      fPath: this.saveFile(entityId, file, fType),
      fType,
    }));
    const insertedFiles = await DoFile.insertMany(trx, filesData);
    return insertedFiles;
  }

  static async updateFile(trx: Transaction, fileId: string, file: Express.Multer.File): Promise<MdFiles> {
    const existingFile = await DoFile.findOneByCol(trx, "fId", fileId);

    if (existingFile) {
      const fileFullPath = path.resolve(existingFile.fPath);
      if (utFileExistSync(fileFullPath)) {
        utDeleteFileSync(fileFullPath);
      }
      const filePathInDir = this.saveFile(fileId, file, existingFile.fType);

      const [fileModel] = await DoFile.updateOneByColName(trx, {
        fExtension: path.extname(file.originalname) as ExtensionType,
        fName: file.originalname,
        fPath: filePathInDir,
      }, "fId", fileId);

      return fileModel;
    }

    throw new MdUnprocessableEntityError(ERR_FILE_NOT_EXISTS);
  }

  static async getSharedFileByType(
    trx: Transaction,
    fType: string,
  ): Promise<MdFiles> {
    const fileByType: MdFiles = await DoFile.findOneByPredicate(trx, {
      fType: fType as TypeType,
    });
    return fileByType;
  }

  static async getFileByType(
    trx: Transaction,
    userEntityId: string,
    fType: string,
  ): Promise<MdFiles> {
    const fileByType: MdFiles = await DoFile.findOneByPredicate(trx, {
      fEntityId: userEntityId,
      fType: fType as TypeType,
    });
    return fileByType;
  }

  static async getUserFiles(
    trx: Transaction,
    userEntityId: string,
  ): Promise<MdFiles[]> {
    const userFiles: MdFiles[] = await DoFile.findAllByCol(trx, "fEntityId", userEntityId);
    return userFiles;
  }

  static async getFileById(
    trx: Transaction,
    fId: string,
  ): Promise<MdFiles> {
    const fileById: MdFiles = await DoFile.findOneByCol(trx, "fId", fId);
    return fileById;
  }
}

export default SrFile;
