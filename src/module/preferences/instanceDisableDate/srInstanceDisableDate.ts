import { Transaction } from "knex";
import { tpInstanceDisableDate, tpUserInstances } from "../../shared/types/tpShared";
import doInstanceDisableDate from "./doInstanceDisableDate";

class SrInstanceDisableDates {
  static async updateInstanceDisableDates(
    trx: Transaction,
    selectedInstances: tpUserInstances[],
    data: tpInstanceDisableDate[],
  ): Promise<void> {
    await Promise.all(selectedInstances.map(async (instance) => {
      await doInstanceDisableDate.deleteManyByCol(trx, "iddEntityId", instance.gEntityId);
      const addDisableDates = data.map(async (date) => (
        doInstanceDisableDate.insertOne(trx, {
          iddEntityId: instance.gEntityId,
          iddStatus: date.effective,
          iddStartDate: date.startDate,
          iddEndDate: date.endDate,
          iddDescription: date.description,
        })
      ));
      await Promise.all(addDisableDates);
    }));
  }

  static async getInstanceDisableDates(
    trx: Transaction,
    selectedInstances: tpUserInstances[],
  ): Promise<tpInstanceDisableDate[]> {
    let disableDatesDataforSelectedInstances:tpInstanceDisableDate[] = [];
    await Promise.all(selectedInstances.map(async (instance) => {
      const disableDatesResp = await doInstanceDisableDate.findAllByCol(trx, "iddEntityId", instance.gEntityId);
      const instanceDisableDates = disableDatesResp.map((date) => ({
        effective: date.iddStatus,
        description: date.iddDescription,
        startDate: date.iddStartDate,
        endDate: date.iddEndDate,
        rowId: date.iddId,
        gName: instance.gName,
      }));
      disableDatesDataforSelectedInstances = [...instanceDisableDates];
    }));
    return disableDatesDataforSelectedInstances;
  }
}

export default SrInstanceDisableDates;
