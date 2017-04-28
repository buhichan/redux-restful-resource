import { ActionDefinition } from "./Action";
import { Action } from "redux";
export interface Resource<Model> {
    get(): Promise<Model[]>;
    get(id: any): Promise<Model>;
    post(model: Model): Promise<Model>;
    put(model: Model): Promise<Model>;
    delete(model: Model): Promise<boolean>;
    withQuery(query: {
        [key: string]: string;
    }): Resource<Model>;
}
export declare type ActionName<ExtraActions> = "get" | "put" | "post" | "delete" | keyof ExtraActions;
export interface RestfulResourceOptions<Model, Actions> {
    baseUrl?: string;
    pathInState: string[];
    dispatch: (action: Action & {
        payload: any;
    }) => void;
    getID?: (Model: Model) => string | number;
    fetch?: typeof window.fetch;
    getDataFromResponse?: (res: any, actionName: ActionName<Actions>) => Model[] | Model;
    getOffsetFromResponse?: (res: any) => number;
    actions?: (ActionDefinition<Model> & {
        key: keyof Actions;
    })[];
    overrideMethod?: Partial<Resource<Model>>;
    cacheTime?: number;
    requestInit?: RequestInit;
}
export declare type ActionInstance = (data?: any, requestInit?: RequestInit) => Promise<any>;
export declare class RestfulResource<Model, Actions extends {
    [actionName: string]: ActionInstance;
}> implements Resource<Model> {
    options: RestfulResourceOptions<Model, Actions>;
    constructor(options: RestfulResourceOptions<Model, Actions>);
    query: {
        [key: string]: string;
    };
    actions: Actions;
    private lastGetAll;
    private lastCachedTime;
    withQuery(query: any): this;
    get(): Promise<Model[]>;
    get(id: any): Promise<Model>;
    delete(data: any): Promise<boolean>;
    put(data: any): Promise<Model>;
    post(data: any): Promise<Model>;
    private markAsDirty();
}
