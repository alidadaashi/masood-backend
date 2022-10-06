import { Transaction } from "knex";
import MdUnprocessableEntityError from "../../../base/errors/mdUnprocessableEntityError";
import MdEntityUser from "../../entity/entityUser/mdEntityUser";
import SrUserPreferences from "../../preferences/userPreference/srUserPreferences";
import { ERR_CAMPAIGN_SENDING_EMAILS } from "../../shared/constants/dtOtherConstants";
import SrEmail from "../../shared/services/srEmail";
import { UserSessionType } from "../../shared/types/tpShared";
import doCredential from "../../user/credentials/doCredential";
import doUser from "../../user/doUser";
import { tpCampaignStatuses } from "../tpCampaign";
import { utI18nInternalEmails } from "../../../../i18n/utils/utI18n";
import { utCampStatusEmailTemplate, utGetEmailSubjectFromStatus } from "./utCampaignEmails";
import MdCampaign from "../mdCampaign";

export const srSendCampaignStatusEmails = async (
  trx: Transaction,
  { sender, receivers }: { sender: UserSessionType, receivers: MdEntityUser[] },
  { campaign, status }: { campaign: MdCampaign, status: tpCampaignStatuses },
  attachmentData: string | Buffer | Record<string, string>,
): Promise<void> => {
  const emailSubject = utGetEmailSubjectFromStatus(status);
  const senderEmail = await doCredential.findOneByCol(trx, "cUserEntityId", sender.uEntityId);
  if (emailSubject) {
    const sendEmailPromises = await Promise.all(receivers.map(async (receiver) => {
      const receiverEmail = await doCredential.findOneByCol(trx, "cUserEntityId", receiver.euUserEntityId);
      const receiverUserInfo = await doUser.findOneByCol(trx, "uEntityId", receiver.euUserEntityId);
      const userLangPreference = await SrUserPreferences.getUserPreferenceByType(trx, receiver.euUserEntityId, "language");
      const emailTemplate = utCampStatusEmailTemplate(
        status, receiverUserInfo.uFirstName, campaign, userLangPreference.upValue as string,
      );
      const emailResp = await SrEmail.SendEmail({
        to: receiverEmail.cEmail,
        "h:Reply-To": senderEmail.cEmail,
        subject: `${utI18nInternalEmails(emailSubject, userLangPreference.upValue as string)}
         / ${sender.userInstances[0].gName} / ${sender.uFirstName}`,
        html: emailTemplate,
        attachment: {
          data: Buffer.from(attachmentData as string, "utf-8"),
          filename: `Campaign${campaign.cErpCode} Details.xlsx`,
        },
        template: "",
      });
      return emailResp;
    }));
    if (sendEmailPromises.some((resp) => resp !== 200)) throw new MdUnprocessableEntityError(ERR_CAMPAIGN_SENDING_EMAILS);
  }
};

export const other = "";
