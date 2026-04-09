"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiCode = void 0;
var ApiCode;
(function (ApiCode) {
    /**
     * 操作成功
     */
    ApiCode[ApiCode["SUCCESS"] = 1000] = "SUCCESS";
    ApiCode[ApiCode["ERROR"] = 1001] = "ERROR";
    ApiCode[ApiCode["INTERNAL_ERROR"] = 1002] = "INTERNAL_ERROR";
    ApiCode[ApiCode["NO_TIP_ERROR"] = 1003] = "NO_TIP_ERROR";
})(ApiCode || (exports.ApiCode = ApiCode = {}));
