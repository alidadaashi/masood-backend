export type tpMailgunMessageContent = Required<Pick<{
  text?: string | undefined;
  message?: string;
  template?: string | undefined;
}, "template">>

export interface tpMailgunMessageData extends tpMailgunMessageContent {
  from?: string;
  to?: string | string[];
  cc?: string;
  bcc?: string;
  "h:Reply-To"?: string,
  html?: string | undefined;
  subject?: string;
  attachment?: {
    filename?: string,
    data?: string | Buffer
  }
}
export interface Options {
  username: string;
  key: string;
  url?: string;
  timeout?: number;
}
export interface tpMailGunConfigOptions {
  client: Options,
  emailParams: tpMailgunMessageData
}
