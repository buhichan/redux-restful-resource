/**
 * Created by YS on 2016/11/4.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Action_1 = require("./Action");
var Utils_1 = require("./Utils");
var ResourceReducer_1 = require("./ResourceReducer");
var defaultOptions = {
    baseUrl: "/",
    fetch: typeof window !== 'undefined' && 'fetch' in window ? window.fetch.bind(window) : undefined,
    actions: [],
    getID: function (m) { return m['id']; },
    getDataFromResponse: function (x) { return x; },
    requestInit: {}
};
function RestfulResource(resourceOptions) {
    var options = tslib_1.__assign({}, defaultOptions, resourceOptions);
    var baseUrl = Utils_1.stripTrailingSlash(options.baseUrl);
    var fetch = options.fetch;
    var actions = (options.actions instanceof Array) && options.actions.reduce(function (actions, action) {
        actions[action.key] = Action_1.RestfulActionFactory({
            baseUrl: baseUrl,
            actionDef: action,
            fetch: fetch,
            getDataFromResponse: options.getDataFromResponse,
        });
        return actions;
    }, {});
    var getBaseUrl = function (query) {
        return baseUrl.includes(":") ? Utils_1.fillParametersInPath(baseUrl, query) : baseUrl;
    };
    function addModelAction(model) {
        return ResourceReducer_1.postReducer({
            pathInState: options.pathInState,
            key: options.getID,
            model: model
        });
    }
    function deleteModelAction(model) {
        return ResourceReducer_1.deleteReducer({
            pathInState: options.pathInState,
            key: options.getID,
            model: model,
        });
    }
    function updateModelAction(model) {
        return ResourceReducer_1.putReducer({
            pathInState: options.pathInState,
            key: options.getID,
            model: model
        });
    }
    function setAllModelsAction(models) {
        return ResourceReducer_1.getReducer({
            pathInState: options.pathInState,
            key: options.getID,
            models: models,
        });
    }
    return {
        get: function (id, query) {
            var extraURL = "";
            if (id)
                extraURL += "/" + id;
            extraURL += Utils_1.buildSearch(query);
            return options.fetch(getBaseUrl(query) + extraURL, options.requestInit)
                .then(function (res) { return res.json(); }).then(function (res) {
                var models = options.getDataFromResponse(res, 'get');
                if (!id) {
                    options.dispatch(setAllModelsAction(models));
                }
                else {
                    options.dispatch(updateModelAction(models));
                }
                return models;
            });
        },
        delete: function (data, query) {
            return options.fetch(getBaseUrl(query) + "/" + options.getID(data) + Utils_1.buildSearch(query), tslib_1.__assign({}, options.requestInit, { method: "DELETE" })).then(function (res) { return res.json(); }).then(function (res) {
                var resData = options.getDataFromResponse(res, 'delete');
                if (resData) {
                    options.dispatch(deleteModelAction(data));
                    return true;
                }
                return false;
            });
        },
        put: function (data, query) {
            return options.fetch(getBaseUrl(query) + "/" + options.getID(data) + Utils_1.buildSearch(query), tslib_1.__assign({}, options.requestInit, { method: "PUT", body: JSON.stringify(data) })).then(function (res) { return res.json(); }).then(function (res) {
                var model = options.getDataFromResponse(res, 'put');
                if (model) {
                    options.dispatch(updateModelAction(typeof model === 'object' ? model : data));
                }
                return model;
            });
        },
        post: function (data, query) {
            return options.fetch(getBaseUrl(query) + Utils_1.buildSearch(query), tslib_1.__assign({}, options.requestInit, { method: "POST", body: JSON.stringify(data) })).then(function (res) { return res.json(); }).then(function (res) {
                var model = options.getDataFromResponse(res, 'post');
                if (model) {
                    options.dispatch(addModelAction(typeof model === 'object' ? model : data));
                }
                return model;
            });
        },
        actions: actions
    };
}
exports.RestfulResource = RestfulResource;
//# sourceMappingURL=RestfulResource.js.map