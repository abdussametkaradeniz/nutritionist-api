"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Permission = exports.Role = void 0;
var Role;
(function (Role) {
    Role["USER"] = "USER";
    Role["DIETITIAN"] = "DIETITIAN";
    Role["ADMIN"] = "ADMIN";
})(Role || (exports.Role = Role = {}));
var Permission;
(function (Permission) {
    Permission["READ_PROFILE"] = "read:profile";
    Permission["UPDATE_PROFILE"] = "update:profile";
    Permission["DELETE_PROFILE"] = "delete:profile";
    Permission["CREATE_APPOINTMENT"] = "create:appointment";
    Permission["UPDATE_APPOINTMENT"] = "update:appointment";
    Permission["DELETE_APPOINTMENT"] = "delete:appointment";
    Permission["MANAGE_USERS"] = "manage:users";
    Permission["MANAGE_DIETITIANS"] = "manage:dietitians";
    Permission["MANAGE_SYSTEM"] = "manage:system";
})(Permission || (exports.Permission = Permission = {}));
