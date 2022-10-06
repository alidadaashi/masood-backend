import MdPrivilegeOption from "../../privilege/permission/privilegeOption/mdPrivilegeOption";
import MdRole from "../../privilege/role/mdRole";
import MdUser from "../../user/mdUser";
import MdProfile from "../../privilege/profile/mdProfile";
import MdDomainDetails from "../../entities/domain/mdDomainDetails";
import MdGroupDetails from "../../entities/group/mdGroupDetails";
import MdCredential from "../../user/credentials/mdCredential";
import MdEntityUser from "../../entity/entityUser/mdEntityUser";
import MdRolePrivilege from "../../privilege/role/rolePrivilege/mdRolePrivilege";
import MdPrivilege from "../../privilege/permission/mdPrivilege";
import MdCompanyDetails from "../../entities/company/mdCompanyDetails";
import MdStickyNotes from "../../stickyNotes/mdStickyNotes";

export const EntityStatusTypesList = ["active", "disabled", "inactive", "blocked", "deleted"] as const;
export type EntityStatusTypesType = typeof EntityStatusTypesList[number];

export const StickyNotesCategoryList = ["general", "withReference"] as const;
export type tpStickyNotesCategory = typeof StickyNotesCategoryList[number];

export const StickyNotesStatusList = ["archived", "new", "read", "unread"] as const;
export type tpStickyNotesStatus = typeof StickyNotesStatusList[number];

export type EntityTypes = "domain" | "group" | "company" | "user" | "business-partner" | "campaign";
export type PermissionOptionTypes = "v" | "e" | "d" | "c" | "f";
export type ReqBodyRolePermissionsType = {
  rId?: string,
  rRoleName: string,
  permissions: {
    pId: string,
    pPrivilege: string,
    itemSelected: boolean,
    create?: MdPrivilegeOption | null,
    edit?: MdPrivilegeOption,
    view?: MdPrivilegeOption,
    delete?: MdPrivilegeOption,
    function?: MdPrivilegeOption,
  }[]
}
export type ReqBodyProfileRoleType = { pProfileName: string, roles: MdRole[], inEdit?: boolean };

export type ReqBodyUserPrivilegesType = {
  user: MdUser,
  profiles: MdProfile[],
  roles: MdRole[],
  domains: MdDomainDetails[],
  groups: MdGroupDetails[],
};

export type AllUsersAllPrivilegesType = {
  uId: string,
  userName: string,
  roles: string[],
  domains: string[],
  groups: string[],
}
export const TypeList = [
  "doc",
  "image",
  "loginBackgroundImage",
  "footerLogoImage",
  "instanceLogoImage",
] as const;
export type TypeType = typeof TypeList[number];

export const ExtensionTypeList = [
  ".jpg",
  ".jpeg",
  ".png",
  ".JPG",
  ".JPEG",
  ".PNG",
] as const;
export type ExtensionType = typeof ExtensionTypeList[number];

export type GroupRequestBodyType = MdGroupDetails & MdUser & MdCredential
  & { domain: MdDomainDetails, inEdit?: boolean };

export type DocumentTypeType = "pdf" | "xls" | "csv";

export type UserReqType = Pick<(
  MdUser & MdCredential & Partial<MdEntityUser>
), "cEmail" | "uFirstName" | "uLastName" | "cPassword" | "euEntityId" | "uId">;

export type GenerateDocumentPrintColsDetailType = {
  visible: boolean | string,
  orderIndex: number,
  type: string,
  field: string,
  title: "data" | string
}
export type GenerateDocumentPrintColsType = Record<string, GenerateDocumentPrintColsDetailType>;

export type PrivilegesSetsType = "profile" | "role";

export type FileRequestType = {
  id: string,
  picture: string,
  path: string,
  name: string,
  entityId: string,
  extension: string,
  type: string,
}

export type PrivilegeTypeOptions = {
  [k in PermissionOptionTypes]: {
    [k: string]: {
      option: string
    }
  };
} & { permissions: Record<PermissionOptionTypes, string> & { [key: string]: string } };

export type PrivilegeTypeV1 = {
  privileges: {
    permissions: string[],
    domain: PrivilegeTypeOptions,
    group: PrivilegeTypeOptions,
    domainUser: PrivilegeTypeOptions,
    groupUser: PrivilegeTypeOptions,
    campaign: PrivilegeTypeOptions,
    hitAllApi: PrivilegeTypeOptions,
    [key: string]: PrivilegeTypeOptions | string[],
  }
}

export function tpGetType<T>(type: T): T {
  return type as T;
}

export type tpUserInstances = {
  gEntityId: string,
  entityType: EntityTypes,
  gName: string
}
export interface UserSessionType extends PrivilegeTypeV1 {
  entityId: string;
  uId: string;
  uEntityId: string;
  uFirstName: string;
  uLastName: string;
  uTitle: string;
  uCreatedAt: string;
  sid: string;
  userType?: "vendor" | "supplier",
  userInstances: tpUserInstances[]
}

export type GetAllRolePermissionsType = (MdRolePrivilege & MdPrivilege &
{ permissionOptions: MdPrivilegeOption[] });

export type UxPreferencesKeyType = "tabs" | "theme" | "favorites"

