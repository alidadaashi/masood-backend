import { Transaction } from "knex";
import MdUnprocessableEntityError from "../../../../base/errors/mdUnprocessableEntityError";
import DoProfile from "../doProfile";
import DoProfileRole from "./doProfileRole";
import MdProfileRole from "./mdProfileRole";
import { ReqBodyProfileRoleType } from "../../../shared/types/tpShared";
import { ERR_PROFILE_NOT_EXISTS, MESSAGE_INVALID_DATA } from "../../../shared/constants/dtOtherConstants";
import { utSanitizeText } from "../../../shared/utils/utString";
import DoPrivilegeDisplayUserRoleOrProfile
  from "../../privilegeDisplayUserRoleOrProfile/doPrivilegeDisplayUserRoleOrProfile";
import { utUpdateAllUsersPrivilegesIn } from "../../../shared/utils/utSession";
import MdProfile from "../mdProfile";

const srUpdateUsersPrivilegesThatHasProfileAssigned = async (trx: Transaction, profile: MdProfile) => {
  const profileAttachedUserEntityIds = await DoPrivilegeDisplayUserRoleOrProfile.findAllByPredicatePickField(
    trx, {
      purpProfileOrRoleId: profile.pProfileId as string,
      purpPrivilegeType: "profile",
    }, "purpUserEntityId",
  );
  if (profileAttachedUserEntityIds?.length) {
    await utUpdateAllUsersPrivilegesIn(trx, profileAttachedUserEntityIds);
  }
};

const srDeleteAllOldProfileRolesAndUpdate = async (
  trx: Transaction,
  existingProfile: MdProfile,
  data: ReqBodyProfileRoleType,
) => {
  await DoProfileRole.deleteManyByCol(trx, "prProfileId", existingProfile.pProfileId as string);

  const profileRoles: MdProfileRole[] = data.roles.map((role) => ({
    prProfileId: existingProfile.pProfileId,
    prRoleId: role.rRoleId,
  } as MdProfileRole));

  await DoProfileRole.insertMany(trx, profileRoles);
};

class SrProfileRole {
  static async saveProfileRoles(trx: Transaction, data: ReqBodyProfileRoleType): Promise<void> {
    if (data && utSanitizeText(data.pProfileName) && data.roles.length) {
      const pProfileName = utSanitizeText(data.pProfileName);

      const [profile] = await DoProfile.insertOne(trx, { pProfileName });

      const profileRoles: MdProfileRole[] = data.roles.map((role) => ({
        prProfileId: profile.pProfileId,
        prRoleId: role.rRoleId,
      } as MdProfileRole));

      await DoProfileRole.insertMany(trx, profileRoles);
    } else {
      throw new MdUnprocessableEntityError(MESSAGE_INVALID_DATA);
    }
  }

  static async updateProfileRoles(
    trx: Transaction,
    pId: string,
    data: ReqBodyProfileRoleType,
  ): Promise<void> {
    if (data && utSanitizeText(data.pProfileName)) {
      const pProfileName = utSanitizeText(data.pProfileName);
      const existingProfile = await DoProfile.findOneByCol(trx, "pProfileId", pId);
      if (existingProfile) {
        if (existingProfile.pProfileName !== pProfileName) {
          await DoProfile.updateOneByColName(trx, { pProfileName }, "pProfileId", pId);
        }
      } else {
        throw new MdUnprocessableEntityError(ERR_PROFILE_NOT_EXISTS);
      }

      if (data.roles?.length) await srDeleteAllOldProfileRolesAndUpdate(trx, existingProfile, data);

      await srUpdateUsersPrivilegesThatHasProfileAssigned(trx, existingProfile);
    } else {
      throw new MdUnprocessableEntityError(MESSAGE_INVALID_DATA);
    }
  }

  static async deleteByProfile(trx: Transaction, pProfileId: string): Promise<void> {
    await DoProfile.updateOneByPredicate(trx, {
      pProfileStatus: "disabled",
    }, {
      pProfileId,
    });

    const profileAttachedUserEntityIds = await DoPrivilegeDisplayUserRoleOrProfile.findAllByPredicatePickField(
      trx, {
        purpProfileOrRoleId: pProfileId,
        purpPrivilegeType: "profile",
      }, "purpUserEntityId",
    );

    if (profileAttachedUserEntityIds?.length) {
      await DoPrivilegeDisplayUserRoleOrProfile.deleteManyByCol(trx, "purpProfileOrRoleId", pProfileId);
      await utUpdateAllUsersPrivilegesIn(trx, profileAttachedUserEntityIds);
    }
  }

  static async deleteMultipleProfiles(trx: Transaction, deleteIds: string[]): Promise<void> {
    await Promise.all(
      deleteIds.map(async (id): Promise<void> => this.deleteByProfile(trx, id)),
    );
  }
}

export default SrProfileRole;
