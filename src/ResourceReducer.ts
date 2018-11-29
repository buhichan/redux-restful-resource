import {deepSetState, deepGetState} from "./Utils";
/**
 * Created by YS on 2016/11/4.
 */

type ActionPayload<T> = {
    pathInState:string[],
    key:(T:T)=>any
}

type GetPayload<T> = ActionPayload<T> & {
    models:T[],
}

type PutPayload<T> = ActionPayload<T> & {
    model:T
}

type DeletePayload<T> = ActionPayload<T> & {
    model:T
}

type PostPayload<T> = ActionPayload<T> & {
    model:T
}

export const getReducer = <T>(payload:GetPayload<T>)=>(rootState:any)=>{
    return deepSetState(rootState, payload.models, ...payload.pathInState);
}

export const putReducer = <T>(payload:PutPayload<T>)=>(rootState:any)=>{
    const list = deepGetState(rootState,...payload.pathInState) as Array<T>;
    if(!list) return deepSetState(rootState,Array([payload]),...payload.pathInState);
    let index = list.findIndex(entry=>payload.key(entry)===payload.key(payload.model));
    if(index<0) return deepSetState(rootState,list.push(payload.model),...payload.pathInState);
    if(index>=0) {
        list.splice(index,1,{...list[index] as any,...payload.model as any})
        return deepSetState(rootState, list.slice() , ...payload.pathInState);
    }else return rootState;
}

export const postReducer = <T>(payload:PostPayload<T>)=>(rootState:any)=>{
    let list = deepGetState(rootState,...payload.pathInState) as Array<T>
    if(!list)
        list = [] as T[]
    return deepSetState(rootState,[payload.model].concat(list),...payload.pathInState);
}

export const deleteReducer = <T>(payload:DeletePayload<T>)=>(rootState:any)=>{
    let list = deepGetState(rootState, ...payload.pathInState);
    let i = list.findIndex((item: T)=> {
        return (payload.key(item) === payload.key(payload.model))
    });
    if(i>=0)
        list = list.delete(i);
    return deepSetState(rootState, list, ...payload.pathInState);
}