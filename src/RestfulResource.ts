/**
 * Created by YS on 2016/11/4.
 */
"use strict";
import {RestfulActionFactory,ActionDefinition} from "./Action"
import {buildQuery, fillParametersInPath} from "./Utils";
import { stripTrailingSlash } from "../index";

interface ResourceFilter{
    offset:number,
    limit:number,
    total?:number,
    query:{ [key:string]:string }
}

export interface Resource<Model>{
    get():Promise<Model[]>,
    get(id):Promise<Model>,
    post(model:Model):Promise<Model>,
    put(model:Model):Promise<Model>,
    batch?()
    head?()
    delete(model:Model):Promise<boolean>,
    withQuery(query:{[key:string]:string}):Resource<Model>
}

export type ActionName<ExtraActions> = "get"|"put"|"post"|"delete" | keyof ExtraActions;

export interface RestfulResourceOptions<Model,Actions>{
    baseUrl?:string,
    pathInState:string[],
    dispatch:(action:any)=>void,
    getID?:(Model:Model)=>string|number,
    fetch?:typeof window.fetch,
    getDataFromResponse?:(res:any,actionName:ActionName<Actions>)=>any,
    getOffsetFromResponse?:(res:any)=>number,
    actions?:(ActionDefinition<any> & {key:keyof Actions})[],
    overrideMethod?: Partial<Resource<Model>>,
    requestInit?:RequestInit,
    /**
     * whether to save the result of get() when withQuery() is used; default to false;
     */
    saveGetAllWhenFilterPresent?:boolean
    /**
     * whether to clear query after requst, default to true;
     */
    clearQueryAfterRequest?:boolean
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
        const {actions,overrideMethod,baseUrl,fetch,getDataFromResponse,getID} = this.options;
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
                        getID
                    })
                });
        }
        //todo: is there a better way?
        ['get','count','delete','post','put','addModelAction','deleteModelAction','updateModelAction','setAllModelsAction'].forEach(method=>{
            this[method] = (overrideMethod[method] || this[method]).bind(this)
        })
    }
    query:{[key:string]:string};
    actions: Actions;
    withQuery(query){
        this.query = query;
        return this;
    }
    afterRequest(){
        if(this.options.clearQueryAfterRequest!==false)
            this.query = null;
    }
    afterResponse(){

    }
    isQueryPresent(){
        return this.query && Object.keys(this.query).length
    }
    get():Promise<Model[]>
    get(id):Promise<Model>
    get(id?):Promise<any>{
        let extraURL = "";
        if(id)
            extraURL += "/"+id;
        extraURL += buildQuery(this.query);
        const res = this.options.fetch(this.getBaseUrl()+extraURL,this.options.requestInit)
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
        this.afterRequest();
        return res;
    }
    delete(data):Promise<boolean>{
        const res = this.options.fetch(this.getBaseUrl()+"/"+this.options.getID(data)+buildQuery(this.query),{
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
        });
        this.afterRequest();
        return res;
    }
    put(data):Promise<Model>{
        const res = this.options.fetch(this.getBaseUrl()+"/"+this.options.getID(data)+buildQuery(this.query), {
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
        this.afterRequest();
        return res;
    }
    post(data):Promise<Model>{
        const res = this.options.fetch(this.getBaseUrl()+buildQuery(this.query),{
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
        this.afterRequest();
        return res;
    }
    batch(){
        throw new Error("Not implemented")
    }
    head(){
        throw new Error("Not implemented")
    }
    public addModelAction(model){
        return {
            type: "@@resource/post",
            payload: {
                pathInState: this.options.pathInState,
                key: this.options.getID,
                model
            }
        };
    }
    public deleteModelAction(model){
        return {
            type: "@@resource/delete",
            payload: {
                pathInState: this.options.pathInState,
                key: this.options.getID,
                model,
            }
        }
    }
    public updateModelAction(model){
        return {
            type: "@@resource/put",
            payload: {
                pathInState: this.options.pathInState,
                key: this.options.getID,
                model
            }
        };
    }
    public setAllModelsAction(models, offset=null){
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