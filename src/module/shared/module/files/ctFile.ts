import { NextFunction, Request, Response } from "express";
import knex from "../../../../base/database/cfgKnex";
import SrFile from "./srFile";
import MdUnprocessableEntityError from "../../../../base/errors/mdUnprocessableEntityError";
import {
  ERR_INVALID_DATA_PROVIDED, MESSAGE_FILES_UPLOADED, MESSAGE_FILE_UPDATED, MESSAGE_FILE_UPLOADED,
} from "../../constants/dtOtherConstants";
import { FileRequestType, TypeType } from "../../types/tpShared";

class CtFile {
  static async addFile(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { entityId } = req.params;
      const file = req.file as Express.Multer.File;
      const fType = req.body.fType as string;
      if (entityId && file && fType) {
        await knex.transaction(async (trx) => {
          const fileModel = await SrFile.addFile(trx, entityId, file, fType as string);
          res.sendObject(fileModel, MESSAGE_FILE_UPLOADED);
        });
      } else {
        throw new MdUnprocessableEntityError(ERR_INVALID_DATA_PROVIDED);
      }
    } catch (e) {
      next(e);
    }
  }

  static async addFiles(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { entityId, fType } = req.params;
      const files = req.files as Express.Multer.File[];
      if (entityId && files?.length > 0) {
        await knex.transaction(async (trx) => {
          const filesModel = await SrFile.addFiles(trx, entityId, files, fType as TypeType);
          res.sendObject(filesModel, MESSAGE_FILES_UPLOADED);
        });
      } else {
        throw new MdUnprocessableEntityError(ERR_INVALID_DATA_PROVIDED);
      }
    } catch (e) {
      next(e);
    }
  }

  static async updateFile(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { fileId } = req.params;
      const file = req.file as Express.Multer.File | string;
      if (fileId && file && typeof file !== "string") {
        await knex.transaction(async (trx) => {
          const fileModel = await SrFile.updateFile(trx, fileId, file);
          res.sendObject(fileModel, MESSAGE_FILE_UPDATED);
        });
      } else {
        throw new MdUnprocessableEntityError(ERR_INVALID_DATA_PROVIDED);
      }
    } catch (e) {
      next(e);
    }
  }

  static async getFileByType(
    req: Request<{ fType: string, entityId: string }>,
    res: Response<FileRequestType>,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        const { fType, entityId } = req.params;
        const response = await SrFile.getFileByType(trx, entityId, fType);
        res.sendObject(response);
      });
    } catch (e) {
      next(e);
    }
  }

  static async getUserFiles(
    req: Request<{ entityId: string }>,
    res: Response<FileRequestType[]>,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        const { entityId } = req.params;
        const response = await SrFile.getUserFiles(trx, entityId);
        res.sendObject(response);
      });
    } catch (e) {
      next(e);
    }
  }

  static async getFileById(
    req: Request<{ fId: string }>,
    res: Response<FileRequestType>,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        const { fId } = req.params;
        const response = await SrFile.getFileById(trx, fId);
        res.sendObject(response);
      });
    } catch (e) {
      next(e);
    }
  }

  static async getSharedFileByType(
    req: Request<{ fType: string }>,
    res: Response<FileRequestType>,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        const { fType } = req.params;
        const response = await SrFile.getSharedFileByType(trx, fType);
        res.sendObject(response);
      });
    } catch (e) {
      next(e);
    }
  }
}

export default CtFile;
