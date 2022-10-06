import MdBase from "../../../base/models/mdBase";

class MdCredential extends MdBase {
  static TABLE_NAME = "credential";

  constructor(
    public cUserEntityId: string,
    public cEmail: string,
    public cPassword: string,
    public cCreatedAt?: string,
    public cId?: string,
  ) {
    super();
  }

  static col(k: keyof MdCredential, prefix = true): string {
    return prefix ? `${MdCredential.TABLE_NAME}.${k}` : k;
  }
}

export default MdCredential;
