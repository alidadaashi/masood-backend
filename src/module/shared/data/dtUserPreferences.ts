import { MiscellaneousSettingsType, UserPreferencesType } from "../types/tpShared";

export const defaultUserPreferences: UserPreferencesType = {
  numFmt: ",sep.decimal",
  decRng: 2,
  qtyDecRng: 2,
  amtDecRng: 2,
  uPrcDecRng: 2,
  exRateDecRng: 2,
  pctDecRng: 2,
  amtCurrencySmbl: "$",
  amtCurrencyCode: "USD",
  amtCurrencyName: "$ - USD - US Dollar",
  currencySmblPlacement: "left",
  pctSmblPlacement: "###%",
  weekNumberDisplay: false,
  weekStartDay: "Mon",
  dateInputFormat: "dd/MM/yyyy",
  dateDisplayFormat: "DD/MM/YYYY",
  defaultDtPageSize: 10,
  timeZoneValue: Intl.DateTimeFormat().resolvedOptions().timeZone,
  timeFormat: "h12",
  language: "En",
};

export const defaultMiscellaneousSettings: MiscellaneousSettingsType = {
  version: "Beta Version",
  contact: "123 1234 1234",
  email: "info@vsrm.io",
};
