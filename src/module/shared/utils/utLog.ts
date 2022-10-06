import { format } from "sql-formatter";

export const stdLog = (...params: string[]): void => {
  console.log(...params);
};

export const stdLogDeep = (param: unknown): void => {
  console.dir(param, { depth: null });
};

export const stdLogQuery = (query: string):void => {
  const formattedQuery = format(query, {
    indent: "  ",
    language: "postgresql",
    uppercase: true,
  });
  stdLog(formattedQuery);
};

export const other = "";
