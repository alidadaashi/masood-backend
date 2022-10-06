import { Transaction } from "knex";
import MdPrivilegeOption from "./permission/privilegeOption/mdPrivilegeOption";
import { EntityTypes, PermissionOptionTypes } from "../shared/types/tpShared";
import {
  OPTIONS_SEPARATOR,
  P_OPTION_ALL_IN_DOMAIN,
  P_OPTION_ALL_IN_GROUP,
  P_OPTION_ALL_IN_SYSTEM,
  P_OPTION_NONE,
  P_OPTION_OWN_IN_DOMAIN,
  P_OPTION_OWN_IN_GROUP,
  P_OPTION_OWN_IN_SYSTEM,
  P_OPTION_YES,
} from "../shared/constants/dtPermissionConstants";
import MdPrivilege from "./permission/mdPrivilege";
import DoPrivilegeDisplayUserEntity from "./privilegeDisplayUserEntity/doPrivilegeUserEntity";
import MdPrivilegeUserEntity from "./privilegeDisplayUserEntity/mdPrivilegeUserEntity";

type FindHighPriorityOptionsType = { [keys in PermissionOptionTypes]: string | null | undefined } | null;

const utUpdatePrivIfYesOptions = (
  options: FindHighPriorityOptionsType,
  permissionOptions: MdPrivilegeOption[],
) => {
  const firstHighPriorityOnes: FindHighPriorityOptionsType = options;
  const utUpdateOptionsIfYesExists = (privilegeOption: PermissionOptionTypes) => {
    if (firstHighPriorityOnes) {
      if (firstHighPriorityOnes[privilegeOption]
        && firstHighPriorityOnes[privilegeOption] !== P_OPTION_YES
        && firstHighPriorityOnes[privilegeOption] !== P_OPTION_NONE
      ) {
        const yestOption = permissionOptions
          .find((po) => po.poOptionType === privilegeOption && po.poOption === P_OPTION_YES);
        if (yestOption) {
          firstHighPriorityOnes[
            privilegeOption
          ] = `${firstHighPriorityOnes[privilegeOption]}${OPTIONS_SEPARATOR}${P_OPTION_YES}`;
        }
      }
    }
  };

  if (firstHighPriorityOnes) {
    utUpdateOptionsIfYesExists("v");
    utUpdateOptionsIfYesExists("e");
    utUpdateOptionsIfYesExists("c");
    utUpdateOptionsIfYesExists("d");
    utUpdateOptionsIfYesExists("f");
  }

  return firstHighPriorityOnes;
};

const utFindAllInOptions = (options: MdPrivilegeOption[]) => options.find((eo) => (
  eo.poOption === P_OPTION_ALL_IN_SYSTEM || eo.poOption === P_OPTION_ALL_IN_DOMAIN
  || eo.poOption === P_OPTION_ALL_IN_GROUP));

const utFindOwnInOptions = (options: MdPrivilegeOption[]) => options.find((eo) => (
  eo.poOption === P_OPTION_OWN_IN_SYSTEM || eo.poOption === P_OPTION_OWN_IN_DOMAIN
  || eo.poOption === P_OPTION_OWN_IN_GROUP));

const utFindYesInOptions = (options: MdPrivilegeOption[]) => options.find((eo) => eo
  .poOption === P_OPTION_YES);

const utFindNoneInOptions = (options: MdPrivilegeOption[]) => options.find((eo) => eo
  .poOption === P_OPTION_NONE);

const utSetGroupAssignedEntities = (
  selectedGroupEntities: MdPrivilegeUserEntity[],
  finalValue: Record<PermissionOptionTypes, { option: string } | null>,
  optionType: PermissionOptionTypes,
) => {
  const yesOptionEntities = selectedGroupEntities.reduce((accumObj, e) => ({
    ...accumObj,
    [e.pueEntityId]: { option: P_OPTION_YES },
  }), {});
  return {
    ...finalValue,
    [optionType]: yesOptionEntities,
  };
};

const utSetGroupParentEntitiesByType = (
  selectedDomainEntities: MdPrivilegeUserEntity[],
  finalValue: Record<PermissionOptionTypes, { option: string } | null>,
  optionType: PermissionOptionTypes,
  optionValue: string,
) => {
  const ownOrAllOptionEntities = selectedDomainEntities.reduce((accumObj, e) => ({
    ...accumObj,
    [e.pueEntityId]: { option: optionValue },
  }), {});
  return {
    ...finalValue,
    [optionType]: {
      ...(finalValue[optionType] || {}),
      ...(ownOrAllOptionEntities || {}),
    },
  };
};

const utGetFinalOptionValues = (
  accum: Record<PermissionOptionTypes, { option: string } | null>,
  { optionType, optionValues }: { optionType: PermissionOptionTypes, optionValues: string[] },
  selectedGroupEntities: MdPrivilegeUserEntity[],
  selectedDomainEntities: MdPrivilegeUserEntity[],
): Record<PermissionOptionTypes, { option: string } | null> => {
  let finalValue = { ...accum };

  finalValue = optionValues.includes(P_OPTION_YES)
    ? utSetGroupAssignedEntities(selectedGroupEntities, finalValue, optionType)
    : finalValue;

  finalValue = optionValues.includes(P_OPTION_ALL_IN_DOMAIN)
    ? utSetGroupParentEntitiesByType(selectedDomainEntities, finalValue, optionType, P_OPTION_ALL_IN_DOMAIN)
    : finalValue;

  finalValue = optionValues.includes(P_OPTION_OWN_IN_DOMAIN)
    ? utSetGroupParentEntitiesByType(selectedDomainEntities, finalValue, optionType, P_OPTION_OWN_IN_DOMAIN)
    : finalValue;

  finalValue = optionValues.includes(P_OPTION_OWN_IN_GROUP)
    ? utSetGroupParentEntitiesByType(selectedGroupEntities, finalValue, optionType, P_OPTION_OWN_IN_GROUP)
    : finalValue;

  finalValue = optionValues.includes(P_OPTION_ALL_IN_GROUP)
    ? utSetGroupParentEntitiesByType(selectedGroupEntities, finalValue, optionType, P_OPTION_ALL_IN_GROUP)
    : finalValue;

  return finalValue;
};

