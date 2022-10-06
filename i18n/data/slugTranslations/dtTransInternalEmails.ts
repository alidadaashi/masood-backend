import { dtSlgInternalEmails } from "../slugs/dtSlugInternalEmails";
import { tpTransType } from "../../types/tpI18n";

export const dtTransInternalEmails: tpTransType<typeof dtSlgInternalEmails> = {
  email__subj__vsrm_campaign_approval: { en: "vSRM Approval of Campaigns", tr: "Kampanyaların vSRM Onayı" },
  email__subj__vsrm_campaign_reject: { en: "vSRM Rejection of Campaigns", tr: "vSRM Kampanyalarının Reddi" },
  email__subj__vsrm_campaign_request_revision: { en: "vSRM Revision of Campaigns", tr: "vSRM Kampanyalarının Revizyonu" },
  email__subj__vsrm_campaign_revoke: { en: "vSRM Cancellation of Campaigns", tr: "vSRM Kampanya İptali" },
  email__subj__vsrm_campaign_sent_for_confirmation: { en: "vSRM Submission of Campaigns for Approval", tr: "vSRM Kampanyalarının Onay İçin Gönderilmesi" },
  email__subj__vsrm_campaign_pullback: { en: "vSRM Withdrawal of Campaigns from Approval", tr: "vSRM Kampanyaların Onaydan Geri Çekilmesi" },
  email__content__campaign_approval_info: { en: "Approved campaign information has been sent to you.", tr: "Onaylanmış Kampanya bilgileri size gönderildi." },
  email__content__campaign_request_revision_info: { en: "Campaign revision information has been sent to you.", tr: "Kampanya revizyon bilgileri tarafınıza gönderilmiştir." },
  email__content__campaign_reject_info: { en: "Campaign rejection information has been sent to you.", tr: "Kampanya ret bilgileri tarafınıza iletilmiştir." },
  email__content__campaign_revoke_info: { en: "Campaign cancellation information has been sent to you.", tr: "Kampanya iptal bilgileri tarafınıza iletilmiştir." },
  email__content__campaign_sent_for_approval: { en: "Campaigns have been sent for your approval.", tr: "Kampanyalar onayınız için gönderilmiştir." },
  email__content__campaign_withdrawl: { en: "Campaigns have been withdrawn from your approval.", tr: "Kampanyalar onayınızdan geri çekilmiştir." },
  email__header__campaign_approval: { en: "Campaign Approved", tr: "Kampanya Onaylandı" },
  email__header__campaign_request_revision: { en: "Revision Requested", tr: "Revizyon İstendi" },
  email__header__campaign_reject: { en: "Campaign Rejected", tr: "Kampanya Reddedildi" },
  email__header__campaign_revoke: { en: "Campaign Cancelled", tr: "Kampanya İptal Edildi" },
  email__header__campaign_sent_for_approval: { en: "Submitted for Approval", tr: "Onay için sunuldu" },
  email__header__campaign_withdrawl: { en: "Withdrawn From Approval", tr: "onaydan çekildi" },
  email__footer__vsrm_contact_info: { en: "Copyright &copy;2021 ITG Ltd. All rights reserved. vSRM&reg; is registered trademark of ITG Ltd.", tr: "Telif hakkı &copy;2021 ITG Ltd. Tüm hakları Saklıdır. vSRM&reg; ITG Ltd'nin tescilli ticari markasıdır."},
  email__vsrm__more_info_msg: { en: "For more information and confirmation, please connect to ", tr: "Daha fazla bilgi ve onay için lütfen şu adrese bağlanın "},
  email__lbl__dear: { en: "Dear", tr: "Sayın" },
  email__content__lbl_campaign: { en: "Campaign", tr: "Kampanya"},
  email__content__lbl_campaign_start_date: { en: "Campaign Start Date", tr: "Kampanya Başlangıç ​​Tarihi"},
  email__content__lbl_campaign_status: { en: "Status", tr: "Statü"},
}