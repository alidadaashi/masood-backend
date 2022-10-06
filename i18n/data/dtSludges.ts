import { dtSlgToolbar } from "./slugs/dtSlgToolbar";
import { dtSlgForm } from "./slugs/dtSlgForm";
import { dtSlgHeader } from "./slugs/dtSlgHeader";
import { dtSlgDrawer } from "./slugs/dtSlgDrawer";
import { dtSlgMisc } from "./slugs/dtSlgMisc";
import { dtSlgPage } from "./slugs/dtSlgPage";
import { dtSlgTable } from "./slugs/dtSlgTable";
import { dtSlgAuth } from "./slugs/dtSlgAuth";
import dtSlgProduct from "./slugs/dtSlgProduct";
import { dtSlgDynamic } from "./slugs/dtSlgDynamic";
import { dtSlgFooter } from "./slugs/dtSlgFooter";
// NOTE: there is a recursive imports issue when placing this in dtI18n.ts, keeping it in separate file for now
export const dtAllSludges = [
  ...dtSlgToolbar,
  ...dtSlgForm,
  ...dtSlgHeader,
  ...dtSlgFooter,
  ...dtSlgDrawer,
  ...dtSlgTable,
  ...dtSlgMisc,
  ...dtSlgPage,
  ...dtSlgAuth,
  ...dtSlgProduct,
  ...dtSlgDynamic,
] as const;
