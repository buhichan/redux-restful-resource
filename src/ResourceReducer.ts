import {deepSetState, deepGetState} from "./Utils";
/**
 * Created by YS on 2016/11/4.
 */

import {List,Map,Repeat} from "immutable"

export interface ActionPayload<T>{
    pathInState:string[],
    key:(T:T)=>string
}

export type ActionTypes = "@@resource/get"|"@@resource/post"|"@@resource/put"|"@@resource/delete"

export interface GetPayload<T> extends ActionPayload<T>{
    models:T[],
    offset:number,
    limit:number,
    total?:number
}

export interface PutPayload<T> extends ActionPayload<T>{
    model:T
}

export interface DeletePayload<T> extends ActionPayload<T>{
    model:T
}

export interface PostPayload<T> extends ActionPayload<T>{
    model:T
}

export function ResourceReducer<T>(rootState, action: { type: ActionTypes, payload: ActionPayload<T> }) {
    let payload,list:List<T>,index;
    switch (action.type) {
        case "@@resource/get":
            payload = action.payload as GetPayload<T>;
            if(payload.offset===null)
                return deepSetState(rootState, List(payload.models), ...payload.pathInState);
            else {
                let prev = deepGetState(rootState,...payload.pathInState) as List<T>;
                if(prev.size < payload.offset)
                    prev = prev.concat(Repeat(null,payload.offset-prev.size)) as List<T>;
                return deepSetState(rootState, prev.splice(payload.offset,payload.models.length,...payload.models), ...payload.pathInState)
            }
        case "@@resource/put":
            payload = action.payload as PostPayload<T>;
            list = deepGetState(rootState,...payload.pathInState);
            if(!list) return deepSetState(rootState,List([payload]),...payload.pathInState);
            index = list.findIndex(entry=>payload.key(entry)===payload.key(payload.model));
            if(index<0) return deepSetState(rootState,list.push(payload.model),...payload.pathInState);
            if(index>=0) {
                return deepSetState(rootState, list.update(index, (old:any)=>{
                    return ({...old,...payload.model})
                }), ...payload.pathInState);
            }else return rootState;
        case "@@resource/post":
            payload = action.payload as PutPayload<T>;
            list = deepGetState(rootState,...payload.pathInState);
            if(!list)
                list = List() as List<T> ;
            else if(!list.insert)
                list = List(list);
            return deepSetState(rootState,list.insert(0,payload.model),...payload.pathInState);
        case "@@resource/delete":
            payload = action.payload as DeletePayload<T>;
            list = deepGetState(rootState, ...payload.pathInState);
            let i = list.findIndex((item: T)=> {
                return (action.payload.key(item) === action.payload.key(payload.model))
            });
            if(i>=0)
                list = list.delete(i);
            return deepSetState(rootState, list, ...payload.pathInState);
        default:
            return rootState
    }
}