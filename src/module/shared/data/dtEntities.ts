import MdGroupDetails from "../../entities/group/mdGroupDetails";
import MdCompanyDetails from "../../entities/company/mdCompanyDetails";
import MdEntity from "../../entity/mdEntity";

export const dtDummyEntities: MdEntity[] = [
  {
    entityId: "f41770bb-6446-417c-b60a-7e07eb10bd8c",
    entityStatus: "active",
    entityType: "company",
  },
  {
    entityId: "f3f2232b-251a-4f63-9de7-42359a2ab67a",
    entityStatus: "active",
    entityType: "company",
  }, {
    entityId: "784491e7-3231-4bb4-8169-6d144f8279c1",
    entityStatus: "active",
    entityType: "company",
  },
  {
    entityId: "2a8e6b6a-d9d7-4fb9-ba4b-7c72552a4f50",
    entityStatus: "active",
    entityType: "company",
  }, {
    entityId: "034aec7d-0f79-4360-af1e-aeae12922604",
    entityStatus: "active",
    entityType: "group",
  }, {
    entityId: "729b846f-1f30-45b5-afdc-e35531803955",
    entityStatus: "active",
    entityType: "group",
  },
];

export const dtDummyInstances = (domainEntityId: string): MdGroupDetails[] => ([
  {
    gName: "Instance 1",
    gEntityId: "034aec7d-0f79-4360-af1e-aeae12922604",
    gDomainEntityId: domainEntityId,
  }, {
    gName: "Instance 2",
    gEntityId: "729b846f-1f30-45b5-afdc-e35531803955",
    gDomainEntityId: domainEntityId,
  },
]);

export const dtDummyCompanies = (instanceEntityId: string): MdCompanyDetails[] => ([
  {
    cId: "529865c2-67db-4ccb-8be8-52f16f14cb3b",
    cEntityId: "f41770bb-6446-417c-b60a-7e07eb10bd8c",
    cName: "Company A",
    cInstanceEntityId: instanceEntityId,
  },
  {
    cId: "2c848f83-8c96-4d8a-8673-572b7d81a4c8",
    cEntityId: "f3f2232b-251a-4f63-9de7-42359a2ab67a",
    cName: "Company B",
    cInstanceEntityId: instanceEntityId,
  },
  {
    cId: "330d78c5-7e88-45fc-9c22-67191c258dae",
    cEntityId: "784491e7-3231-4bb4-8169-6d144f8279c1",
    cName: "Company C",
    cInstanceEntityId: instanceEntityId,
  },
  {
    cId: "84d339d0-953a-4f4a-a123-e7eaaa2c1bda",
    cEntityId: "2a8e6b6a-d9d7-4fb9-ba4b-7c72552a4f50",
    cName: "Company D",
    cInstanceEntityId: instanceEntityId,
  },
]);
