import MdBase from "../../../base/models/mdBase";
import {
  tpDocumentOrigin, tpDocumentHierarchyTypes, tpDocAndNoteTypes,
} from "../../shared/types/tpShared";

class MdDocAndNoteType extends MdBase {
  static TABLE_NAME = "docAndNoteTypes";

  constructor(
    public dntName: string,
    public dntType: tpDocAndNoteTypes,
    public dntDefinedType: tpDocumentOrigin,
    public dntHierarchyType: tpDocumentHierarchyTypes,
    public dntIsActive: boolean,
    public dntIsValidityRequired?: boolean,
    public dntIsPrivNeeded?: boolean,
    public dntParentTypeId?: string,
    public dntId?: string,
    public dntCreatedAt?: string,
    public dntUpdatedAt?: string,
  ) {
    super();
  }

  static col(k: keyof MdDocAndNoteType, prefix = true): string {
    return prefix ? `${MdDocAndNoteType.TABLE_NAME}.${k}` : k;
  }
}

export default MdDocAndNoteType;
