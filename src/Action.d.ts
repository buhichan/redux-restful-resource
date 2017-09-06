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
    getDataFromResponse: (res: any, actionName?: string) => T | T[];
    getID: any;
}
export declare function RestfulActionFactory<T>(option: ActionOption<T>): (data?: any, requestInit?: RequestInit) => Promise<T | T[]>;
