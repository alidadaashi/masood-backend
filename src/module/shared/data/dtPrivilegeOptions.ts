import MdPrivilegeOption from "../../privilege/permission/privilegeOption/mdPrivilegeOption";
import DummyPrivData, { DummyPrivOptionData } from "../constants/dtPrivilegeIdsConstants";
import {
  P_OPTION_ALL_IN_DOMAIN, P_OPTION_ALL_IN_GROUP, P_OPTION_ALL_IN_SYSTEM, P_OPTION_NONE, P_OPTION_OWN_IN_DOMAIN,
  P_OPTION_OWN_IN_GROUP,
  P_OPTION_OWN_IN_SYSTEM, P_OPTION_YES,
} from "../constants/dtPermissionConstants";

const {
  DOMAIN_ID, DOMAIN_USER_ID, GROUP_ID, GROUP_USER_ID, CAMPAIGN_ID, CMP_API_ID,
} = DummyPrivData;
const {
  D_VIEW_NONE_ID, D_CREATE_NONE_ID, DU_VIEW_NONE_ID, D_DELETE_NONE_ID, DU_CREATE_NONE_ID, DU_DELETE_NONE_ID,
  D_DELETE_ALL_ID, D_DELETE_YES_ID, DU_DELETE_ALL_ID, DU_DELETE_YES_ID, D_DELETE_OWN_ID, D_EDIT_ALL_ID, D_EDIT_NONE_ID,
  DU_EDIT_NONE_ID, D_EDIT_OWN_ID, DU_EDIT_OWN_ID, D_EDIT_YES_ID, G_EDIT_YES_ID, DU_EDIT_YES_ID, D_VIEW_ALL_ID, G_VIEW_OWN_ID,
  DU_VIEW_ALL_ID, D_VIEW_YES_ID, DU_VIEW_YES_ID, G_VIEW_ALL_ID, D_VIEW_OWN_ID, DU_VIEW_OWN_ID, DU_CREATE_ALL_ID,
  G_CREATE_ALL_ID, G_CREATE_NONE_ID, GU_CREATE_NONE_ID, GU_CREATE_ALL_ID, D_CREATE_ALL_ID, DU_DELETE_OWN_ID, G_DELETE_OWN_ID,
  G_DELETE_NONE_ID, G_DELETE_YES_ID, GU_DELETE_NONE_ID, GU_DELETE_OWN_ID, G_DELETE_ALL_ID, G_EDIT_ALL_ID, GU_EDIT_YES_ID,
  G_EDIT_NONE_ID, GU_EDIT_ALL_ID, GU_EDIT_NONE_ID, G_EDIT_OWN_ID, GU_EDIT_OWN_ID, DU_EDIT_ALL_ID, G_VIEW_YES_ID,
  GU_VIEW_YES_ID, GU_VIEW_ALL_ID, GU_VIEW_NONE_ID, G_VIEW_NONE_ID, GU_DELETE_ALL_ID, GU_DELETE_YES_ID, GU_VIEW_OWN_ID,
  CMP_VIEW_ALL_ID, CMP_VIEW_NONE_ID, CMP_VIEW_OWN_ID, CMP_DELETE_ALL_ID,
  CMP_DELETE_NONE_ID, CMP_DELETE_OWN_ID, CMP_EDIT_ALL_ID, CMP_EDIT_NONE_ID, CMP_EDIT_OWN_ID,
  CMP_HIT_API_ALL_ID, CMP_HIT_API_NONE_ID,
} = DummyPrivOptionData;

