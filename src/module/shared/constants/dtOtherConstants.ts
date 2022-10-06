import { getSlug } from "../../../../i18n";

export const MESSAGE_PERMISSION_DENIED = getSlug("notif__err__permission_denied");
export const MESSAGE_INVALID_DATA = getSlug("notif__text__msg_invalid_data");
export const RECORD_FILE_NOT_FOUND = getSlug("notif__text__rec_file_not_found");
export const MSG_FAILED_SENDING_STICKY_NOTE = getSlug("notif__text__failed_sending_sticky_note");
export const MESSAGE_SOME_THING_WENT_WRONG = getSlug("notif__err__server_error");
export const MESSAGE_MUST_BE_NUMERIC_VALUE_FILTER = getSlug("notif__err__must_numreic_value");
export const WS_SESSION_TYPE = "session";
export const WS_NOTIFICATION_TYPE = "notification";
export const ALPHA_TEXT_WITH_SPACE = /^[A-Za-z\s]+$/;
export const DEFAULT_CAMPAIGN_API_TOKEN_EXPIRY_IN_HOURS = "730";
export const REMOVE_CODE_IN_CELL_VALUE_REGEX = "$$#$$";
export const DOC_AND_NOTE_TYPE_DOCUMENT = "document";
export const SYSTEM_DEFINED_DOCUMENT_TYPES_KEY = "system-defined";
export const STICKY_NOTE_STATUS = {
  UNREAD: "unread",
} as const;

export const STICKY_NOTE_TYPE = {
  GENERAL: "general",
  WITH_REF: "withReference",
} as const;

export const MESSAGE_DOMAIN_CREATED = getSlug("notif__succ__domain_created");
export const MESSAGE_DOMAIN_UPDATED = getSlug("notif__succ__domain_updated");
export const MESSAGE_DOMAIN_DELETED = getSlug("notif__succ__domain_deleted");
export const MESSAGE_GROUP_CREATED = getSlug("notif__succ__group_created");
export const MESSAGE_GROUP_UPDATED = getSlug("notif__succ__group_updated");
export const MESSAGE_GROUP_DELETED = getSlug("notif__succ__group_deleted");

export const MESSAGE_LAYOUT_PREFERENCE_SAVED = getSlug("notif__succ__layout_preference_saved");
export const MESSAGE_PREFERENCE_SAVED = getSlug("notif__succ__preference_saved");
export const MESSAGE_SETTINGS_APPLIED = getSlug("notif__succ__settings_applied");
export const MESSAGE_USER_CREATED = getSlug("notif__succ__user_created");
export const MESSAGE_USER_UPDATED = getSlug("notif__succ__user_updated");
export const MESSAGE_USER_DELETED = getSlug("notif__succ__user_deleted");
export const MESSAGE_PAGE_TRANS_UPDATED = getSlug("notif__succ__page_trans_updated");
export const MESSAGE_TRANS_UPDATED = getSlug("notif__succ__trans_updated");
export const MESSAGE_TRANS_UPDATED_MI = getSlug("notif__succ__trans_updated_mi");
export const MESSAGE_TRANS_UPDATED_UNDER_IMPLEMENTATION = getSlug("notif__succ__trans_under_implementation");
export const MESSAGE_CAMPAIGN_STATUS_CHANGED = getSlug("notif__succ__campaign_status_changed");
export const MESSAGE_CAMPAIGN_CREATED = getSlug("notif__succ__campaign_created");
export const MESSAGE_LANG_UPDATED = getSlug("notif__succ__lang_updated");
export const MESSAGE_LANG_CREATED = getSlug("notif__succ__lang_created");
export const MESSAGE_THEME_UPDATED = getSlug("notif__succ__theme_updated");
export const MESSAGE_THEME_NAME_REQUIRED = getSlug("notif__succ__theme_name_required");
export const MESSAGE_LAYOUT_PREF_UPDATED = getSlug("notif__succ__layout_pref_updated");
export const MESSAGE_LAYOUT_PREF_DELETED = getSlug("notif__succ__layout_pref_deleted");
export const MESSAGE_PAGE_PREF_NOT_EXISTS = getSlug("notif__succ__page_pref_not_exists");
export const MESSAGE_PAGE_PREF_UPDATED = getSlug("notif__succ__page_pref_updated");
export const MESSAGE_PAGE_PREF_DELETED = getSlug("notif__succ__page_pref_deleted");
export const MESSAGE_PRIVILEGE_SAVED_USER = getSlug("notif__succ__privilege_saved_for_user");
export const MESSAGE_PROFILE_UPDATED = getSlug("notif__succ__profile_updated");
export const MESSAGE_PROFILE_CREATED = getSlug("notif__succ__profile_created");
export const MESSAGE_DEFAULT_INSTANCE_SETTINGS_UPDATED = getSlug("notif__succ__instance_settings_updated");
export const MESSAGE_DEFAULT_INSTANCE_SELECTED = getSlug("notif__succ__default_instance_selected");
export const MESSAGE_ROLE_CREATED = getSlug("notif__succ__role_created");
export const MESSAGE_ROLE_UPDATED = getSlug("notif__succ__role_updated");
export const MESSAGE_CAMPAIGN_RESPONSE_SAVED = getSlug("notif__succ__campaign_response_saved");

