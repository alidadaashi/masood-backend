import { Transaction } from "knex";
import { COL_TRANS_ROW_CAMPAIGN_ID } from "../../shared/constants/dtI18nModuleConstants";
import SrGenerateDocument from "../../shared/services/srGenerateDocument";
import { utGetExportableColumns } from "../../shared/utils/utData";
import { utGetColumnsForExport } from "../../shared/utils/utExcel";
import {
  CAMPAIGN_SLUG,
  CAMPAIGN_START_DATE,
  CAMPAIGN_STATUS,
  EMAIL_CAMPAIGN_SALUTATION,
  SUPPLIER_CAMPAIGN_SENT_FOR_APPROVAL_EMAIL_CONTENT,
  SUPPLIER_CAMPAIGN_SENT_FOR_APPROVAL_EMAIL_HEADER,
  SUPPLIER_CAMPAIGN_SENT_FOR_APPROVAL_EMAIL_SUBJECT,
  SUPPLIER_CAMPAIGN_WITHDRAWL_EMAIL_CONTENT, SUPPLIER_CAMPAIGN_WITHDRAWL_EMAIL_HEADER,
  SUPPLIER_CAMPAIGN_WITHDRAWL_EMAIL_SUBJECT,
  VENDOR_CAMPAIGN_APPROVAL_EMAIL_CONTENT,
  VENDOR_CAMPAIGN_APPROVAL_EMAIL_HEADER,
  VENDOR_CAMPAIGN_APPROVAL_EMAIL_SUBJECT, VENDOR_CAMPAIGN_REJECT_EMAIL_CONTENT,
  VENDOR_CAMPAIGN_REJECT_EMAIL_HEADER, VENDOR_CAMPAIGN_REJECT_EMAIL_SUBJECT,
  VENDOR_CAMPAIGN_REVISION_REQUEST_EMAIL_CONTENT,
  VENDOR_CAMPAIGN_REVISION_REQUEST_EMAIL_HEADER,
  VENDOR_CAMPAIGN_REVISION_REQUEST_EMAIL_SUBJECT, VENDOR_CAMPAIGN_REVOKE_EMAIL_CONTENT,
  VENDOR_CAMPAIGN_REVOKE_EMAIL_HEADER,
  VENDOR_CAMPAIGN_REVOKE_EMAIL_SUBJECT,
  VSRM_CAMPAIGN_EMAIL_FOOTER_CONTENT,
  VSRM_CAMPAIGN_EMAIL_INFO_MESSAGE,
} from "./dtCampaignEmails";
import MdCampaign from "../mdCampaign";
import SrCampaign from "../srCampaign";
import { tpCampaignStatuses } from "../tpCampaign";
import doCampaignFieldDescriptor from "../campaignFieldDescriptor/doCampaignFieldDescriptor";
import { utI18nInternalEmails } from "../../../../i18n/utils/utI18n";
import { AppEnv } from "../../../base/loaders/cfgBaseLoader";
import { utGetCampDetailsExcelFieldsConfigs, utGetCampDetailsExcelFieldsConfigsForSupplier } from "../../../vedi/dataMigration/utils/utExports";
import { EntityTypes } from "../../shared/types/tpShared";

export const utGetEmailSubjectFromStatus = (
  status: tpCampaignStatuses,
): string | null => {
  if (status === "Submit for Approval") return SUPPLIER_CAMPAIGN_SENT_FOR_APPROVAL_EMAIL_SUBJECT;
  if (status === "Withdraw From Approval") return SUPPLIER_CAMPAIGN_WITHDRAWL_EMAIL_SUBJECT;
  if (status === "Confirm") return VENDOR_CAMPAIGN_APPROVAL_EMAIL_SUBJECT;
  if (status === "Request Revision") return VENDOR_CAMPAIGN_REVISION_REQUEST_EMAIL_SUBJECT;
  if (status === "Reject") return VENDOR_CAMPAIGN_REJECT_EMAIL_SUBJECT;
  if (status === "Cancel") return VENDOR_CAMPAIGN_REVOKE_EMAIL_SUBJECT;
  return null;
};

const utGetEmailBodyContentFromStatus = (status: tpCampaignStatuses): string => {
  if (status === "Submit for Approval") return SUPPLIER_CAMPAIGN_SENT_FOR_APPROVAL_EMAIL_CONTENT;
  if (status === "Withdraw From Approval") return SUPPLIER_CAMPAIGN_WITHDRAWL_EMAIL_CONTENT;
  if (status === "Confirm") return VENDOR_CAMPAIGN_APPROVAL_EMAIL_CONTENT;
  if (status === "Request Revision") return VENDOR_CAMPAIGN_REVISION_REQUEST_EMAIL_CONTENT;
  if (status === "Reject") return VENDOR_CAMPAIGN_REJECT_EMAIL_CONTENT;
  if (status === "Cancel") return VENDOR_CAMPAIGN_REVOKE_EMAIL_CONTENT;
  return "";
};

