import {deepSetState, deepGetState} from "./Utils";
/**
 * Created by YS on 2016/11/4.
 */

import {List,Map,Repeat} from "immutable"

export interface ActionPayload<T>{
    pathInStore:string[],
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

export function ResourceReducer<T>(rootState, action: {
    type: ActionTypes,
    value: ActionPayload<T>
}) {
    let payload,list:List<T>,index;
    switch (action.type) {
        case "@@resource/get":
            payload = action.value as GetPayload<T>;
            if(payload.offset===null)
                return deepSetState(rootState, List(payload.models), ...payload.modelPath);
            else {
                let prev = deepGetState(rootState,...payload.modelPath) as List<T>;
                if(prev.size < payload.offset)
                    prev = prev.concat(Repeat(null,payload.offset-prev.size)) as List<T>;
                return deepSetState(rootState, prev.splice(payload.offset,payload.models.length,...payload.models), ...payload.modelPath)
            }
        case "@@resource/put":
            payload = action.value as PostPayload<T>;
            list = deepGetState(rootState,...payload.modelPath);
            if(!list) return deepSetState(rootState,List([payload]),...payload.modelPath);
            index = list.findIndex(entry=>payload.key(entry)===payload.key(payload.model));
            if(index<0) return deepSetState(rootState,list.push(payload.model),...payload.modelPath);
            if(index>=0) {
                return deepSetState(rootState, list.set(index, payload.model), ...payload.modelPath);
            }else return rootState;
        case "@@resource/post":
            payload = action.value as PutPayload<T>;
            list = deepGetState(rootState,...payload.modelPath);
            if(!list)
                list = List([]);
            else if(!list.insert)
                list = List(list);
            return deepSetState(rootState,list.insert(0,payload.model),...payload.modelPath);
        case "@@resource/delete":
            payload = action.value as DeletePayload<T>;
            list = deepGetState(rootState, ...payload.modelPath);
            let i = list.findIndex((item: T)=> {
                return (action.value.key(item) === action.value.key(payload.model))
            });
            if(i>=0)
                list = list.delete(i);
            return deepSetState(rootState, list, ...payload.modelPath);
        default:
            return rootState
    }
}