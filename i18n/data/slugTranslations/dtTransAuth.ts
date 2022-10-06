import { tpTransType } from "../../types/tpI18n";
import { dtSlgAuth } from "../slugs/dtSlgAuth";

export const dtTransAuth: tpTransType<typeof dtSlgAuth> = {
  frm__lbl__login: { en: "Login", tr: "Giriş" },
  frm__lbl__forgot_password: { en: "Forgot Password", tr: "Şifremi Unuttum" },
  frm__lbl__email: { en: "Email", tr: "E-posta" },
  frm__lbl__password: { en: "Password", tr: "Şifre" },
  btn__lbl__user_agreement: { en: "User Agreement", tr: "Kullanıcı Sözleşmesi" },
  btn__lbl__privacy_policy: { en: "Privacy Policy", tr: "Gizlilik Politikası" },
  btn__lbl__cookie_policy: { en: "Cookie Policy", tr: "Çerez Politikası" },
  btn__lbl__copyright_policy: { en: "Copyright Policy", tr: "Telif Hakkı Politikası" },
  btn__lbl__sign_in: { en: "Sign In", tr: "Giriş" },
};
