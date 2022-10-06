import express from "express";
import CtProfile from "./profile/ctProfile";
import CtRole from "./role/ctRole";
import CtPrivilege from "./permission/ctPrivilege";
import CtProfileRole from "./profile/profileRole/ctProfileRole";
import CtPrivileges from "./ctPrivileges";
import CtRolePrivilege from "./role/rolePrivilege/ctRolePrivilege";
import CtPrivilegeDisplayUserRoleOrProfile from "./privilegeDisplayUserRoleOrProfile/ctPrivilegeDisplayUserRoleOrProfile";
import { utIsAuthMW } from "../shared/utils/utAuth";
import CtModule from "./module/ctModule";

const privilegesRouter = express.Router();

privilegesRouter.get("/profiles", utIsAuthMW, CtProfile.getAllProfiles);
privilegesRouter.get("/profiles/document/:documentType", CtProfile.generateDocument);

privilegesRouter.get("/profile-roles/:pId", CtProfileRole.getProfileRoles);
privilegesRouter.post("/profile-roles", utIsAuthMW, CtProfileRole.saveProfileRoles);
privilegesRouter.put("/profile-roles/:pId", CtProfileRole.updateProfileRoles);
privilegesRouter.delete("/profile-roles/:pId", CtProfileRole.deleteProfileRoles);
privilegesRouter.delete("/profile-roles", CtProfileRole.deleteMultipleProfileRoles);

privilegesRouter.get("/roles", utIsAuthMW, CtRole.getAllRoles);
privilegesRouter.delete("/roles/:rId", CtRole.deleteRole);
privilegesRouter.delete("/roles", CtRole.deleteRoles);
privilegesRouter.get("/roles/document/:documentType", CtRole.generateDocument);

privilegesRouter.post("/role-permissions", CtRolePrivilege.addRolePermissions);
privilegesRouter.put("/role-permissions/:rId", CtRolePrivilege.updateRolePermissions);
privilegesRouter.get("/role-permissions/:rId", CtRolePrivilege.getRolePermissions);

privilegesRouter.get("/permissions", CtPrivilege.getAllPermissions);
privilegesRouter.get("/permissions/:moduleId", CtPrivilege.getAllPermissionsByModule);

privilegesRouter.get("/user-privileges/:userEntityId", CtPrivilegeDisplayUserRoleOrProfile.getUserAllPrivilegesProfiles);

privilegesRouter.post("/user-privileges", CtPrivileges.assignProfileAndRoles);

privilegesRouter.get("/modules", CtModule.getAllModules);
privilegesRouter.get("/modules-hierarchy", CtModule.getAllModulesHierarchy);

privilegesRouter.get("/user-all-privileges", utIsAuthMW, CtPrivileges.getAllUsersAllPrivileges);

privilegesRouter.get("/user-all-privileges/document/:documentType", CtPrivileges.generateDocument);

export default privilegesRouter;