export const ERR_SESSION_NOT_EXISTS = getSlug("notif__err__session_not_exists");
export const ERR_ACCESS_DENIED = getSlug("notif__err__access_denied");
export const ERR_DOMAIN_DETAILS_NOT_EXISTS = getSlug("notif__err__domain_details_not_exists");
export const ERR_DOMAIN_NOT_EXISTS = getSlug("notif__err__domain_not_exists");
export const ERR_DOCUMENT_TYPE_REQUIRED = getSlug("notif__err__document_type_required");
export const ERR_GROUP_DETAILS_NOT_EXISTS = getSlug("notif__err__group_details_not_exists");
export const ERR_GROUP_NOT_EXISTS = getSlug("notif__err__group_not_exists");
export const ERR_USER_NOT_EXISTS = getSlug("notif__err__user_not_exists");
export const ERR_LANG_ALREADY_EXISTS = getSlug("notif__err__language_already_exists");
export const ERR_THEME_NAME_REQUIRED = getSlug("notif__err__theme_name_required");
export const ERR_PREFERENCE_NAME_ALREADY_EXISTS = getSlug("notif__err__preference_name_already_exists");
export const ERR_PREFERENCE_DETAILS_NOT_EXISTS = getSlug("notif__err__preference_details_not_exists");
export const ERR_DELETING_NOT_EXISTS = getSlug("notif__err__deleting_not_exists");
export const ERR_PREFERENCE_NOT_EXISTS = getSlug("notif__err__preference_not_exists");
export const ERR_PROFILE_NOT_EXISTS = getSlug("notif__err__profile_not_exists");
export const ERR_ROLE_PERMISSION_REQUIRED = getSlug("notif__err__role_permission_required");
export const ERR_ROLE_NOT_EXISTS = getSlug("notif__err__role_not_exists");
export const ERR_I18N_KEY_UNAVAILABLE = getSlug("notif__err__i18n_key_unavailable");
export const ERR_INVALID_DATA_PROVIDED = getSlug("notif__err__invalid_data_provided");
export const ERR_FILE_NOT_EXISTS = getSlug("notif__err__file_doesnot_exists");
export const ERR_NO_DATA_EXPORT = getSlug("notif__err__no_data_to_export");
export const ERR_USER_EXISTS = getSlug("notif__err__user_exists");
export const ERR_USER_EMAIL_EXISTS = getSlug("notif__err__user_with_email_exists");
export const ERR_CAMPAIGN_INVALID_FIELDS = getSlug("notif__err__campaign_invalid_field_data");
export const ERR_CAMPAIGN_INVALID_NUM_FMT = getSlug("notif__err__campaign_invalid_number_format");
export const ERR_CAMPAIGN_REQUIRED_FIELDS = getSlug("notif__err__campaign_required_field_missing");
export const ERR_CAMPAIGN_EXPIRED = getSlug("notif__err__campaign_expired");
export const ERR_PRODUCT_STATUS_IS_APPROVED_OR_REJECTED = getSlug("notif__err__status_approved_or_rejected");

