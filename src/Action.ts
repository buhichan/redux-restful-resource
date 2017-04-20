/**
 * Created by YS on 2016/10/12.
 */
"use strict";

import {buildQuery} from "./Utils"

export interface ActionDefinition<T>{
    key:string,
    path:string,
    method?:string,
    getSearch?(data:T):{[key:string]:string},
    getSearch?(data:T[]):{[key:string]:string},
    getBody?(data:T):any,
    getBody?(data:T[]):any
}

export interface ActionOption<T>{
    baseUrl:string,
    actionDef: ActionDefinition<T>,
    fetch: typeof window.fetch,
    getDataFromResponse:(res:any,actionName?:string)=>T|T[]
    getID
}

export function RestfulActionFactory<T>(option:ActionOption<T>){
    const {actionDef,getDataFromResponse,getID,baseUrl} = option;
    return function RestfulAction(data?,requestInit?:RequestInit) {
        const nextRequestInit:RequestInit = {...requestInit};
        let url = baseUrl +"/" + actionDef.path.replace(/(:\w+)(?=\/|$)/g,function(match){
                return data[match.slice(1)] || ""
            });
        if(actionDef.method)
            nextRequestInit.method = actionDef.method.toUpperCase();
        if(actionDef.getBody && data)
            nextRequestInit.body = JSON.stringify(actionDef.getBody(data));
        if(actionDef.getSearch)
            url += buildQuery(actionDef.getSearch(data));
        return option.fetch(url, nextRequestInit).then(res => res.json()).then(res => {
            return getDataFromResponse(res, actionDef.key);
        });
    };
}