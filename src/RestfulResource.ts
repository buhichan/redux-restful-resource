/**
 * Created by YS on 2016/11/4.
 */
"use strict";
import {RestfulActionFactory,ActionDefinition} from "./Action"
import {buildSearch, stripTrailingSlash, fillParametersInPath} from "./Utils";
import { postReducer, deleteReducer, putReducer, getReducer } from "./ResourceReducer";

export type ActionName<ExtraActions> = string | Extract<keyof ExtraActions,string>;

export interface RestfulResourceOptions<Model,Actions>{
    baseUrl?:string,
    pathInState:string[],
    dispatch:(action:any)=>void,
    getID?:(Model:Partial<Model>)=>any,
    fetch?:typeof window.fetch,
    getDataFromResponse?:(res:any,actionName:ActionName<Actions>)=>any,
    actions?:(ActionDefinition<any> & {key:keyof Actions})[],
    requestInit?:RequestInit,
}

const defaultOptions:Partial<RestfulResourceOptions<any,any>> = {
    baseUrl:"/",
    fetch:typeof window !== 'undefined' && 'fetch' in window ? window.fetch.bind(window):undefined,
    actions:[],
    getID:m=>m['id'],
    getDataFromResponse:x=>x,
    requestInit:{}
};

type Query = {[name:string]:string}
export type ActionInstance = (data?:any,requestInit?:RequestInit)=>Promise<any>;

export function RestfulResource<Model,Actions extends {[actionName:string]:ActionInstance}>(resourceOptions:RestfulResourceOptions<Model,Actions>){
    const options = {
        ...defaultOptions,
        ...resourceOptions
    } as Required<RestfulResourceOptions<Model,Actions>>
    const baseUrl = stripTrailingSlash(options.baseUrl)
    const {fetch} = options;
    const actions:Actions = (options.actions instanceof Array) ? options.actions.reduce((actions,action)=>{
        actions[action.key] = RestfulActionFactory({
            baseUrl,
            actionDef:action,
            fetch,
            getDataFromResponse:options.getDataFromResponse,
        })
        return actions
    },{} as Actions) : {} as Actions

    const getBaseUrl= (query?:Query)=>{
        return baseUrl.includes(":")?fillParametersInPath(baseUrl,query):baseUrl
    }

    function addModelAction(model:Model){
        return postReducer({
            pathInState: options.pathInState,
            key: options.getID,
            model
        })
    }
    function deleteModelAction(model:Partial<Model>){
        return deleteReducer({
            pathInState: options.pathInState,
            key: options.getID,
            model,
        })
    }
    function updateModelAction(model:Partial<Model>){
        return putReducer({
            pathInState: options.pathInState,
            key: options.getID,
            model
        })
    }
    function setAllModelsAction(models:Model[]){
        return getReducer({
            pathInState: options.pathInState,
            key: options.getID,
            models,
        })
    }
    return {
        get:(id?:any,query?:Query)=>{
            let extraURL = "";
            if(id)
                extraURL += "/"+id;
            extraURL += buildSearch(query);
            return options.fetch(getBaseUrl(query)+extraURL,options.requestInit)
                .then(res=>res.json()).then((res)=>{
                    const models = options.getDataFromResponse(res,'get') as any;
                    if (!id) {
                        options.dispatch(
                            setAllModelsAction(
                                models
                            )
                        );
                    } else {
                        options.dispatch(updateModelAction(models));
                    }
                    return models;
            });
        },
        delete:(data:Partial<Model>,query?:Query):Promise<boolean>=>{
            return options.fetch(getBaseUrl(query)+"/"+options.getID(data)+buildSearch(query),{
                ...options.requestInit,
                method:"DELETE"
            }).then(res=>res.json()).then((res)=>{
                const resData = options.getDataFromResponse(res,'delete');
                if(resData) {
                    options.dispatch(deleteModelAction(data));
                    return true;
                }
                return false;
            })
        },
        put:(data:Partial<Model>,query?:Query):Promise<Partial<Model>>=>{
            return options.fetch(getBaseUrl(query)+"/"+options.getID(data)+buildSearch(query), {
                ...options.requestInit,
                method:"PUT",
                body:JSON.stringify(data)
            }).then(res=>res.json()).then((res)=>{
                const model = options.getDataFromResponse(res,'put');
                if(model) {
                    options.dispatch(updateModelAction(typeof model ==='object'?model:data));
                }
                return model;
            });
        },
        post:(data:Partial<Model>,query?:Query):Promise<Partial<Model>>=>{
            return options.fetch(getBaseUrl(query)+buildSearch(query),{
                ...options.requestInit,
                method:"POST",
                body:JSON.stringify(data)
            }).then(res=>res.json()).then((res)=>{
                const model = options.getDataFromResponse(res,'post');
                if(model) {
                    options.dispatch(addModelAction(typeof model ==='object'?model:data));
                }
                return model;
            });
        },
        actions
    }
}