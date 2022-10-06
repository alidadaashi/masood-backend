import { NextFunction, Request, Response } from "express";
import knex from "../../../base/database/cfgKnex";
import { GridFilterStateType } from "../../shared/types/tpFilter";
import SrCompanyDetails from "./srCompanyDetails";
import { srBuildFilterCriteria } from "../../shared/services/filters/srFilter";
import { utGetAllDataIdsArray } from "../../shared/utils/utFilter";
import { utCountTotalByQb } from "../../shared/utils/utData";

class CtCompanyDetails {
  static async getAllCompanies(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await knex.transaction(async (trx) => {
        const query = (req.query as unknown) as GridFilterStateType;
        const isSelectAllRows = (query.isSelectAllRows as unknown as string === "true");
        const { getDataForSelectedRows, instances } = req.body;
        const getAllCompaniesQb = SrCompanyDetails.getAllCompanies(trx, instances as string[]);
        const qbWithFilters = srBuildFilterCriteria(getAllCompaniesQb, {
          ...query,
          getDataForSelectedRows,
        });
        const allIds = isSelectAllRows ? await utGetAllDataIdsArray(trx, getAllCompaniesQb, "cId") : [];
        const data = await qbWithFilters;
        res.sendList({
          list: data,
          total: data?.length ? await utCountTotalByQb(qbWithFilters) : 0,
          allIds,
        });
      });
    } catch (e) {
      next(e);
    }
  }
}

export default CtCompanyDetails;
