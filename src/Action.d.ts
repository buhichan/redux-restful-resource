export interface ActionDefinition<T> {
    key: string;
    path: string;
    method?: string;
    getSearch?(data: T): {
        [key: string]: string;
    };
    getSearch?(data: T[]): {
        [key: string]: string;
    };
    getBody?(data: T): any;
    getBody?(data: T[]): any;
    cacheTime?: number;
}
export interface ActionOption<T> {
    baseUrl: string;
    actionDef: ActionDefinition<T>;
    fetch: typeof window.fetch;
    getDataFromResponse: (res: any, actionName?: string) => T | T[];
    getID: any;
}
export declare function RestfulActionFactory<T>(option: ActionOption<T>): (data?: any, requestInit?: RequestInit) => any;
