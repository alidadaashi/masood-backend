import * as Knex from "knex";

// TODO: remove later
export async function seed(knex: Knex): Promise<void> {
  /* return knex.transaction(async (trx) => {
    await ModuleDao.insertMany(trx, allModules);
    await Promise.all(allPages.map(async ({ page, module }):Promise<void> => {
      const moduleModel = await ModuleDao.findOneByCol(trx, "mModuleName", module);
      if (moduleModel?.mModuleId) await DoPages.insertOne(trx, ({ pgName: page, pgModuleId: moduleModel.mModuleId }));
      else throw new MdUnprocessableEntityError(`The module ${module} does not exists`);
    }));
  }); */
}

export const other = "";
