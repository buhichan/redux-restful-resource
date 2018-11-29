"use strict";
/**
 * Created by YS on 2016/11/4.
 */
Object.defineProperty(exports, "__esModule", { value: true });
function getImmuOrPOJO(target, key) {
    if (!target)
        return null;
    if (!key)
        return null;
    return (typeof target.get === 'function') ?
        target.get(key) : target[key];
}
exports.getImmuOrPOJO = getImmuOrPOJO;
function setImmuOrPOJO(target, data, key) {
    if (!target)
        return null;
    if (!key)
        return null;
    if (typeof target.set === 'function')
        return target.set(key, data);
    else {
        target[key] = data;
        return target;
    }
}
exports.setImmuOrPOJO = setImmuOrPOJO;
function deepGet(obj, pathStr) {
    var path = pathStr.split(/\.|\[|\]/g);
    var result = obj;
    for (var i = 0; i < path.length; i++) {
        if (path[i] !== "") {
            result = result[path[i]];
            if (result === null || result === undefined)
                return result;
        }
    }
    return result;
}
exports.deepGet = deepGet;
function deepGetState(rootState) {
    var keys = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        keys[_i - 1] = arguments[_i];
    }
    return keys.reduce(function (state, key) {
        return getImmuOrPOJO(state, key);
    }, rootState);
}
exports.deepGetState = deepGetState;
function deepSetState(state, data) {
    var keys = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        keys[_i - 2] = arguments[_i];
    }
    if (!keys || !keys.length)
        return data;
    var nextKey = keys.shift();
    var prevState = getImmuOrPOJO(state, nextKey) || {};
    var nextState = deepSetState.apply(void 0, [prevState, data].concat(keys));
    if (prevState !== nextState)
        return setImmuOrPOJO(state, nextState, nextKey);
    return state;
}
exports.deepSetState = deepSetState;
function buildSearch(params) {
    if (!params)
        return "";
    var keys = Object.keys(params);
    if (!keys.length)
        return "";
    else
        return "?" + Object.keys(params).map(function (key) {
            var item = params[key];
            var value = typeof item === 'object' ?
                JSON.stringify(item) : item;
            return encodeURIComponent(key) + "=" + encodeURIComponent(value);
        }).join("&");
}
exports.buildSearch = buildSearch;
function fillParametersInPath(path, params) {
    return path.replace(/(\/:\w+)(?=\/|$)/g, function (match) {
        if (!params)
            return "";
        var value = params[match.slice(2)];
        return value ? ("/" + value) : "";
    });
}
exports.fillParametersInPath = fillParametersInPath;
function stripTrailingSlash(path) {
    if (path && path.length > 1 && path[path.length - 1] === '/')
        return path.slice(0, -1);
    else
        return path;
}
exports.stripTrailingSlash = stripTrailingSlash;
//# sourceMappingURL=Utils.js.map