import { QueryBuilder, Transaction } from "knex";
import DoBase from "../../../base/dao/doBase";
import MdCampaignField from "./mdCampaignField";
import MdCampaignFieldDescriptor from "../campaignFieldDescriptor/mdCampaignFieldDescriptor";
import { tpGetAllCampFields } from "../tpCampaign";

class DoCampaignField extends DoBase<MdCampaignField> {
  constructor() {
    super(MdCampaignField.TABLE_NAME);
  }

  getCampaignAllFields(
    trx: Transaction, campaignId: string,
  ): QueryBuilder<tpGetAllCampFields, tpGetAllCampFields> {
    return trx(this.tableName)
      .select([
        this.col("cfId"),
        this.col("cfFieldDescriptorId"),
        MdCampaignFieldDescriptor.col("cfdName"),
        MdCampaignFieldDescriptor.col("cfdSlug"),
        this.col("cfEditableBySupplier"),
        this.col("cfEditableByVendor"),
        MdCampaignFieldDescriptor.col("cfdAcceptableRespType"),
      ])
      .join(MdCampaignFieldDescriptor.TABLE_NAME, MdCampaignFieldDescriptor.col("cfdId"), this.col("cfFieldDescriptorId"))
      .where(this.col("cfCampId"), campaignId);
  }
}

export default new DoCampaignField();
