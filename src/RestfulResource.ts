/**
 * Created by YS on 2016/11/4.
 */
"use strict";
import {RestfulActionFactory,ActionDefinition} from "./Action"
import {buildQuery} from "./Utils";
import {Action, Dispatch} from "redux";

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
    delete(model:Model):Promise<boolean>,
    withQuery(query:{[key:string]:string}):Resource<Model>
}

export type ActionName<ExtraActions> = "get"|"put"|"post"|"delete" | keyof ExtraActions;

export interface RestfulResourceOptions<Model,Actions>{
    baseUrl?:string,
    pathInState:string[],
    dispatch:(action:Action&{payload:any})=>void,
    getID?:(Model:Model)=>string|number,
    fetch?:typeof window.fetch,
    getDataFromResponse?:(res:any,actionName:ActionName<Actions>)=>any,
    getOffsetFromResponse?:(res:any)=>number,
    actions?:(ActionDefinition<Model> & {key:keyof Actions})[],
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
    constructor(options:RestfulResourceOptions<Model,Actions>) {
        const finalOptions:RestfulResourceOptions<Model,Actions> = {...defaultOptions,...options} as any;
        this.options = finalOptions;
        const {actions,overrideMethod,baseUrl,fetch,getDataFromResponse,getID} = finalOptions;
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
        if(overrideMethod)
            ['get','count','delete','post','put'].forEach(method=>{
                if(overrideMethod[method])
                    this[method] = overrideMethod[method].bind(this)
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
    isQueryPresent(){
        return !this.query || !Object.keys(this.query).length
    }
    get():Promise<Model[]>
    get(id):Promise<Model>
    get(id?):Promise<any>{
        return this.options.fetch(this.options.baseUrl+(id!==undefined?("/"+id):"")+buildQuery(this.query),this.options.requestInit)
            .then(res=>res.json()).then((res)=>{
                const models = this.options.getDataFromResponse(res,'get') as any;
                if(this.options.saveGetAllWhenFilterPresent || !this.isQueryPresent()){
                    if (!id) {
                        this.options.dispatch(this.setAllModelsAction(models, this.options.getOffsetFromResponse?this.options.getOffsetFromResponse(res):null));
                    } else {
                        this.options.dispatch(this.updateModelAction(models));
                    }
                }
                this.afterRequest();
                this.query = null;
                return models;
        });
    }
    delete(data):Promise<boolean>{
        return this.options.fetch(this.options.baseUrl+"/"+this.options.getID(data)+buildQuery(this.query),{
            ...this.options.requestInit,
            method:"DELETE"
        }).then(res=>res.json()).then((res)=>{
            const resData = this.options.getDataFromResponse(res,'delete');
            if(resData) {
                this.options.dispatch(this.deleteModelAction(data));
                this.afterRequest();
                return true;
            }
            return false;
        })
    }
    put(data):Promise<Model>{
        return this.options.fetch(this.options.baseUrl+"/"+this.options.getID(data)+buildQuery(this.query), {
            ...this.options.requestInit,
            method:"PUT",
            body:JSON.stringify(data)
        }).then(res=>res.json()).then((res)=>{
            const model = this.options.getDataFromResponse(res,'put');
            if(model) {
                this.options.dispatch(this.updateModelAction(typeof model ==='object'?model:data));
            }
            this.afterRequest();
            return model;
        })
    }
    post(data):Promise<Model>{
        return this.options.fetch(this.options.baseUrl+"/"+buildQuery(this.query),{
            ...this.options.requestInit,
            method:"POST",
            body:JSON.stringify(data)
        }).then(res=>res.json()).then((res)=>{
            const model = this.options.getDataFromResponse(res,'post');
            if(model) {
                this.options.dispatch(this.addModelAction(typeof model ==='object'?model:data));
            }
            this.afterRequest();
            return model;
        })
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
    public setAllModelsAction(models, offset?){
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