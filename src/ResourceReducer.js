"use strict";
exports.__esModule = true;
var Utils_1 = require("./Utils");
/**
 * Created by YS on 2016/11/4.
 */
var immutable_1 = require("immutable");
function ResourceReducer(rootState, action) {
    var payload, list, index;
    switch (action.type) {
        case "@@resource/get":
            payload = action.value;
            if (payload.offset === null)
                return Utils_1.deepSetState.apply(void 0, [rootState, immutable_1.List(payload.models)].concat(payload.modelPath));
            else {
                var prev = Utils_1.deepGetState.apply(void 0, [rootState].concat(payload.modelPath));
                if (prev.size < payload.offset)
                    prev = prev.concat(immutable_1.Repeat(null, payload.offset - prev.size));
                return Utils_1.deepSetState.apply(void 0, [rootState, prev.splice.apply(prev, [payload.offset, payload.models.length].concat(payload.models))].concat(payload.modelPath));
            }
        case "@@resource/put":
            payload = action.value;
            list = Utils_1.deepGetState.apply(void 0, [rootState].concat(payload.modelPath));
            if (!list)
                return Utils_1.deepSetState.apply(void 0, [rootState, immutable_1.List([payload])].concat(payload.modelPath));
            index = list.findIndex(function (entry) { return payload.key(entry) === payload.key(payload.model); });
            if (index < 0)
                return Utils_1.deepSetState.apply(void 0, [rootState, list.push(payload.model)].concat(payload.modelPath));
            if (index >= 0) {
                return Utils_1.deepSetState.apply(void 0, [rootState, list.set(index, payload.model)].concat(payload.modelPath));
            }
            else
                return rootState;
        case "@@resource/post":
            payload = action.value;
            list = Utils_1.deepGetState.apply(void 0, [rootState].concat(payload.modelPath));
            if (!list)
                list = immutable_1.List([]);
            else if (!list.insert)
                list = immutable_1.List(list);
            return Utils_1.deepSetState.apply(void 0, [rootState, list.insert(0, payload.model)].concat(payload.modelPath));
        case "@@resource/delete":
            payload = action.value;
            list = Utils_1.deepGetState.apply(void 0, [rootState].concat(payload.modelPath));
            var i = list.findIndex(function (item) {
                return (action.value.key(item) === action.value.key(payload.model));
            });
            if (i >= 0)
                list = list["delete"](i);
            return Utils_1.deepSetState.apply(void 0, [rootState, list].concat(payload.modelPath));
        default:
            return rootState;
    }
}
exports.ResourceReducer = ResourceReducer;
