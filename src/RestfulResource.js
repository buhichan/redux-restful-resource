/**
 * Created by YS on 2016/11/4.
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
var Action_1 = require("./Action");
var Utils_1 = require("./Utils");
var defaultOptions = {
    baseUrl: "/",
    fetch: window.fetch,
    cacheTime: 5000,
    actions: [],
    overrideMethod: {},
    getID: function (m) { return m['id']; },
    getDataFromResponse: function (x) { return x; },
    requestInit: {}
};
var RestfulResource = (function () {
    function RestfulResource(options) {
        var _this = this;
        this.lastGetAll = null;
        var finalOptions = __assign({}, defaultOptions, options);
        this.options = finalOptions;
        var actions = finalOptions.actions, overrideMethod = finalOptions.overrideMethod, baseUrl = finalOptions.baseUrl, fetch = finalOptions.fetch, getDataFromResponse = finalOptions.getDataFromResponse, getID = finalOptions.getID;
        if (actions) {
            this.actions = {};
            if (actions instanceof Array)
                actions.forEach(function (action) {
                    _this.actions[action.key] = Action_1.RestfulActionFactory({
                        baseUrl: baseUrl,
                        actionDef: action,
                        fetch: fetch,
                        getDataFromResponse: getDataFromResponse,
                        getID: getID
                    });
                });
        }
        if (overrideMethod)
            ['get', 'count', 'delete', 'post', 'put'].forEach(function (method) {
                if (overrideMethod[method])
                    _this[method] = overrideMethod[method].bind(_this);
            });
    }
    RestfulResource.prototype.withQuery = function (query) {
        this.query = query;
        return this;
    };
    RestfulResource.prototype.get = function (id) {
        var _this = this;
        if (!id) {
            if (!this.options.cacheTime && this.lastGetAll && Date.now() - this.lastCachedTime < this.options.cacheTime * 1000) {
                return this.lastGetAll;
            }
        }
        this.lastCachedTime = Date.now();
        var pending = this.options.fetch(this.options.baseUrl + (id !== undefined ? ("/" + id) : "") + Utils_1.buildQuery(this.query), this.options.requestInit)
            .then(function (res) { return res.json(); }).then(function (res) {
            var models = _this.options.getDataFromResponse(res, 'get');
            if (!_this.query || !Object.keys(_this.query).length) {
                if (!id) {
                    _this.options.dispatch({
                        type: "@@resource/get",
                        payload: {
                            pathInState: _this.options.pathInState,
                            key: _this.options.getID,
                            models: models,
                            offset: _this.options.getOffsetFromResponse ? _this.options.getOffsetFromResponse(res) : null
                        }
                    });
                }
                else {
                    _this.options.dispatch({
                        type: "@@resource/put",
                        payload: {
                            pathInState: _this.options.pathInState,
                            key: _this.options.getID,
                            model: models
                        }
                    });
                }
            }
            _this.query = null;
            return models;
        }, function (e) {
            _this.lastGetAll = null;
        });
        if (!id && !this.query)
            this.lastGetAll = pending;
        return pending;
    };
    RestfulResource.prototype.delete = function (data) {
        var _this = this;
        return this.options.fetch(this.options.baseUrl + "/" + this.options.getID(data) + Utils_1.buildQuery(this.query), __assign({}, this.options.requestInit, { method: "DELETE" })).then(function (res) { return res.json(); }).then(function (res) {
            if (_this.options.getDataFromResponse(res, 'delete')) {
                _this.options.dispatch({
                    type: "@@resource/delete",
                    payload: {
                        pathInState: _this.options.pathInState,
                        key: _this.options.getID,
                        model: data,
                    }
                });
                _this.markAsDirty();
                _this.query = null;
                return true;
            }
            return false;
        });
    };
    RestfulResource.prototype.put = function (data) {
        var _this = this;
        return this.options.fetch(this.options.baseUrl + "/" + this.options.getID(data) + Utils_1.buildQuery(this.query), __assign({}, this.options.requestInit, { method: "PUT", body: JSON.stringify(data) })).then(function (res) { return res.json(); }).then(function (res) {
            var model = _this.options.getDataFromResponse(res, 'put');
            _this.options.dispatch({
                type: "@@resource/put",
                payload: {
                    pathInState: _this.options.pathInState,
                    key: _this.options.getID,
                    model: model
                }
            });
            _this.markAsDirty();
            _this.query = null;
            return model;
        });
    };
    RestfulResource.prototype.post = function (data) {
        var _this = this;
        return this.options.fetch(this.options.baseUrl + "/" + Utils_1.buildQuery(this.query), __assign({}, this.options.requestInit, { method: "POST", body: JSON.stringify(data) })).then(function (res) { return res.json(); }).then(function (res) {
            var model = _this.options.getDataFromResponse(res, 'post');
            _this.options.dispatch({
                type: "@@resource/post",
                payload: {
                    pathInState: _this.options.pathInState,
                    key: _this.options.getID,
                    model: model
                }
            });
            _this.markAsDirty();
            _this.query = null;
            return model;
        });
    };
    RestfulResource.prototype.markAsDirty = function () {
        this.lastGetAll = null;
        this.lastCachedTime = 0;
    };
    return RestfulResource;
}());
exports.RestfulResource = RestfulResource;
//# sourceMappingURL=RestfulResource.js.map