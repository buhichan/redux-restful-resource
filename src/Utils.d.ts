/**
 * Created by YS on 2016/11/4.
 */
export declare type KeyPath = string | number;
export declare function getImmuOrPOJO(target: any, key?: KeyPath): any;
export declare function setImmuOrPOJO(target: any, data: any, key?: KeyPath): any;
export declare function deepGet(obj: any, pathStr: string): any;
export declare function deepGetState(rootState: any, ...keys: KeyPath[]): any;
export declare function deepSetState(state: any, data: any, ...keys: KeyPath[]): any;
export declare function buildQuery(params: {
    [id: string]: any;
} | null): string;
export declare function fillParametersInPath(path: string, params: {
    [paramName: string]: any;
} | null): string;
export declare function stripTrailingSlash(path: string): string;