const domainViewOptions: MdPrivilegeOption[] = [
  {
    poId: D_VIEW_NONE_ID, poPrivilegeId: DOMAIN_ID, poOption: P_OPTION_NONE, poOptionType: "v",
  },
  {
    poId: D_VIEW_ALL_ID, poPrivilegeId: DOMAIN_ID, poOption: P_OPTION_ALL_IN_SYSTEM, poOptionType: "v",
  },
  {
    poId: D_VIEW_OWN_ID, poPrivilegeId: DOMAIN_ID, poOption: P_OPTION_OWN_IN_SYSTEM, poOptionType: "v",
  },
  {
    poId: D_VIEW_YES_ID, poPrivilegeId: DOMAIN_ID, poOption: P_OPTION_YES, poOptionType: "v",
  },
];
const domainEditOptions: MdPrivilegeOption[] = [
  {
    poId: D_EDIT_NONE_ID, poPrivilegeId: DOMAIN_ID, poOption: P_OPTION_NONE, poOptionType: "e",
  },
  {
    poId: D_EDIT_ALL_ID, poPrivilegeId: DOMAIN_ID, poOption: P_OPTION_ALL_IN_SYSTEM, poOptionType: "e",
  },
  {
    poId: D_EDIT_OWN_ID, poPrivilegeId: DOMAIN_ID, poOption: P_OPTION_OWN_IN_SYSTEM, poOptionType: "e",
  },
  {
    poId: D_EDIT_YES_ID, poPrivilegeId: DOMAIN_ID, poOption: P_OPTION_YES, poOptionType: "e",
  },
];
const domainDeleteOptions: MdPrivilegeOption[] = [
  {
    poId: D_DELETE_NONE_ID, poPrivilegeId: DOMAIN_ID, poOption: P_OPTION_NONE, poOptionType: "d",
  },
  {
    poId: D_DELETE_ALL_ID, poPrivilegeId: DOMAIN_ID, poOption: P_OPTION_ALL_IN_SYSTEM, poOptionType: "d",
  },
  {
    poId: D_DELETE_OWN_ID, poPrivilegeId: DOMAIN_ID, poOption: P_OPTION_OWN_IN_SYSTEM, poOptionType: "d",
  },
  {
    poId: D_DELETE_YES_ID, poPrivilegeId: DOMAIN_ID, poOption: P_OPTION_YES, poOptionType: "d",
  },
];
const domainCreateOptions: MdPrivilegeOption[] = [
  {
    poId: D_CREATE_NONE_ID, poPrivilegeId: DOMAIN_ID, poOption: P_OPTION_NONE, poOptionType: "c",
  },
  {
    poId: D_CREATE_ALL_ID, poPrivilegeId: DOMAIN_ID, poOption: P_OPTION_ALL_IN_SYSTEM, poOptionType: "c",
  },
];
const groupViewOptions: MdPrivilegeOption[] = [
  {
    poId: G_VIEW_NONE_ID, poPrivilegeId: GROUP_ID, poOption: P_OPTION_NONE, poOptionType: "v",
  },
  {
    poId: G_VIEW_ALL_ID, poPrivilegeId: GROUP_ID, poOption: P_OPTION_ALL_IN_DOMAIN, poOptionType: "v",
  },
  {
    poId: G_VIEW_OWN_ID, poPrivilegeId: GROUP_ID, poOption: P_OPTION_OWN_IN_DOMAIN, poOptionType: "v",
  },
  {
    poId: G_VIEW_YES_ID, poPrivilegeId: GROUP_ID, poOption: P_OPTION_YES, poOptionType: "v",
  },
];
const groupEditOptions: MdPrivilegeOption[] = [
  {
    poId: G_EDIT_NONE_ID, poPrivilegeId: GROUP_ID, poOption: P_OPTION_NONE, poOptionType: "e",
  },
  {
    poId: G_EDIT_ALL_ID, poPrivilegeId: GROUP_ID, poOption: P_OPTION_ALL_IN_DOMAIN, poOptionType: "e",
  },
  {
    poId: G_EDIT_OWN_ID, poPrivilegeId: GROUP_ID, poOption: P_OPTION_OWN_IN_DOMAIN, poOptionType: "e",
  },
  {
    poId: G_EDIT_YES_ID, poPrivilegeId: GROUP_ID, poOption: P_OPTION_YES, poOptionType: "e",
  },
];
const groupDeleteOptions: MdPrivilegeOption[] = [
  {
    poId: G_DELETE_NONE_ID, poPrivilegeId: GROUP_ID, poOption: P_OPTION_NONE, poOptionType: "d",
  },
  {
    poId: G_DELETE_ALL_ID, poPrivilegeId: GROUP_ID, poOption: P_OPTION_ALL_IN_DOMAIN, poOptionType: "d",
  },
  {
    poId: G_DELETE_OWN_ID, poPrivilegeId: GROUP_ID, poOption: P_OPTION_OWN_IN_DOMAIN, poOptionType: "d",
  },
  {
    poId: G_DELETE_YES_ID, poPrivilegeId: GROUP_ID, poOption: P_OPTION_YES, poOptionType: "d",
  },
];
const groupCreateOptions: MdPrivilegeOption[] = [
  {
    poId: G_CREATE_NONE_ID, poPrivilegeId: GROUP_ID, poOption: P_OPTION_NONE, poOptionType: "c",
  },
  {
    poId: G_CREATE_ALL_ID, poPrivilegeId: GROUP_ID, poOption: P_OPTION_ALL_IN_DOMAIN, poOptionType: "c",
  },
];
const domainUserViewOptions: MdPrivilegeOption[] = [
  {
    poId: DU_VIEW_NONE_ID, poPrivilegeId: DOMAIN_USER_ID, poOption: P_OPTION_NONE, poOptionType: "v",
  },
  {
    poId: DU_VIEW_ALL_ID, poPrivilegeId: DOMAIN_USER_ID, poOption: P_OPTION_ALL_IN_SYSTEM, poOptionType: "v",
  },
  {
    poId: DU_VIEW_OWN_ID, poPrivilegeId: DOMAIN_USER_ID, poOption: P_OPTION_OWN_IN_SYSTEM, poOptionType: "v",
  },
  {
    poId: DU_VIEW_YES_ID, poPrivilegeId: DOMAIN_USER_ID, poOption: P_OPTION_YES, poOptionType: "v",
  },
];
const domainUserEditOptions: MdPrivilegeOption[] = [
  {
    poId: DU_EDIT_NONE_ID, poPrivilegeId: DOMAIN_USER_ID, poOption: P_OPTION_NONE, poOptionType: "e",
  },
  {
    poId: DU_EDIT_ALL_ID, poPrivilegeId: DOMAIN_USER_ID, poOption: P_OPTION_ALL_IN_SYSTEM, poOptionType: "e",
  },
  {
    poId: DU_EDIT_OWN_ID, poPrivilegeId: DOMAIN_USER_ID, poOption: P_OPTION_OWN_IN_SYSTEM, poOptionType: "e",
  },
  {
    poId: DU_EDIT_YES_ID, poPrivilegeId: DOMAIN_USER_ID, poOption: P_OPTION_YES, poOptionType: "e",
  },
];
const domainUserDeleteOptions: MdPrivilegeOption[] = [
  {
    poId: DU_DELETE_NONE_ID, poPrivilegeId: DOMAIN_USER_ID, poOption: P_OPTION_NONE, poOptionType: "d",
  },
  {
    poId: DU_DELETE_ALL_ID, poPrivilegeId: DOMAIN_USER_ID, poOption: P_OPTION_ALL_IN_SYSTEM, poOptionType: "d",
  },
  {
    poId: DU_DELETE_OWN_ID, poPrivilegeId: DOMAIN_USER_ID, poOption: P_OPTION_OWN_IN_SYSTEM, poOptionType: "d",
  },
  {
    poId: DU_DELETE_YES_ID, poPrivilegeId: DOMAIN_USER_ID, poOption: P_OPTION_YES, poOptionType: "d",
  },
];
const domainUserCreateOptions: MdPrivilegeOption[] = [
  {
    poId: DU_CREATE_NONE_ID, poPrivilegeId: DOMAIN_USER_ID, poOption: P_OPTION_NONE, poOptionType: "c",
  },
  {
    poId: DU_CREATE_ALL_ID, poPrivilegeId: DOMAIN_USER_ID, poOption: P_OPTION_ALL_IN_SYSTEM, poOptionType: "c",
  },
];
const groupUserViewOptions: MdPrivilegeOption[] = [
  {
    poId: GU_VIEW_NONE_ID, poPrivilegeId: GROUP_USER_ID, poOption: P_OPTION_NONE, poOptionType: "v",
  },
  {
    poId: GU_VIEW_ALL_ID, poPrivilegeId: GROUP_USER_ID, poOption: P_OPTION_ALL_IN_DOMAIN, poOptionType: "v",
  },
  {
    poId: GU_VIEW_OWN_ID, poPrivilegeId: GROUP_USER_ID, poOption: P_OPTION_OWN_IN_DOMAIN, poOptionType: "v",
  },
  {
    poId: GU_VIEW_YES_ID, poPrivilegeId: GROUP_USER_ID, poOption: P_OPTION_YES, poOptionType: "v",
  },
];
const groupUserEditOptions: MdPrivilegeOption[] = [
  {
    poId: GU_EDIT_NONE_ID, poPrivilegeId: GROUP_USER_ID, poOption: P_OPTION_NONE, poOptionType: "e",
  },
  {
    poId: GU_EDIT_ALL_ID, poPrivilegeId: GROUP_USER_ID, poOption: P_OPTION_ALL_IN_DOMAIN, poOptionType: "e",
  },
  {
    poId: GU_EDIT_OWN_ID, poPrivilegeId: GROUP_USER_ID, poOption: P_OPTION_OWN_IN_DOMAIN, poOptionType: "e",
  },
  {
    poId: GU_EDIT_YES_ID, poPrivilegeId: GROUP_USER_ID, poOption: P_OPTION_YES, poOptionType: "e",
  },
];
const groupUserDeleteOptions: MdPrivilegeOption[] = [
  {
    poId: GU_DELETE_NONE_ID, poPrivilegeId: GROUP_USER_ID, poOption: P_OPTION_NONE, poOptionType: "d",
  },
  {
    poId: GU_DELETE_ALL_ID, poPrivilegeId: GROUP_USER_ID, poOption: P_OPTION_ALL_IN_DOMAIN, poOptionType: "d",
  },
  {
    poId: GU_DELETE_OWN_ID, poPrivilegeId: GROUP_USER_ID, poOption: P_OPTION_OWN_IN_DOMAIN, poOptionType: "d",
  },
  {
    poId: GU_DELETE_YES_ID, poPrivilegeId: GROUP_USER_ID, poOption: P_OPTION_YES, poOptionType: "d",
  },
];
const groupUserCreateOptions: MdPrivilegeOption[] = [
  {
    poId: GU_CREATE_NONE_ID, poPrivilegeId: GROUP_USER_ID, poOption: P_OPTION_NONE, poOptionType: "c",
  },
  {
    poId: GU_CREATE_ALL_ID, poPrivilegeId: GROUP_USER_ID, poOption: P_OPTION_ALL_IN_DOMAIN, poOptionType: "c",
  },
];

