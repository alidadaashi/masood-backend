import MdBase from "../../../../base/models/mdBase";
import { ExtensionType, TypeType } from "../../types/tpShared";

class MdFiles extends MdBase {
  static TABLE_NAME = "file";

  constructor(
    public fPath: string,
    public fName: string,
    public fEntityId: string,
    public fExtension: ExtensionType,
    public fType: TypeType,
    public fSizeBytes?: number,
    public fCreatedAt?: string,
    public fId?: string,
  ) {
    super();
  }

  static col(k: keyof MdFiles, prefix = true): string {
    return prefix ? `${MdFiles.TABLE_NAME}.${k}` : k;
  }

  static extension(k: MdFiles["fExtension"]): ExtensionType {
    return k as ExtensionType;
  }

  static type(k: MdFiles["fType"]): ExtensionType {
    return k as ExtensionType;
  }
}

export default MdFiles;
