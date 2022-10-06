import MdBase from "../../base/models/mdBase";

class MdLogs extends MdBase {
  static TABLE_NAME = "logs";

  constructor(
    public lId: string,
    public lDoerId: string,
    public lAffecteeId: string,
    public lActivity: string,
    public lEntity: string,
    public lStatus: string,
    public lCreatedAt?: string,
    public lUpdatedAt?: string,
  ) {
    super();
  }

  static col(k: keyof MdLogs, prefix = true): string {
    return prefix ? `${MdLogs.TABLE_NAME}.${k}` : k;
  }
}

export default MdLogs;
