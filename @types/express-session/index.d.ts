import { UserSessionType } from "../../src/module/shared/types/tpShared";

declare module "express-session" {

    export interface SessionData {
        user: UserSessionType;
        oldDbUser: { vendorId: string, vendorUserId: string, supplierId: string, supplierUserId: string };
    }
}