export const MESSAGE_ROLE_DELETED = getSlug("notif__succ__role_deleted");
export const MESSAGE_PROFILE_DELETED = getSlug("notif__succ__profile_deleted");
export const MESSAGE_PRODUCT_CREATED = getSlug("notif__succ__product_created");

export const MESSAGE_FILE_UPLOADED = getSlug("notif__succ__file_uploaded");
export const MESSAGE_FILES_UPLOADED = getSlug("notif__succ__files_uploaded");
export const MESSAGE_FILE_UPDATED = getSlug("notif__succ__file_updated");

export const ERR_CAMPAIGN_SUPPLIER_NOT_EXISTS = getSlug("notif__err__campaign_supplier_not_exists");
export const ERR_VENDOR_CAMP_STATUS_CANNOT_BE_CHANGED = getSlug("notif__err__vendor_camp_status_cannot_be_changed");
export const ERR_SUPP_CAMP_STATUS_CANNOT_BE_CHANGED = getSlug("notif__err__supp_camp_status_cannot_be_changed");
export const ERR_SUPP_CAMP_DETAILS_CANNOT_BE_UPDATED = getSlug("notif__err__supp_camp_details_cannot_be_changed");
export const ERR_VENDOR_CAMP_DETAILS_CANNOT_BE_UPDATED = getSlug("notif__err__vendor_camp_details_cannot_be_changed");
export const ERR_CAMPAIGN_STATUS_IS_INVALID = getSlug("notif__err__campaign_status_is_invalid");
export const ERR_CAMPAIGN_SENDING_EMAILS = getSlug("notif__err__campaign_sending_emails");
export const ERR_UPLOAD_CORRECT_FILE = getSlug("notif__err__upload_correct_file");

export const MESSAGE_DOCUMENT_TYPE_CREATED = getSlug("notif__succ__document_type_created");
export const MESSAGE_DOCUMENT_TYPE_UPDATED = getSlug("notif__succ__document_type_updated");
export const MESSAGE_DOCUMENT_TYPE_DELETED = getSlug("notif__succ__document_type_deleted");
export const ERR_DOCUMENT_TYPE_NAME_ALREADY_EXISTS = getSlug("notif__err__document_type_already_exist");
export const ERR_DOCUMENT_TYPE_EMPTY_NAME = getSlug("notif__err__document_type_empty_name");
export const ERR_DOCUMENT_TYPE_NO_INSTANCE = getSlug("notif__err__document_type_no_instance");
export const ERR_DOCUMENT_TYPE_NOT_EXISTS = getSlug("notif__err_document_type_not_exists");
export const ERR_DOCUMENT_TYPE_INVALID_PARENT_ID = getSlug("notif__err__document_type_invalid_parent_id");
export const ERR_SUB_TYPE_EXISTS_WITH_TYPE_CANNOT_BE_DELETED = getSlug(
  "notif__err__sub_type_exists_with_type_cannot_be_deleted",
);
export const ERR_ATTACHMENT_EXISTS_WITH_TYPE_CANNOT_BE_DELETED = getSlug(
  "notif__err__attachment_exists_with_type_cannot_be_deleted",
);
export const ERR_DOCUMENT_TYPE_INVALID_COMPANY_ID = getSlug(
  "notif__err__document_type_invalid_company_id",
);
export const ERR_DOCUMENT_TYPE_COMPANY_UNRELATED_TO_SELECTED_INSTANCE = getSlug(
  "notif__err__document_type_company_unrelated_to_selected_instance",
);