const utGetEmailHeaderContentFromStatus = (status: tpCampaignStatuses): string => {
  if (status === "Submit for Approval") return SUPPLIER_CAMPAIGN_SENT_FOR_APPROVAL_EMAIL_HEADER;
  if (status === "Withdraw From Approval") return SUPPLIER_CAMPAIGN_WITHDRAWL_EMAIL_HEADER;
  if (status === "Confirm") return VENDOR_CAMPAIGN_APPROVAL_EMAIL_HEADER;
  if (status === "Request Revision") return VENDOR_CAMPAIGN_REVISION_REQUEST_EMAIL_HEADER;
  if (status === "Reject") return VENDOR_CAMPAIGN_REJECT_EMAIL_HEADER;
  if (status === "Cancel") return VENDOR_CAMPAIGN_REVOKE_EMAIL_HEADER;
  return "";
};

const utGetCampFieldsColumns = async (trx: Transaction) => {
  const campDetailsExportColumns = (await doCampaignFieldDescriptor.getAll(trx)).map((col, idx) => ({
    field: col.cfdSlug,
    orderIndex: idx + 1,
    visible: "true",
    type: "string",
    title: col.cfdName,
  }));
  return {
    filename: "CampaignDetails",
    columns: [{
      field: "crId",
      orderIndex: 0,
      visible: "true",
      type: "string",
      title: "ID",
    }, ...campDetailsExportColumns],
    title: "Campaign Details",
  };
};

export const utGetCampDetailsEmailAttachment = async (
  trx: Transaction, campSupplierId: string, senderEntityType: EntityTypes,
): Promise<string | Record<string, string> | Buffer> => {
  const campDetails = await SrCampaign.getCampaignDetails(trx, campSupplierId, {
    skip: 0,
    take: 1000,
    sort: [],
  });
  const exportableColumns = [COL_TRANS_ROW_CAMPAIGN_ID];
  const campDetailsExports = await utGetCampFieldsColumns(trx);
  const updatedExports = utGetColumnsForExport(campDetailsExports, exportableColumns);
  const fieldKeysRows = updatedExports?.columns.reduce((accum, col) => ({ ...accum, [col.field]: [col.field] }), {});
  const colsToExport = utGetExportableColumns(updatedExports);
  const excelDocFieldConfigs = senderEntityType === "group" ? utGetCampDetailsExcelFieldsConfigsForSupplier(
    updatedExports, campDetails,
  ) : utGetCampDetailsExcelFieldsConfigs(updatedExports, campDetails);
  const bufferData = await SrGenerateDocument.generateDocumentByType(
    [fieldKeysRows, ...campDetails.list], "xls", colsToExport, {
      heading: "Campaign Details", dateDisplayFormat: "", excelDocFieldConfigs,
    },
  );
  return bufferData;
};

export const utCampStatusEmailTemplate = (
  campaignStatus: tpCampaignStatuses, name: string, campaignInfo: MdCampaign, lang: string,
): string => {
  const emailHeader = utGetEmailHeaderContentFromStatus(campaignStatus);
  const emailContent = utGetEmailBodyContentFromStatus(campaignStatus);
  return `<html><head>
    <meta name="generator" content="">
    <style type="text/css">
    .tableClass { border-collapse: collapse; border: 1px solid; border-color: #AAAAAA;
       font-family: Arial, Helvetica, sans-serif; }  
    .tdHeaderClass { padding: 5px; background-color: #CCCCCC; font-size: 17px;  }
    .tdClass { padding: 5px; font-size: 15px;  }  
    .tdFooterClass { padding: 5px; background-color: #EEEEEE; font-size: 13px;  }.im { color: #222; }
    </style>
    <title></title>
  </head>
  <body>
    <table class="tableClass">
      <tr><td class="tdHeaderClass">${utI18nInternalEmails(emailHeader, lang)}</td></tr>
      <tr>
        <td class="tdClass">${utI18nInternalEmails(EMAIL_CAMPAIGN_SALUTATION, lang)} ${name ?? "User"},<br>
        ${utI18nInternalEmails(emailContent, lang)}<br><br>
        <table width="100%" cellpadding="0" cellspacing="0" style="min-width:100%;">
    <thead><tr>
        <th scope="col" style="padding:5px">${utI18nInternalEmails(CAMPAIGN_SLUG, lang)}</th>
        <th scope="col" style="padding:5px">${utI18nInternalEmails(CAMPAIGN_START_DATE, lang)}</th>
        <th scope="col" style="padding:5px">${utI18nInternalEmails(CAMPAIGN_STATUS, lang)}</th></tr></thead>
    <tbody><tr><td valign="top" style="padding:5px">${campaignInfo.cDescription}</td>
        <td valign="top" style="padding:5px">${campaignInfo.cCreatedAt}</td>
        <td valign="top" style="padding:5px">${campaignStatus}</td></tr>
    </tbody>
    </table><br>${utI18nInternalEmails(VSRM_CAMPAIGN_EMAIL_INFO_MESSAGE, lang)}
    <a href="http://www.vitg.com/Login.aspx" style="text-decoration:underline" target="_blank">
      vSRM Supplier Relationship Management<br>
      </td></tr>
      <tr><td class="tdFooterClass">${utI18nInternalEmails(VSRM_CAMPAIGN_EMAIL_FOOTER_CONTENT, lang)}</td></tr>
    </table>
  </body>
</html>
`;
};

export const utIsEmailServiceReady = (): boolean => {
  if (AppEnv.emailService.mailGunConfig().client.key !== "") return true;
  return false;
};
