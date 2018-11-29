/**
 * Created by YS on 2016/10/12.
 */
"use strict";

import {buildSearch, fillParametersInPath} from "./Utils"
import {RestfulResourceOptions} from "./RestfulResource"

export interface ActionDefinition<Args>{
    key:string,
    path:string,
    method?:string,
    getSearch?(data:Args):{[key:string]:string},
    getBody?(data:Args):any,
}

export interface ActionOption<T>{
    baseUrl:string,
    actionDef: ActionDefinition<T>,
    fetch: typeof window.fetch,
    getDataFromResponse:Required<RestfulResourceOptions<T,any>>['getDataFromResponse']
}

export function RestfulActionFactory<T>(option:ActionOption<T>){
    const {actionDef,getDataFromResponse,baseUrl} = option;
    return function RestfulAction(data?:any,requestInit?:RequestInit) {
        const nextRequestInit:RequestInit = {...requestInit};
        let url = fillParametersInPath(baseUrl+"/"+actionDef.path,data)
        if(actionDef.method)
            nextRequestInit.method = actionDef.method.toUpperCase();
        if(actionDef.getBody && data)
            nextRequestInit.body = JSON.stringify(actionDef.getBody(data));
        if(actionDef.getSearch)
            url += buildSearch(actionDef.getSearch(data));
        return option.fetch(url, nextRequestInit).then(res => res.json()).then(res => {
            return getDataFromResponse(res, actionDef.key);
        });
    };
}