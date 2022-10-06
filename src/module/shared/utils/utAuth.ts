import { NextFunction, Request, Response } from "express";
import { UNAUTHORIZED } from "http-status-codes";
import { PermissionOptionTypes, PrivilegeTypeV1 } from "../types/tpShared";
import {
  P_OPTION_ALL_IN_DOMAIN,
  P_OPTION_ALL_IN_SYSTEM,
  P_OPTION_OWN_IN_DOMAIN,
  P_OPTION_OWN_IN_SYSTEM,
  P_OPTION_YES,
  PERMISSIONS,
} from "../constants/dtPermissionConstants";
import { utIsAccessAllowed } from "../../../routes/utAclHelper";
import { ERR_ACCESS_DENIED } from "../constants/dtOtherConstants";

export const utIsAuthMW = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(UNAUTHORIZED)
      .json({ message: "Authentication Denied" });
  }
};

export const utIsItgAdmin = (privs: PrivilegeTypeV1): boolean => privs.privileges.permissions.includes(PERMISSIONS.DO_ALL);

export const utIsDomainAdmin = (permissions: string[]): boolean => permissions.includes(P_OPTION_ALL_IN_SYSTEM);

export const utIsDomainGroupAdmin = (permissions: string[]): boolean => permissions.includes(P_OPTION_ALL_IN_DOMAIN);

export const utCanDeleteOwn = (permissions: string[]): boolean => permissions.includes(P_OPTION_OWN_IN_SYSTEM);
export const utCanDeleteAssigned = (permissions: string[]): boolean => permissions.includes(P_OPTION_YES);
export const utCanUpdateOwn = (permissions: string[]): boolean => permissions.includes(P_OPTION_OWN_IN_SYSTEM);
export const utCanUpdateAssigned = (permissions: string[]): boolean => permissions.includes(P_OPTION_YES);
export const utCanViewOwn = (permissions: string[]): boolean => permissions.includes(P_OPTION_OWN_IN_SYSTEM);
export const utCanViewAssigned = (permissions: string[]): boolean => permissions.includes(P_OPTION_YES);

export const utCanViewOwnInDomain = (permissions: string[]): boolean => permissions.includes(P_OPTION_OWN_IN_DOMAIN);
export const utCanUpdateOwnInDomain = (permissions: string[]): boolean => permissions.includes(P_OPTION_OWN_IN_DOMAIN);
export const utCanDeleteOwnInDomain = (permissions: string[]): boolean => permissions.includes(P_OPTION_OWN_IN_DOMAIN);

export const utGetPermissionsFor = (
  privilegeSection: "domain" | "group" | "groupUser",
  privileges: PrivilegeTypeV1["privileges"],
  permissionOptions: PermissionOptionTypes[],
): string[] => {
  const mutatedPermissions: Record<PermissionOptionTypes, string> = permissionOptions
    .reduce((accum, po) => ({
      ...accum,
      [po]: privileges[privilegeSection].permissions[po],
    }), {} as Record<PermissionOptionTypes, string>);
  return Object.values(mutatedPermissions);
};

export const utIsGroupAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
):void => {
  const { user } = req.session;
  if (user && utIsAccessAllowed(user, "any", "group")) {
    next();
  } else {
    res.status(UNAUTHORIZED).json({ message: ERR_ACCESS_DENIED });
  }
};

export const utHasCampaignPriv = (permissions: string[]): boolean => permissions.includes(PERMISSIONS.CAMPAIGN);
