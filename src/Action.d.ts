import { RestfulResourceOptions } from "./RestfulResource";
export interface ActionDefinition<Args> {
    key: string;
    path: string;
    method?: string;
    getSearch?(data: Args): {
        [key: string]: string;
    };
    getSearch?(data: Args): {
        [key: string]: string;
    };
    getBody?(data: Args): any;
    getBody?(data: Args): any;
}
export interface ActionOption<T> {
    baseUrl: string;
    actionDef: ActionDefinition<T>;
    fetch: typeof window.fetch;
    getDataFromResponse: Required<RestfulResourceOptions<T, any>>['getDataFromResponse'];
}
export declare function RestfulActionFactory<T>(option: ActionOption<T>): (data?: any, requestInit?: RequestInit | undefined) => Promise<any>;
