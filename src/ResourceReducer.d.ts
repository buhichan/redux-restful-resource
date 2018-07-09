export interface ActionPayload<T> {
    pathInState: string[];
    key: (T: T) => string;
}
export declare type ActionTypes = "@@resource/get" | "@@resource/post" | "@@resource/put" | "@@resource/delete";
export declare function ResourceReducer<T>(rootState: any, action: {
    type: ActionTypes;
    payload: ActionPayload<T>;
}): any;
