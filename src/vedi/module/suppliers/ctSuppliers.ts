import { NextFunction, Request, Response } from "express";
import knex from "../../../base/database/cfgKnex";
import MdUnprocessableEntityError from "../../../base/errors/mdUnprocessableEntityError";
import { ERR_DOCUMENT_TYPE_REQUIRED, ERR_SESSION_NOT_EXISTS } from "../../../module/shared/constants/dtOtherConstants";
import SrSuppliers from "./srSuppliers";
import { GridFilterStateType } from "../../../module/shared/types/tpFilter";
import { DocumentTypeType } from "../../../module/shared/types/tpShared";
import { utGetExportableColumns } from "../../../module/shared/utils/utData";
import SrGenerateDocument from "../../../module/shared/services/srGenerateDocument";

class CtSuppliers {
  static async getAllVendorSuppliers(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const session = req.session?.oldDbUser;
      const filters = req.query as unknown as GridFilterStateType;
      await knex.transaction(async (trx) => {
        if (session) {
          const suppliers = await SrSuppliers.getAllSuppliersForVendor(trx, session.vendorId, filters);
          res.sendList(suppliers);
        } else {
          throw new MdUnprocessableEntityError(ERR_SESSION_NOT_EXISTS);
        }
      });
    } catch (e) {
      next(e);
    }
  }

  static async generateDocument(
    req: Request<{ documentType: DocumentTypeType }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const session = req.session.oldDbUser;
      if (!session) throw new MdUnprocessableEntityError(ERR_SESSION_NOT_EXISTS);
      const { documentType } = req.params;
      if (documentType) {
        await knex.transaction(async (trx) => {
          const { exports, ...filters } = req.query as unknown as GridFilterStateType;
          const data = await SrSuppliers.getAllSuppliersForVendor(trx, session.vendorId, filters);
          const colsToExport = utGetExportableColumns(exports);
          const bufferData = await SrGenerateDocument
            .generateDocumentByType(data.list, documentType, colsToExport,
              { heading: exports?.title || "Suppliers List", dateDisplayFormat: "" });
          SrGenerateDocument.setAttachmentType(res, exports?.filename || "suppliers-list", documentType);
          res.send(bufferData);
        });
      } else {
        throw new MdUnprocessableEntityError(ERR_DOCUMENT_TYPE_REQUIRED);
      }
    } catch (e) {
      next(e);
    }
  }
}

export default CtSuppliers;
