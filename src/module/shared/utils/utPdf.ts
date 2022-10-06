import path from "path";
// eslint-disable-next-line import/no-unresolved
import { Column, TableCell, TDocumentDefinitions } from "pdfmake/interfaces";
import cfgApp from "../../../base/configs/cfgApp";

export const pdfFonts = {
  Roboto: {
    normal: path.join(cfgApp.assetsPath, "fonts", "Roboto-Regular.ttf"),
    bold: path.join(cfgApp.assetsPath, "fonts", "Roboto-Medium.ttf"),
    italics: path.join(cfgApp.assetsPath, "fonts", "Roboto-Italic.ttf"),
    bolditalics: path.join(cfgApp.assetsPath, "fonts", "Roboto-MediumItalic.ttf"),
  },
};

const utGetPdfColumnsDef = (heading: string): Column[] => [
  {
    image: path.join(cfgApp.assetsPath, "images", "itg-logo.png"),
    width: 100,
    height: 30,
  },
  {
    margin: [10, 0, 150, 0],
    text: heading || "List",
    alignment: "center",
    fontSize: 22,
    bold: true,
  },
];

export const utPdfDocDefinition = (body: unknown[], heading: string): TDocumentDefinitions => ({
  header() {
    return {
      margin: 14,
      columns: utGetPdfColumnsDef(heading),
    };
  },
  content: [
    {
      margin: [30, 30, 0, 0],
      table: {
        headerRows: 1,
        widths: "auto",
        body: body as TableCell[][],
      },
      fontSize: 8,
      layout: {
        fillColor(rowIndex) {
          if (rowIndex === 0) {
            return "#c4c4c4";
          }
          return ((rowIndex + 1) % 2 !== 0) ? "#e2e2e2" : null;
        },
      },
    },
  ],
  footer(currentPage, pageCount) {
    return {
      margin: [20, 0, 0, 0],
      table: {
        body: [
          [
            {
              text: `Page ${currentPage.toString()} of ${pageCount}`,
              alignment: "center",
              style: "normalText",
              margin: [0, 20, 50, 0],
            },
          ],
        ],
      },
      layout: "noBorders",
    };
  },
});
