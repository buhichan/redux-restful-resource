import { ActionDefinition } from "./Action";
export declare type ActionName<ExtraActions> = string | Extract<keyof ExtraActions, string>;
export interface RestfulResourceOptions<Model, Actions> {
    baseUrl?: string;
    pathInState: string[];
    dispatch: (action: any) => void;
    getID?: (Model: Partial<Model>) => any;
    fetch?: typeof window.fetch;
    getDataFromResponse?: (res: any, actionName: ActionName<Actions>) => any;
    actions?: (ActionDefinition<any> & {
        key: keyof Actions;
    })[];
    requestInit?: RequestInit;
}
declare type Query = {
    [name: string]: string;
};
export declare type ActionInstance = (data?: any, requestInit?: RequestInit) => Promise<any>;
export declare function RestfulResource<Model, Actions extends {
    [actionName: string]: ActionInstance;
}>(resourceOptions: RestfulResourceOptions<Model, Actions>): {
    get: (id?: any, query?: Query | undefined) => Promise<any>;
    delete: (data: Partial<Model>, query?: Query | undefined) => Promise<boolean>;
    put: (data: Partial<Model>, query?: Query | undefined) => Promise<Partial<Model>>;
    post: (data: Partial<Model>, query?: Query | undefined) => Promise<Partial<Model>>;
    actions: boolean | Actions;
};
export {};
