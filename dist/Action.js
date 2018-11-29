/**
 * Created by YS on 2016/10/12.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Utils_1 = require("./Utils");
function RestfulActionFactory(option) {
    var actionDef = option.actionDef, getDataFromResponse = option.getDataFromResponse, baseUrl = option.baseUrl;
    return function RestfulAction(data, requestInit) {
        var nextRequestInit = tslib_1.__assign({}, requestInit);
        var url = Utils_1.fillParametersInPath(baseUrl + "/" + actionDef.path, data);
        if (actionDef.method)
            nextRequestInit.method = actionDef.method.toUpperCase();
        if (actionDef.getBody && data)
            nextRequestInit.body = JSON.stringify(actionDef.getBody(data));
        if (actionDef.getSearch)
            url += Utils_1.buildSearch(actionDef.getSearch(data));
        return option.fetch(url, nextRequestInit).then(function (res) { return res.json(); }).then(function (res) {
            return getDataFromResponse(res, actionDef.key);
        });
    };
}
exports.RestfulActionFactory = RestfulActionFactory;
//# sourceMappingURL=Action.js.map