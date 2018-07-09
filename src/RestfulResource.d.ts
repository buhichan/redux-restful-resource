import { ActionDefinition } from "./Action";
export interface Resource<Model> {
    get(): Promise<Model[]>;
    get(id: any): Promise<Model>;
    post(model: Partial<Model>): Promise<Partial<Model>>;
    put(model: Partial<Model>): Promise<Partial<Model>>;
    batch?(): Promise<any>;
    head?(): Promise<any>;
    delete(model: Partial<Model>): Promise<boolean>;
    withQuery(query: {
        [key: string]: string;
    }): this;
}
export declare type ActionName<ExtraActions> = string | Extract<keyof ExtraActions, string>;
export interface RestfulResourceOptions<Model, Actions> {
    baseUrl?: string;
    pathInState: string[];
    dispatch: (action: any) => void;
    getID?: (Model: Partial<Model>) => string | number;
    fetch?: typeof window.fetch;
    getDataFromResponse?: (res: any, actionName: ActionName<Actions>) => any;
    getOffsetFromResponse?: (res: any) => number;
    actions?: (ActionDefinition<any> & {
        key: keyof Actions;
    })[];
    overrideMethod?: {
        [key: string]: Function;
    };
    requestInit?: RequestInit;
    /**
     * whether to save the result of get() when withQuery() is used; default to false;
     */
    saveGetAllWhenFilterPresent?: boolean;
    /**
     * whether to clear query after successful response, default to true;
     */
    clearQueryAfterResponse?: boolean;
}
export declare type ActionInstance = (data?: any, requestInit?: RequestInit) => Promise<any>;
export declare class RestfulResource<Model, Actions extends {
    [actionName: string]: ActionInstance;
}> implements Resource<Model> {
    options: Required<RestfulResourceOptions<Model, Actions>>;
    getBaseUrl: () => string;
    query: {
        [key: string]: string;
    } | null;
    actions: Actions;
    constructor(options: RestfulResourceOptions<Model, Actions>);
    withQuery: (query: {
        [key: string]: string;
    }) => this;
    afterResponse: () => void;
    isQueryPresent(): number | null;
    get: Resource<Model>['get'];
    delete: Resource<Model>['delete'];
    put: Resource<Model>['put'];
    post: Resource<Model>['post'];
    batch: () => Promise<never>;
    head: () => Promise<never>;
    addModelAction(model: Model): {
        type: string;
        payload: {
            pathInState: string[];
            key: (Model: Partial<Model>) => import("../../../../../../Users/buhi/Documents/js_projects/redux-restful-resource/src/Utils").KeyPath;
            model: Model;
        };
    };
    deleteModelAction(model: Partial<Model>): {
        type: string;
        payload: {
            pathInState: string[];
            key: (Model: Partial<Model>) => import("../../../../../../Users/buhi/Documents/js_projects/redux-restful-resource/src/Utils").KeyPath;
            model: Partial<Model>;
        };
    };
    updateModelAction(model: Partial<Model>): {
        type: string;
        payload: {
            pathInState: string[];
            key: (Model: Partial<Model>) => import("../../../../../../Users/buhi/Documents/js_projects/redux-restful-resource/src/Utils").KeyPath;
            model: Partial<Model>;
        };
    };
    setAllModelsAction(models: Model[], offset?: number): {
        type: string;
        payload: {
            pathInState: string[];
            key: (Model: Partial<Model>) => import("../../../../../../Users/buhi/Documents/js_projects/redux-restful-resource/src/Utils").KeyPath;
            models: Model[];
            offset: number | null;
        };
    };
}
