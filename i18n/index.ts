import { getSludgesAsObject, utI18n } from "./utils/utI18n";
import { dtAllSludges } from "./data/dtSludges";
import { tpSlugs, tpSlugsEmails } from "./types/tpI18n";

export const appSlug = getSludgesAsObject(dtAllSludges);

export const i18n = utI18n;

export const getSlug = (slugKey: tpSlugs): string => slugKey as string;

export const getEmailsSlug = (slugKey: tpSlugsEmails): string => slugKey as string;

// example usage:
//  i18n({})("main", "drawer", "mnu_lbl_admin");
