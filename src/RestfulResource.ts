/**
 * Created by YS on 2016/11/4.
 */
"use strict";
import {RestfulActionFactory,ActionDefinition} from "./Action"
import {buildQuery, fillParametersInPath} from "./Utils";
import { stripTrailingSlash } from "../index";

export interface Resource<Model> {
    get():Promise<Model[]>,
    get(id:any):Promise<Model>,
    post(model:Partial<Model>):Promise<Partial<Model>>,
    put(model:Partial<Model>):Promise<Partial<Model>>,
    batch?():Promise<any>
    head?():Promise<any>
    delete(model:Partial<Model>):Promise<boolean>,
    withQuery(query:{[key:string]:string}):this
}

export type ActionName<ExtraActions> = "get"|"put"|"post"|"delete" | keyof ExtraActions;

export interface RestfulResourceOptions<Model,Actions>{
    baseUrl?:string,
    pathInState:string[],
    dispatch:(action:any)=>void,
    getID?:(Model:Partial<Model>)=>string|number,
    fetch?:typeof window.fetch,
    getDataFromResponse?:(res:any,actionName:ActionName<Actions>)=>any,
    getOffsetFromResponse?:(res:any)=>number,
    actions?:(ActionDefinition<any> & {key:keyof Actions})[],
    overrideMethod?: {
        [key:string]:Function
    },
    requestInit?:RequestInit,
    /**
     * whether to save the result of get() when withQuery() is used; default to false;
     */
    saveGetAllWhenFilterPresent?:boolean
    /**
     * whether to clear query after successful response, default to true;
     */
    clearQueryAfterResponse?:boolean
}

const defaultOptions:Partial<RestfulResourceOptions<any,any>> = {
    baseUrl:"/",
    fetch:window.fetch.bind(window),
    actions:[],
    overrideMethod:{},
    getID:m=>m['id'],
    getDataFromResponse:x=>x,
    requestInit:{}
};

export type ActionInstance = (data?:any,requestInit?:RequestInit)=>Promise<any>;

export class RestfulResource<Model,Actions extends {[actionName:string]:ActionInstance}> implements Resource<Model>{
    options:RestfulResourceOptions<Model,Actions>;
    getBaseUrl:()=>string;
    constructor(options:RestfulResourceOptions<Model,Actions>) {
        this.options = {
            ...defaultOptions,
            ...options
        };
        this.options.baseUrl = stripTrailingSlash(this.options.baseUrl)
        const {actions,overrideMethod,baseUrl,fetch,getDataFromResponse} = this.options;
        this.getBaseUrl = baseUrl.includes(":")?()=>{
            return fillParametersInPath(baseUrl,this.query)
        }:()=>baseUrl
        if(actions) {
            this.actions = {} as any;
            if(actions instanceof Array)
                actions.forEach(action=>{
                    this.actions[action.key] = RestfulActionFactory({
                        baseUrl,
                        actionDef:action,
                        fetch,
                        getDataFromResponse,
                    })
                });
        }
        //todo: is there a better way?
        Object.keys(overrideMethod).forEach(method=>{
            if(method in overrideMethod)
                Object.defineProperty(this,method,overrideMethod[method].bind(this))
        })
    }
    query:{[key:string]:string};
    actions: Actions;
    withQuery=(query:{[key:string]:string})=>{
        this.query = query;
        return this;
    }
    afterResponse=()=>{
        if(this.options.clearQueryAfterResponse!==false)
            this.query = null;
    }
    isQueryPresent(){
        return this.query && Object.keys(this.query).length
    }
    get:Resource<Model>['get']=(id?:any)=>{
        let extraURL = "";
        if(id)
            extraURL += "/"+id;
        extraURL += buildQuery(this.query);
        return this.options.fetch(this.getBaseUrl()+extraURL,this.options.requestInit)
            .then(res=>res.json()).then((res)=>{
                const models = this.options.getDataFromResponse(res,'get') as any;
                if(this.options.saveGetAllWhenFilterPresent || !this.isQueryPresent()){
                    if (!id) {
                        this.options.dispatch(this.setAllModelsAction(models, this.options.getOffsetFromResponse?this.options.getOffsetFromResponse(res):null));
                    } else {
                        this.options.dispatch(this.updateModelAction(models));
                    }
                }
                this.afterResponse();
                this.query = null;
                return models;
        });
    }
    delete:Resource<Model>['delete']=(data:Partial<Model>):Promise<boolean>=>{
        return this.options.fetch(this.getBaseUrl()+"/"+this.options.getID(data)+buildQuery(this.query),{
            ...this.options.requestInit,
            method:"DELETE"
        }).then(res=>res.json()).then((res)=>{
            const resData = this.options.getDataFromResponse(res,'delete');
            if(resData) {
                this.options.dispatch(this.deleteModelAction(data));
                this.afterResponse();
                return true;
            }
            return false;
        })
    }
    put:Resource<Model>['put']=(data:Partial<Model>):Promise<Partial<Model>>=>{
        return this.options.fetch(this.getBaseUrl()+"/"+this.options.getID(data)+buildQuery(this.query), {
            ...this.options.requestInit,
            method:"PUT",
            body:JSON.stringify(data)
        }).then(res=>res.json()).then((res)=>{
            const model = this.options.getDataFromResponse(res,'put');
            if(model) {
                this.options.dispatch(this.updateModelAction(typeof model ==='object'?model:data));
            }
            this.afterResponse();
            return model;
        });
    }
    post:Resource<Model>['post']=(data:Partial<Model>):Promise<Partial<Model>>=>{
        return this.options.fetch(this.getBaseUrl()+buildQuery(this.query),{
            ...this.options.requestInit,
            method:"POST",
            body:JSON.stringify(data)
        }).then(res=>res.json()).then((res)=>{
            const model = this.options.getDataFromResponse(res,'post');
            if(model) {
                this.options.dispatch(this.addModelAction(typeof model ==='object'?model:data));
            }
            this.afterResponse();
            return model;
        });
    }
    batch=()=>{
        return Promise.reject("Not implemented")
    }
    head=()=>{
        return Promise.reject("Not implemented")
    }
    public addModelAction(model:Model){
        return {
            type: "@@resource/post",
            payload: {
                pathInState: this.options.pathInState,
                key: this.options.getID,
                model
            }
        };
    }
    public deleteModelAction(model:Partial<Model>){
        return {
            type: "@@resource/delete",
            payload: {
                pathInState: this.options.pathInState,
                key: this.options.getID,
                model,
            }
        }
    }
    public updateModelAction(model:Partial<Model>){
        return {
            type: "@@resource/put",
            payload: {
                pathInState: this.options.pathInState,
                key: this.options.getID,
                model
            }
        };
    }
    public setAllModelsAction(models:Model[],offset:number=null){
        return {
            type: "@@resource/get",
            payload: {
                pathInState: this.options.pathInState,
                key: this.options.getID,
                models,
                offset
            }
        }
    }
}