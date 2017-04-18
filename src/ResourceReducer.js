"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Utils_1 = require("./Utils");
/**
 * Created by YS on 2016/11/4.
 */
var immutable_1 = require("immutable");
function ResourceReducer(rootState, action) {
    var payload, list, index;
    switch (action.type) {
        case "@@resource/get":
            payload = action.payload;
            if (payload.offset === null)
                return Utils_1.deepSetState.apply(void 0, [rootState, immutable_1.List(payload.models)].concat(payload.pathInState));
            else {
                var prev = Utils_1.deepGetState.apply(void 0, [rootState].concat(payload.pathInState));
                if (prev.size < payload.offset)
                    prev = prev.concat(immutable_1.Repeat(null, payload.offset - prev.size));
                return Utils_1.deepSetState.apply(void 0, [rootState, prev.splice.apply(prev, [payload.offset, payload.models.length].concat(payload.models))].concat(payload.pathInState));
            }
        case "@@resource/put":
            payload = action.payload;
            list = Utils_1.deepGetState.apply(void 0, [rootState].concat(payload.pathInState));
            if (!list)
                return Utils_1.deepSetState.apply(void 0, [rootState, immutable_1.List([payload])].concat(payload.pathInState));
            index = list.findIndex(function (entry) { return payload.key(entry) === payload.key(payload.model); });
            if (index < 0)
                return Utils_1.deepSetState.apply(void 0, [rootState, list.push(payload.model)].concat(payload.pathInState));
            if (index >= 0) {
                return Utils_1.deepSetState.apply(void 0, [rootState, list.set(index, payload.model)].concat(payload.pathInState));
            }
            else
                return rootState;
        case "@@resource/post":
            payload = action.payload;
            list = Utils_1.deepGetState.apply(void 0, [rootState].concat(payload.pathInState));
            if (!list)
                list = immutable_1.List([]);
            else if (!list.insert)
                list = immutable_1.List(list);
            return Utils_1.deepSetState.apply(void 0, [rootState, list.insert(0, payload.model)].concat(payload.pathInState));
        case "@@resource/delete":
            payload = action.payload;
            list = Utils_1.deepGetState.apply(void 0, [rootState].concat(payload.pathInState));
            var i = list.findIndex(function (item) {
                return (action.payload.key(item) === action.payload.key(payload.model));
            });
            if (i >= 0)
                list = list.delete(i);
            return Utils_1.deepSetState.apply(void 0, [rootState, list].concat(payload.pathInState));
        default:
            return rootState;
    }
}
exports.ResourceReducer = ResourceReducer;
//# sourceMappingURL=ResourceReducer.js.map