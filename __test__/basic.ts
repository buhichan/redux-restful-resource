import { RestfulResource } from "../src";
import "jasmine"
import people from "./people";
import schema from "./schema"

const createStore = (defaultState:any)=>{
    let state = defaultState
    return {
        getState(){
            return state
        },
        dispatch(mutation:any){
            state = mutation(state)
        }
    }
}

const store = createStore({
    people:[]
})

const resource = RestfulResource<any,{ schema():Promise<any>}>({
    pathInState:['people'],
    baseUrl:"https://swapi.co/api/people",
    dispatch:store.dispatch,
    fetch:(url,requestinit)=>{
        return new Promise(resolve=>{
            resolve({
                json(){
                    return new Promise(resolve=>{
                        if(typeof url === 'string' && url.endsWith("1")){
                            resolve(people[0])
                        }else if(typeof url === 'string' && url.endsWith("schema")){
                            resolve(schema)
                        }
                            resolve(people)
                    })
                }
            } as any)
        })
    },
    getDataFromResponse:x=>x.results?x.results:x,
    actions:[
        {
            key:"schema",
            path:"schema",
        }
    ]
})

describe("Basic Test",()=>{
    it("should return a promise of items when get",(done)=>{
        const promise = resource.get()
        expect(promise instanceof Promise).toBeTruthy()
        promise.then((people:any)=>{
            expect(people instanceof Array).toBeTruthy()
            expect(people.some((x:any)=>x.name === "Luke Skywalker")).toBeTruthy()
            done()
        })
    })
    it("should return a single item when get with an id",(done)=>{
        resource.get(1).then((people:any)=>{
            expect(people.name === "Luke Skywalker").toBeTruthy()
            done()
        })
    })
    it("should store that array in store as a plain array",(done)=>{
        resource.get().then((people:any)=>{
            expect(Array.isArray(store.getState().people)).toBeTruthy()
            done()
        })
    })
    it("should retain the order of array in response",(done)=>{
        resource.get().then((people:any)=>{
            expect(people[0] === store.getState().people[0]).toBeTruthy()
            done()
        })
    })
    it("should extend .actions as declared in options",(done)=>{
        resource.actions.schema().then((starship:any)=>{
            expect(starship.$schema.includes("json-schema.org")).toBeTruthy()
            done()
        })
    })
})