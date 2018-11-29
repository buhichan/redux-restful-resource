"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Utils_1 = require("./Utils");
/**
 * Created by YS on 2016/11/4.
 */
var immutable_1 = require("immutable");
exports.getReducer = function (payload) { return function (rootState) {
    return Utils_1.deepSetState.apply(void 0, [rootState, immutable_1.List(payload.models)].concat(payload.pathInState));
}; };
exports.putReducer = function (payload) { return function (rootState) {
    var list = Utils_1.deepGetState.apply(void 0, [rootState].concat(payload.pathInState));
    if (!list)
        return Utils_1.deepSetState.apply(void 0, [rootState, immutable_1.List([payload])].concat(payload.pathInState));
    var index = list.findIndex(function (entry) { return payload.key(entry) === payload.key(payload.model); });
    if (index < 0)
        return Utils_1.deepSetState.apply(void 0, [rootState, list.push(payload.model)].concat(payload.pathInState));
    if (index >= 0) {
        return Utils_1.deepSetState.apply(void 0, [rootState, list.update(index, function (old) {
                return (tslib_1.__assign({}, old, payload.model));
            })].concat(payload.pathInState));
    }
    else
        return rootState;
}; };
exports.postReducer = function (payload) { return function (rootState) {
    var list = Utils_1.deepGetState.apply(void 0, [rootState].concat(payload.pathInState));
    if (!list)
        list = immutable_1.List();
    else if (!list.insert)
        list = immutable_1.List(list);
    return Utils_1.deepSetState.apply(void 0, [rootState, list.insert(0, payload.model)].concat(payload.pathInState));
}; };
exports.deleteReducer = function (payload) { return function (rootState) {
    var list = Utils_1.deepGetState.apply(void 0, [rootState].concat(payload.pathInState));
    var i = list.findIndex(function (item) {
        return (payload.key(item) === payload.key(payload.model));
    });
    if (i >= 0)
        list = list.delete(i);
    return Utils_1.deepSetState.apply(void 0, [rootState, list].concat(payload.pathInState));
}; };
//# sourceMappingURL=ResourceReducer.js.map