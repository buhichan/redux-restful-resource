export interface ActionPayload<T> {
    pathInState: string[];
    key: (T: T) => string;
}
export declare type ActionTypes = "@@resource/get" | "@@resource/post" | "@@resource/put" | "@@resource/delete";
export interface GetPayload<T> extends ActionPayload<T> {
    models: T[];
    offset: number;
    limit: number;
    total?: number;
}
export interface PutPayload<T> extends ActionPayload<T> {
    model: T;
}
export interface DeletePayload<T> extends ActionPayload<T> {
    model: T;
}
export interface PostPayload<T> extends ActionPayload<T> {
    model: T;
}
export declare function ResourceReducer<T>(rootState: any, action: {
    type: ActionTypes;
    payload: ActionPayload<T>;
}): any;
