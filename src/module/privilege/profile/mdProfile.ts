import MdBase from "../../../base/models/mdBase";
import { EntityStatusTypesType } from "../../shared/types/tpShared";

class MdProfile extends MdBase {
  static TABLE_NAME = "profile";

  constructor(
    public pProfileName: string,
    public pProfileStatus?: EntityStatusTypesType,
    public pProfileCreatedAt?: string,
    public pProfileId?: string,
  ) {
    super();
  }

  static col(k: keyof MdProfile, prefix = true): string {
    return prefix ? `${MdProfile.TABLE_NAME}.${k}` : k;
  }
}

export default MdProfile;
