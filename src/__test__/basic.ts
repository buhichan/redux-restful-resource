import { RestfulResource, ResourceReducer } from "../";
import {createStore} from "redux"
import { List } from "immutable";
const fetch = require("node-fetch");
import "jasmine"

const store = createStore<any,any,any,any>(
    ResourceReducer,
    {
        people:List()
    } as any
)

const resource = new RestfulResource<any,{
    schema():Promise<any>
}>({
    pathInState:['people'],
    baseUrl:"https://swapi.co/api/people",
    dispatch:store.dispatch.bind(store),
    fetch:fetch,
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
    it("should store that array in redux-store as an immutable list",(done)=>{
        resource.get().then((people:any)=>{
            expect(List.isList(store.getState().people)).toBeTruthy()
            expect(people[0] === store.getState().people.get(0)).toBeTruthy()
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