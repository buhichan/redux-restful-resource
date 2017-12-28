import { ActionDefinition } from "./Action";
import { Action } from "redux";
export interface Resource<Model> {
    get(): Promise<Model[]>;
    get(id: any): Promise<Model>;
    post(model: Model): Promise<Model>;
    put(model: Model): Promise<Model>;
    batch?(): any;
    head?(): any;
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
    getDataFromResponse?: (res: any, actionName: ActionName<Actions>) => any;
    getOffsetFromResponse?: (res: any) => number;
    actions?: (ActionDefinition<any> & {
        key: keyof Actions;
    })[];
    overrideMethod?: Partial<Resource<Model>>;
    requestInit?: RequestInit;
    /**
     * whether to save the result of get() when withQuery() is used; default to false;
     */
    saveGetAllWhenFilterPresent?: boolean;
    /**
     * whether to clear query after requst, default to true;
     */
    clearQueryAfterRequest?: boolean;
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
    withQuery(query: any): this;
    afterRequest(): void;
    afterResponse(): void;
    isQueryPresent(): number;
    getBaseUrl: () => any;
    get(): Promise<Model[]>;
    get(id: any): Promise<Model>;
    delete(data: any): Promise<boolean>;
    put(data: any): Promise<Model>;
    post(data: any): Promise<Model>;
    batch(): void;
    head(): void;
    addModelAction(model: any): {
        type: string;
        payload: {
            pathInState: string[];
            key: (Model: Model) => string | number;
            model: any;
        };
    };
    deleteModelAction(model: any): {
        type: string;
        payload: {
            pathInState: string[];
            key: (Model: Model) => string | number;
            model: any;
        };
    };
    updateModelAction(model: any): {
        type: string;
        payload: {
            pathInState: string[];
            key: (Model: Model) => string | number;
            model: any;
        };
    };
    setAllModelsAction(models: any, offset?: any): {
        type: string;
        payload: {
            pathInState: string[];
            key: (Model: Model) => string | number;
            models: any;
            offset: any;
        };
    };
}