export type UserUxPreferenecesType = {
  tabs?: DrawerItemType,
  theme?: string,
  favorites?: DrawerItemType,
}

export type UserUxPreferenecesPayload = {
  payload?: {
    [key: string]: string | boolean | undefined
  }
}

export type DrawerItemType = {
  icon: string;
  title: string;
  indent: number;
  hidden?: boolean;
  items?: DrawerItemType;
  slug?: string;
  to?: string;
  idx?: number;
  badge?: string;
}[];

export type UserPreferencesKeyType = string

export type UserPreferencesType = {
  numFmt?: ",sep.decimal" | ".sep,decimal",
  decRng?: number,
  qtyDecRng?: number,
  amtDecRng?: number,
  uPrcDecRng?: number,
  exRateDecRng?: number,
  pctDecRng?: number,
  amtCurrencySmbl?: string,
  amtCurrencyCode?: string,
  amtCurrencyName?: string,
  currencySmblPlacement?: "left" | "right",
  pctSmblPlacement?: string,
  weekNumberDisplay?: string | boolean,
  weekStartDay?: "Mon" | "Sun",
  dateInputFormat?: string,
  dateDisplayFormat?: string,
  defaultDtPageSize?: number,
  timeZoneValue?: string,
  timeZoneName?: string,
  timeFormat?: "h11" | "h12" | "h23" | "h24",
  language?: "En" | "Tr"
}

export type UserPreferencesPayload = {
  payload: {
    [key: string]: string | boolean | number | undefined
  },
}

export type MiscellaneousSettingsKeyType = "version"

export type MiscellaneousSettingsPayload = {
  payload: Record<string, unknown>
}

export type MiscellaneousSettingsType = {
  version?: string,
  contact?: string,
  email?: string,
}

export type tpInstanceDisableDate = {
  effective: boolean,
  startDate: Date,
  endDate: Date,
  description: string,
  rowId?: string,
  gName?: string
}

export type tpDocumentOrigin = "system-defined" | "user-defined";
export type tpDocumentHierarchyTypes = "main" | "sub-type";
export type tpDocAndNoteTypes = "note" | "document";
export type tpRecordsScope = "internal" | "external";
export type tpDocumentTypeParams = "system-defined" | "user-defined"

export type tpAddDocumentType = {
  dntName: string,
  dntHierarchyType: tpDocumentHierarchyTypes,
  dntType: tpDocAndNoteTypes,
  dntInstance?: string[],
  dntCompany?: string[],
  dntIsPrivNeeded: boolean,
  dntIsValidityRequired?: boolean,
  dntIsForAllCompanies?: boolean,
  dntIsActive: boolean,
  dntParentTypeId?: string,
  dntDefinedType: tpDocumentOrigin,
}
export type tpUpdateDocumentType = Partial<tpAddDocumentType> & {
  dntId: string,
};

export type tpDocumentTypeData = {
  dntName: string,
  dntParentTypeId: string;
  dntHierarchyType: tpDocumentHierarchyTypes;
  dntId: string,
  dntMainType: string,
  dntType: tpDocAndNoteTypes,
  dntSubType: string,
  dntInstance?: string[],
  dntCompany?: string[],
  dntIsPrivNeeded: boolean,
  dntIsValidityRequired?: boolean,
  dntIsActive: boolean,
  dntDefinedType: tpDocumentOrigin
}

export const entityTypeNamesList = ["docAttach", "stickyNote", "note"] as const;
export type tpEntityTypeNamesList = typeof entityTypeNamesList[number];

export const notesStatusList = ["New", "Modified", "Deleted"] as const;
export type tpNotesStatus = typeof notesStatusList[number];

export type tpNoteOrigin = "system-defined" | "user-defined";
export type tpNoteTypes = "main" | "sub-type";

export type tpNote = {
  nId: string,
  nNoteTypeId: string,
  nBody: string,
  nStatus: tpNotesStatus,
  nSubType: string,
  nCreatedByUserId: string,
  nRecordTypeEntityTypeId: string,
  nScope?: tpRecordsScope,
  nCreatedAt?: string,
  nUpdatedAt?: string,
}

export type tpCompanies = MdCompanyDetails & {
  gName: string
}[]

export type tpStickyNotesData = MdStickyNotes&{
  snFromUserName?: string,
  snInoutBound?: string,
};

export type tpSnSlectQueryOptions = {
  userId?: string,
  filterMethod?: tpStickyNotesStatus,
};

export type tpDocumentAttachmentData = {
  aId?: string,
  aDocTypeId: string,
  recordId: string,
  afFileId: string[],
  aCreatedByUserId: string,
  aScope?: tpRecordsScope,
  adDescription: string,
  avValidityStartDate?: string,
  avValidityEndDate?: string,
}

export type tpStickyNoteReciverData = {
  sntueToUserId: string,
  sntueInstanceId: string,
  sntueCompanyId: string,
};

export type tpStickyNoteBody = {
  snSubject: string,
  snBody: string,
  snrRecordTypeEntityTypeId: string,
  snToMySelf: boolean,
  snSendAsEmail: boolean,
  snToUsers: tpStickyNoteReciverData[],
}
