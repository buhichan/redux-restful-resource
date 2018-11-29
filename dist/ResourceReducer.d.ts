export interface ActionPayload<T> {
    pathInState: string[];
    key: (T: T) => any;
}
export declare type ActionTypes = "@@resource/get" | "@@resource/post" | "@@resource/put" | "@@resource/delete";
declare type GetPayload<T> = ActionPayload<T> & {
    models: T[];
};
declare type PutPayload<T> = ActionPayload<T> & {
    model: T;
};
declare type DeletePayload<T> = ActionPayload<T> & {
    model: T;
};
declare type PostPayload<T> = ActionPayload<T> & {
    model: T;
};
export declare const getReducer: <T>(payload: GetPayload<T>) => (rootState: any) => any;
export declare const putReducer: <T>(payload: PutPayload<T>) => (rootState: any) => any;
export declare const postReducer: <T>(payload: PostPayload<T>) => (rootState: any) => any;
export declare const deleteReducer: <T>(payload: DeletePayload<T>) => (rootState: any) => any;
export {};
