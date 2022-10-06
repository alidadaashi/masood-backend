import * as Knex from 'knex';
import { QueryBuilder } from 'knex';
import doRecordTypeEntityType from '../../../../module/shared/module/recordEntities/recordTypeEntityType/doRecordTypeEntityType';
import {dtRecordTypeEntityType, dtEntityType} from '../../../../module/shared/data/dtRecordAndEntityType';
import doEntityType from '../../../../module/shared/module/recordEntities/entityType/doEntityType';

export async function seed(knex: Knex): Promise<QueryBuilder> {
  return knex.transaction(async (trx) => {
    await doEntityType.insertMany(trx, dtEntityType);
    await doRecordTypeEntityType.insertMany(trx, dtRecordTypeEntityType);
  });
}