class UtPrivileges {
  static getFinalOption(
    permissionOptions: MdPrivilegeOption[],
    optionType: PermissionOptionTypes,
  ): MdPrivilegeOption | null | undefined {
    const option = permissionOptions.filter((p) => p.poOptionType === optionType);
    let finalOption = null;
    if (option.length > 1) {
      finalOption = utFindAllInOptions(option);
      if (!finalOption) finalOption = utFindOwnInOptions(option);
      if (!finalOption) finalOption = utFindYesInOptions(option);
      if (!finalOption) finalOption = utFindNoneInOptions(option);
    } else {
      finalOption = option?.length ? option[0] : null;
    }
    return finalOption;
  }

  static findHighPriorityOnesPriv(
    options: (MdPrivilege & { permissionOptions: MdPrivilegeOption[] })[],
    type: EntityTypes | "domain user" | "group user" | "hit all API",
  ): FindHighPriorityOptionsType {
    const entityPriv = options
      .find((o) => o.pPrivilege === type);
    if (entityPriv && entityPriv.permissionOptions?.length) {
      const finalOptionForE = UtPrivileges.getFinalOption(entityPriv.permissionOptions, "e");
      const finalOptionForC = UtPrivileges.getFinalOption(entityPriv.permissionOptions, "c");
      const finalOptionForD = UtPrivileges.getFinalOption(entityPriv.permissionOptions, "d");
      const finalOptionForV = UtPrivileges.getFinalOption(entityPriv.permissionOptions, "v");
      const finalOptionForF = UtPrivileges.getFinalOption(entityPriv.permissionOptions, "f");

      return {
        e: finalOptionForE?.poOption,
        c: finalOptionForC?.poOption,
        d: finalOptionForD?.poOption,
        v: finalOptionForV?.poOption,
        f: finalOptionForF?.poOption,
      };
    }
    return null;
  }

  static findHighPriorityOnesPrivForGroup(
    options: (MdPrivilege & { permissionOptions: MdPrivilegeOption[] })[],
    type: EntityTypes | "group user" | "hit all API",
  ): FindHighPriorityOptionsType {
    const entityPriv = options
      .find((o) => o.pPrivilege === type);
    if (entityPriv && entityPriv.permissionOptions?.length) {
      const firstHighPriorityOnes = UtPrivileges
        .findHighPriorityOnesPriv(options, type);

      return utUpdatePrivIfYesOptions(firstHighPriorityOnes, entityPriv.permissionOptions);
    }

    return null;
  }

  static async buildPrivilegeSchemaForDomain(
    trx: Transaction,
    userEntityId: string,
    domainOption: FindHighPriorityOptionsType,
  ): Promise<Record<string, unknown> | null> {
    if (domainOption) {
      const yesEntities = await DoPrivilegeDisplayUserEntity.findAllByPredicate(trx, {
        pueUserEntityId: userEntityId,
        pueEntityType: "domain",
      });
      return Object.keys(domainOption)
        .reduce((accum, ot) => {
          const optionType = ot as unknown as PermissionOptionTypes;
          const optionValue = domainOption[optionType];
          if (optionValue && optionValue !== P_OPTION_NONE) {
            if (optionValue === P_OPTION_YES) {
              const yesOptionEntities = yesEntities.reduce((accumObj, e) => ({
                ...accumObj,
                [e.pueEntityId]: { option: optionValue },
              }), {});
              return {
                ...accum,
                [optionType]: yesOptionEntities,
              };
            }
            return {
              ...accum,
              [optionType]: {
                [optionValue]: { option: optionValue },
              },
            };
          }
          return accum;
        }, {});
    }
    return null;
  }

  static async buildPrivilegeSchemaForGroup(
    trx: Transaction,
    userEntityId: string,
    groupOption: FindHighPriorityOptionsType,
  ): Promise<Record<string, unknown> | null> {
    if (groupOption) {
      const selectedDomainEntities = await DoPrivilegeDisplayUserEntity.findAllByPredicate(trx, {
        pueUserEntityId: userEntityId,
        pueEntityType: "domain",
      });
      const selectedGroupEntities = await DoPrivilegeDisplayUserEntity.findAllByPredicate(trx, {
        pueUserEntityId: userEntityId,
        pueEntityType: "group",
      });

      return Object.keys(groupOption)
        .reduce((accum, ot) => {
          const optionType = ot as unknown as PermissionOptionTypes;
          const optionValue = groupOption[optionType];
          if (optionValue && optionValue !== P_OPTION_NONE) {
            const optionValues = optionValue.split(OPTIONS_SEPARATOR);

            const finalValue = utGetFinalOptionValues(accum,
              { optionType, optionValues }, selectedGroupEntities, selectedDomainEntities);
            return finalValue;
          }
          return accum;
        }, {} as Record<PermissionOptionTypes, { option: string } | null>);
    }

    return null;
  }
}

export default UtPrivileges;
