/**
 * Created by YS on 2016/10/12.
 */
"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Utils_1 = require("./Utils");
function RestfulActionFactory(option) {
    var actionDef = option.actionDef, getDataFromResponse = option.getDataFromResponse, baseUrl = option.baseUrl;
    return function RestfulAction(data, requestInit) {
        var nextRequestInit = __assign({}, requestInit);
        var url = Utils_1.fillParametersInPath(baseUrl + "/" + actionDef.path, data);
        if (actionDef.method)
            nextRequestInit.method = actionDef.method.toUpperCase();
        if (actionDef.getBody && data)
            nextRequestInit.body = JSON.stringify(actionDef.getBody(data));
        if (actionDef.getSearch)
            url += Utils_1.buildQuery(actionDef.getSearch(data));
        return option.fetch(url, nextRequestInit).then(function (res) { return res.json(); }).then(function (res) {
            return getDataFromResponse(res, actionDef.key);
        });
    };
}
exports.RestfulActionFactory = RestfulActionFactory;
//# sourceMappingURL=Action.js.map