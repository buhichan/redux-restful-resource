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
    var actionDef = option.actionDef, getDataFromResponse = option.getDataFromResponse, getID = option.getID, baseUrl = option.baseUrl;
    var ActionCacheMap = {};
    var isRequesting;
    return function RestfulAction(data, requestInit) {
        var nextRequestInit = __assign({}, requestInit);
        var url = baseUrl + "/" + actionDef.path.replace(/(:\w+)(?=\/|$)/g, function (match) {
            return data[match.slice(1)] || "";
        });
        if (actionDef.getBody && data)
            nextRequestInit.body = JSON.stringify(actionDef.getBody(data));
        if (actionDef.getSearch)
            url += Utils_1.buildQuery(actionDef.getSearch(data));
        if (actionDef.cacheTime) {
            var cached = ActionCacheMap[url];
            if (cached) {
                var LastCachedTime = cached.LastCachedTime, cachedPromise = cached.cachedPromise;
                if (Date.now() - LastCachedTime < actionDef.cacheTime)
                    isRequesting = cachedPromise;
            }
        }
        if (!isRequesting) {
            isRequesting = fetch(url, nextRequestInit).then(function (res) { return res.json(); }).then(function (res) {
                return getDataFromResponse(res, actionDef.key);
            });
            if (actionDef.cacheTime)
                ActionCacheMap[url] = {
                    cachedPromise: isRequesting,
                    LastCachedTime: Date.now()
                };
        }
        return isRequesting;
    };
}
exports.RestfulActionFactory = RestfulActionFactory;
//# sourceMappingURL=Action.js.map