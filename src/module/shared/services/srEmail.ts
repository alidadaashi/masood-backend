import formData from "form-data";
import Mailgun from "mailgun.js";
import { AppEnv } from "../../../base/loaders/cfgBaseLoader";
import { stdLog } from "../utils/utLog";
import { Options, tpMailgunMessageData } from "../types/tpEmail";

class SrEmail {
  static getMailGunClient(): Options {
    return AppEnv.emailService.mailGunConfig().client;
  }

  static getMailGunDomain(): string {
    return AppEnv.emailService.mailGunDomain();
  }

  static async SendEmail(emailParams: tpMailgunMessageData): Promise<number | void> {
    const clientOptions = SrEmail.getMailGunClient();
    const domain = SrEmail.getMailGunDomain();
    const mg = new Mailgun(formData);
    const mailGunEmailParams = AppEnv.emailService.mailGunConfig().emailParams;
    const respStatus = mg.client(clientOptions).messages.create(domain,
      { ...mailGunEmailParams, ...emailParams }).then((resp) => {
      if (resp.status !== 200) {
        stdLog(`Mailgun Error -------${resp.details}`);
      }
      return resp.status;
    }).catch((err) => stdLog(err));
    return respStatus;
  }
}

export default SrEmail;
