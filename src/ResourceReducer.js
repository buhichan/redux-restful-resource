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
/**
 * Created by YS on 2016/11/4.
 */
var immutable_1 = require("immutable");
function ResourceReducer(rootState, action) {
    switch (action.type) {
        case "@@resource/get": {
            var payload = action.payload;
            if (payload.offset === null)
                return Utils_1.deepSetState.apply(void 0, [rootState, immutable_1.List(payload.models)].concat(payload.pathInState));
            else {
                var prev = Utils_1.deepGetState.apply(void 0, [rootState].concat(payload.pathInState));
                if (prev.size < payload.offset)
                    prev = prev.concat(immutable_1.Repeat(null, payload.offset - prev.size));
                return Utils_1.deepSetState.apply(void 0, [rootState, prev.splice.apply(prev, [payload.offset, payload.models.length].concat(payload.models))].concat(payload.pathInState));
            }
        }
        case "@@resource/put": {
            var payload_1 = action.payload;
            var list = Utils_1.deepGetState.apply(void 0, [rootState].concat(payload_1.pathInState));
            if (!list)
                return Utils_1.deepSetState.apply(void 0, [rootState, immutable_1.List([payload_1])].concat(payload_1.pathInState));
            var index = list.findIndex(function (entry) { return payload_1.key(entry) === payload_1.key(payload_1.model); });
            if (index < 0)
                return Utils_1.deepSetState.apply(void 0, [rootState, list.push(payload_1.model)].concat(payload_1.pathInState));
            if (index >= 0) {
                return Utils_1.deepSetState.apply(void 0, [rootState, list.update(index, function (old) {
                        return (__assign({}, old, payload_1.model));
                    })].concat(payload_1.pathInState));
            }
            else
                return rootState;
        }
        case "@@resource/post": {
            var payload = action.payload;
            var list = Utils_1.deepGetState.apply(void 0, [rootState].concat(payload.pathInState));
            if (!list)
                list = immutable_1.List();
            else if (!list.insert)
                list = immutable_1.List(list);
            return Utils_1.deepSetState.apply(void 0, [rootState, list.insert(0, payload.model)].concat(payload.pathInState));
        }
        case "@@resource/delete": {
            var payload_2 = action.payload;
            var list = Utils_1.deepGetState.apply(void 0, [rootState].concat(payload_2.pathInState));
            var i = list.findIndex(function (item) {
                return (action.payload.key(item) === action.payload.key(payload_2.model));
            });
            if (i >= 0)
                list = list.delete(i);
            return Utils_1.deepSetState.apply(void 0, [rootState, list].concat(payload_2.pathInState));
        }
        default:
            return rootState;
    }
}
exports.ResourceReducer = ResourceReducer;
//# sourceMappingURL=ResourceReducer.js.map