const campaignViewOptions: MdPrivilegeOption[] = [
  {
    poId: CMP_VIEW_NONE_ID, poPrivilegeId: CAMPAIGN_ID, poOption: P_OPTION_NONE, poOptionType: "v",
  },
  {
    poId: CMP_VIEW_ALL_ID, poPrivilegeId: CAMPAIGN_ID, poOption: P_OPTION_ALL_IN_GROUP, poOptionType: "v",
  },
  {
    poId: CMP_VIEW_OWN_ID, poPrivilegeId: CAMPAIGN_ID, poOption: P_OPTION_OWN_IN_GROUP, poOptionType: "v",
  },
];
const campaignEditOptions: MdPrivilegeOption[] = [
  {
    poId: CMP_EDIT_NONE_ID, poPrivilegeId: CAMPAIGN_ID, poOption: P_OPTION_NONE, poOptionType: "e",
  },
  {
    poId: CMP_EDIT_ALL_ID, poPrivilegeId: CAMPAIGN_ID, poOption: P_OPTION_ALL_IN_GROUP, poOptionType: "e",
  },
  {
    poId: CMP_EDIT_OWN_ID, poPrivilegeId: CAMPAIGN_ID, poOption: P_OPTION_OWN_IN_GROUP, poOptionType: "e",
  },
];
const campaignDeleteOptions: MdPrivilegeOption[] = [
  {
    poId: CMP_DELETE_NONE_ID, poPrivilegeId: CAMPAIGN_ID, poOption: P_OPTION_NONE, poOptionType: "d",
  },
  {
    poId: CMP_DELETE_ALL_ID, poPrivilegeId: CAMPAIGN_ID, poOption: P_OPTION_ALL_IN_GROUP, poOptionType: "d",
  },
  {
    poId: CMP_DELETE_OWN_ID, poPrivilegeId: CAMPAIGN_ID, poOption: P_OPTION_OWN_IN_GROUP, poOptionType: "d",
  },
];
const campaignCanHitApiFunctionOptions: MdPrivilegeOption[] = [
  {
    poId: CMP_HIT_API_NONE_ID, poPrivilegeId: CMP_API_ID, poOption: P_OPTION_NONE, poOptionType: "f",
  },
  {
    poId: CMP_HIT_API_ALL_ID, poPrivilegeId: CMP_API_ID, poOption: P_OPTION_ALL_IN_GROUP, poOptionType: "f",
  },
];

export const dummyOptionsAvailable: MdPrivilegeOption[] = [
  ...domainViewOptions, ...domainEditOptions, ...domainDeleteOptions, ...domainCreateOptions, ...groupViewOptions,
  ...groupEditOptions, ...groupDeleteOptions, ...groupCreateOptions, ...domainUserViewOptions, ...domainUserEditOptions,
  ...domainUserDeleteOptions, ...domainUserCreateOptions, ...groupUserViewOptions, ...groupUserEditOptions,
  ...groupUserDeleteOptions, ...groupUserCreateOptions, ...campaignViewOptions, ...campaignEditOptions,
  ...campaignDeleteOptions, ...campaignCanHitApiFunctionOptions,
];

export const other = "";
