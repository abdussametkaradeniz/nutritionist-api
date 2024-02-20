export enum UserRole {
  Admin = "ADMIN",
  Dietician = "DIETICIAN",
  UserWithDietician = "USERWITHDIETICIAN",
  User = "USER",
}

export enum Permissions {
  "view_clients" = "VIEW_CLIENTS",
  "edit_clients" = "EDIT_CLIENTS",
  "delete_clients" = "DELETE_CLIENTS",
  "view_own_profile" = "VIEW_OWN_PROFILE",
  "edit_own_profile" = "EDIT_OWN_PROFILE",
  "record_daily_intake" = "RECORD_DAILY_INTAKE",
}
