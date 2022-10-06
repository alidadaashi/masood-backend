import MdDocAndNoteType from "../../documentAndNotes/docAndNoteType/mdDocAndNoteType";

const dtSysDefDocAndNoteTypes: MdDocAndNoteType[] = [
  {
    dntId: "7d514494-73d2-4bb5-ab3c-d392c62c0846",
    dntName: "Purchase Orders",
    dntDefinedType: "system-defined",
    dntIsValidityRequired: false,
    dntIsPrivNeeded: false,
    dntHierarchyType: "main",
    dntIsActive: true,
    dntType: "document",
  }, {
    dntId: "18d4c0a8-fe8e-439e-abb3-4ffb3eb5f4e3",
    dntName: "Purchase Orders Sub Type 1",
    dntDefinedType: "system-defined",
    dntIsValidityRequired: false,
    dntIsPrivNeeded: false,
    dntHierarchyType: "sub-type",
    dntIsActive: true,
    dntParentTypeId: "7d514494-73d2-4bb5-ab3c-d392c62c0846",
    dntType: "document",
  }, {
    dntId: "7c7fa346-06c6-46af-8b9b-bfb967bd0bb3",
    dntName: "Purchase Orders Sub Type 2",
    dntDefinedType: "system-defined",
    dntIsValidityRequired: false,
    dntIsPrivNeeded: false,
    dntHierarchyType: "sub-type",
    dntIsActive: true,
    dntParentTypeId: "7d514494-73d2-4bb5-ab3c-d392c62c0846",
    dntType: "document",
  },
  {
    dntId: "bc51aa06-6984-4184-bbee-bb85a2c36309",
    dntName: "Purchase Orders",
    dntDefinedType: "system-defined",
    dntHierarchyType: "main",
    dntIsActive: true,
    dntType: "note",
  },
  {
    dntId: "8bf8fad9-3d29-4ac9-a38e-2d12534e4a80",
    dntName: "PO Letter Note",
    dntDefinedType: "system-defined",
    dntHierarchyType: "sub-type",
    dntIsActive: true,
    dntParentTypeId: "bc51aa06-6984-4184-bbee-bb85a2c36309",
    dntType: "note",
  },
  {
    dntId: "f7298dfa-7370-4456-b12c-7fdda32fbdbd",
    dntName: "PO Shipment Order",
    dntDefinedType: "system-defined",
    dntHierarchyType: "sub-type",
    dntIsActive: true,
    dntParentTypeId: "bc51aa06-6984-4184-bbee-bb85a2c36309",
    dntType: "note",
  },
];

export const PURCHASE_ORDERS_PARENT_TYPE_ID = "bc51aa06-6984-4184-bbee-bb85a2c36309";
export const NOTE_TYPE = "note";
export default dtSysDefDocAndNoteTypes;
