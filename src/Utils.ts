/**
 * Created by YS on 2016/11/4.
 */

export type KeyPath = string|number

export function getImmuOrPOJO(target:any,key?:KeyPath){
    if(!target) 
        return null;
    if(!key)
        return null
    return (typeof target.get === 'function')?
        target.get(key):target[key]
}
export function setImmuOrPOJO(target:any,data:any,key?:KeyPath){
    if(!target) 
        return null;
    if(!key)
        return null
    if(typeof target.set === 'function')
        return target.set(key,data);
    else{
        target[key]=data;
        return target
    }
}

export function deepGet(obj:any,pathStr:string){
    const path = pathStr.split(/\.|\[|\]/g);
    let result=obj;
    for(let i=0;i<path.length;i++){
        if(path[i]!==""){
            result = result[path[i]];
            if(result === null || result === undefined)
                return result;
        }
    }
    return result;
}

export function deepGetState(rootState:any,...keys:KeyPath[]){
    return keys.reduce((state,key)=>{
        return getImmuOrPOJO(state,key)
    },rootState)
}

export function deepSetState(state:any,data:any,...keys:KeyPath[]){
    if(!keys || !keys.length) return data;
    let nextKey = keys.shift();
    let prevState = getImmuOrPOJO(state,nextKey) || {};
    let nextState:any = deepSetState(prevState,data,...keys);
    if(prevState !== nextState)
        return setImmuOrPOJO(state,nextState,nextKey);
    return state;
}

export function buildQuery(params:{[id:string]:any}|null):string{
    if(!params) return "";
    let keys = Object.keys(params);
    if(!keys.length) return "";
    else
    return "?"+Object.keys(params).map(key=>{

        if(params[key] instanceof Array){
            key = encodeURIComponent(key);
            return params[key].map((entry:string)=>{
                return key+"[]="+encodeURIComponent(entry)
            }).join("&")
        }else {
            const value = typeof params[key] === 'object' ?
                JSON.stringify(params[key]) : params[key];
            return encodeURIComponent(key) + "=" + encodeURIComponent(value)
        }
    }).join("&")
}

export function fillParametersInPath(path:string,params:{[paramName:string]:any}|null){
    return path.replace(/(\/:\w+)(?=\/|$)/g,function(match){
        if(!params)
            return "";
        const value = params[match.slice(2)];
        return value?("/"+value) : ""
    });
}

export function stripTrailingSlash(path:string){
    if(path && path.length>1 && path[path.length-1] === '/')
        return path.slice(0,-1)
    else return path
}