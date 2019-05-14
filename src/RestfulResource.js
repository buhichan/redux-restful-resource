/**
 * Created by YS on 2016/11/4.
 */
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var Action_1 = require("./Action");
var Utils_1 = require("./Utils");
var defaultOptions = {
    baseUrl: "/",
    fetch: typeof window !== 'undefined' && 'fetch' in window ? window.fetch.bind(window) : undefined,
    actions: [],
    overrideMethod: {},
    getID: function (m) { return m['id']; },
    getDataFromResponse: function (x) { return x; },
    requestInit: {}
};
var RestfulResource = /** @class */ (function () {
    function RestfulResource(options) {
        var _this = this;
        this.query = null;
        this.actions = {};
        this.withQuery = function (query) {
            _this.query = query;
            return _this;
        };
        this.afterResponse = function () {
            if (_this.options.clearQueryAfterResponse !== false)
                _this.query = null;
        };
        this.get = function (id) {
            var extraURL = "";
            if (id)
                extraURL += "/" + id;
            extraURL += Utils_1.buildQuery(_this.query);
            return _this.options.fetch(_this.getBaseUrl() + extraURL, _this.options.requestInit)
                .then(function (res) { return res.json(); }).then(function (res) {
                var models = _this.options.getDataFromResponse(res, 'get');
                if (_this.options.saveGetAllWhenFilterPresent || !_this.isQueryPresent()) {
                    if (!id) {
                        _this.options.dispatch(_this.setAllModelsAction(models, _this.options.getOffsetFromResponse ? _this.options.getOffsetFromResponse(res) : undefined));
                    }
                    else {
                        _this.options.dispatch(_this.updateModelAction(models));
                    }
                }
                _this.afterResponse();
                _this.query = null;
                return models;
            });
        };
        this.delete = function (data) {
            return _this.options.fetch(_this.getBaseUrl() + "/" + _this.options.getID(data) + Utils_1.buildQuery(_this.query), __assign({}, _this.options.requestInit, { method: "DELETE" })).then(function (res) { return res.json(); }).then(function (res) {
                var resData = _this.options.getDataFromResponse(res, 'delete');
                if (resData) {
                    _this.options.dispatch(_this.deleteModelAction(data));
                    _this.afterResponse();
                    return true;
                }
                return false;
            });
        };
        this.put = function (data) {
            return _this.options.fetch(_this.getBaseUrl() + "/" + _this.options.getID(data) + Utils_1.buildQuery(_this.query), __assign({}, _this.options.requestInit, { method: "PUT", body: JSON.stringify(data) })).then(function (res) { return res.json(); }).then(function (res) {
                var model = _this.options.getDataFromResponse(res, 'put');
                if (model) {
                    _this.options.dispatch(_this.updateModelAction(typeof model === 'object' ? model : data));
                }
                _this.afterResponse();
                return model;
            });
        };
        this.post = function (data) {
            return _this.options.fetch(_this.getBaseUrl() + Utils_1.buildQuery(_this.query), __assign({}, _this.options.requestInit, { method: "POST", body: JSON.stringify(data) })).then(function (res) { return res.json(); }).then(function (res) {
                var model = _this.options.getDataFromResponse(res, 'post');
                if (model) {
                    _this.options.dispatch(_this.addModelAction(typeof model === 'object' ? model : data));
                }
                _this.afterResponse();
                return model;
            });
        };
        this.batch = function () {
            return Promise.reject("Not implemented");
        };
        this.head = function () {
            return Promise.reject("Not implemented");
        };
        this.options = __assign({}, defaultOptions, options);
        this.options.baseUrl = Utils_1.stripTrailingSlash(this.options.baseUrl);
        var _a = this.options, actions = _a.actions, overrideMethod = _a.overrideMethod, baseUrl = _a.baseUrl, fetch = _a.fetch;
        this.getBaseUrl = baseUrl.includes(":") ? function () {
            return Utils_1.fillParametersInPath(baseUrl, _this.query);
        } : function () { return baseUrl; };
        if (actions) {
            if (actions instanceof Array)
                actions.forEach(function (action) {
                    _this.actions[action.key] = Action_1.RestfulActionFactory({
                        baseUrl: baseUrl,
                        actionDef: action,
                        fetch: fetch,
                        getDataFromResponse: _this.options.getDataFromResponse,
                    });
                });
        }
        //todo: is there a better way?
        Object.keys(overrideMethod).forEach(function (method) {
            if (method in overrideMethod)
                Object.defineProperty(_this, method, overrideMethod[method].bind(_this));
        });
    }
    RestfulResource.prototype.isQueryPresent = function () {
        return this.query && Object.keys(this.query).length;
    };
    RestfulResource.prototype.addModelAction = function (model) {
        return {
            type: "@@resource/post",
            payload: {
                pathInState: this.options.pathInState,
                key: this.options.getID,
                model: model
            }
        };
    };
    RestfulResource.prototype.deleteModelAction = function (model) {
        return {
            type: "@@resource/delete",
            payload: {
                pathInState: this.options.pathInState,
                key: this.options.getID,
                model: model,
            }
        };
    };
    RestfulResource.prototype.updateModelAction = function (model) {
        return {
            type: "@@resource/put",
            payload: {
                pathInState: this.options.pathInState,
                key: this.options.getID,
                model: model
            }
        };
    };
    RestfulResource.prototype.setAllModelsAction = function (models, offset) {
        return {
            type: "@@resource/get",
            payload: {
                pathInState: this.options.pathInState,
                key: this.options.getID,
                models: models,
                offset: offset ? offset : null
            }
        };
    };
    return RestfulResource;
}());
exports.RestfulResource = RestfulResource;
//# sourceMappingURL=RestfulResource.js.map