export const MSG_NOTE_SUBTYPE_ADDED = getSlug("notif__succ_note_sub_type_added");
export const MSG_NOTE_SUBTYPE_UPDATED = getSlug("notif__succ_note_sub_type_updated");
export const MSG_MAIN_NOTE_TYPE_CANNOT_BE_ADDED = getSlug("notif__err_note_main_type_cannot_be_added");
export const MSG_NOTE_MAIN_TYPE_NOT_EXISTS = getSlug("notif__err_note_parent_type_not_exists");
export const MSG_MAIN_NOTE_TYPE_CANNOT_BE_UPDATED = getSlug("notif__err_note_parent_type_cannot_be_updated");
export const MSG_NOTE_TYPE_NOT_EXISTS = getSlug("notif__err_note_type_not_exists");
export const MSG_NOTE_TYPE_ALREADY_EXISTS = getSlug("notif__err_note_type_already_exists");
export const MSG_NOTE_SUBTYPE_DELETED = getSlug("notif__succ_note_type_deleted");
export const MSG_MAIN_NOTE_TYPE_CANNOT_BE_DELETED = getSlug("notif__err__note_parent_type_cannot_be_deleted");
export const MSG_NOTE_TYPE_NAME_CANNOT_BE_EMPTY = getSlug("notif__err__note_type_name_cannot_be_empty");
export const MSG_SELECT_ATLEAST_ONE_INSTANCE = getSlug("notif__err__select_atleast_one_instance");
export const MSG_NOTE_TYPE_ALREADY_EXISTS_FOR_COMPANY = getSlug("notif__err__type_already_exist_for_company");
export const MSG_NOTE_TYPE_ALREADY_EXISTS_FOR_INSTANCE = getSlug("notif__err__type_already_exist_for_instance");
export const MSG_NOTE_EXISTS_WITH_TYPE_CANNOT_BE_DELETED = getSlug("notif__err__note_exists_with_type_cannot_be_deleted");

export const MSG_NOTE_CREATED = getSlug("notif__succ__note_created");
export const MSG_NOTE_UPDATED = getSlug("notif__succ__note_updated");
export const MSG_NOTE_SUB_TYPE_EXISTS_CANNOT_CREATE = getSlug("notif__err__note_sub_type_exists_cannot_create");
export const MSG_EXT_USER_CANNOT_CREATE_INT_NOTES = getSlug("notif__err__external_user_cannot_create_internal_notes");
export const MSG_NOTE_NOT_EXISTS = getSlug("notif__err__note_not_exists");
export const MSG_CANNOT_EDIT_DELETED_NOTE = getSlug("notif__err__cannot_edit_deleted_note");
export const NOTE_DELETED_SUCCESSFULLY = getSlug("notif__succ__note_deleted");
export const ERR_MSG_NOTE_CANNOT_BE_DELETED = getSlug("notif__err__note_cannot_be_deleted");
export const ERR_MSG_NOTE_CANNOT_BE_UPDATED = getSlug("notif__err__note_cannot_be_update");

export const STICKY_NOTE_SENT_SUCCESSFULLY = getSlug("notif__succ__sticky_note_sent");
export const STICKY_NOTE_UPDATED_SUCCESSFULLY = getSlug("notif__succ__sticky_note_updated");
export const STICKY_NOTE_DELETED_SUCCESSFULLY = getSlug("notif__succ__sticky_note_deleted");
export const MSG_STICKY_NOTES_NOT_FOUND = getSlug("notif__succ__sticky_note_not_found");

export const MSG_ATTACHMENT_ADDED_SUCCESSFULLY = "notif__succ__attachment_added_successfully";
export const ERR_MSG_DOC_TYPE_NOT_EXISTS = "notif__err__doc_type_not_exists";
export const ERR_MSG_DOC_VALIDITY_REQUIRED = "notif__err__doc_validity_required";
export const ERR_MSG_RECORD_NOT_EXISTS = "notif__err__record_not_exists";
export const ERR_MSG_NO_FILE_ADDED = "notif__err__no_file_added";
