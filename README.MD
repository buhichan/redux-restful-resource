![travis ci](https://travis-ci.org/buhichan/redux-restful-resource.svg?branch=master)

# A restful resource wrapper for typescript that auto sync your data with redux.
*自动跟Redux的store同步数据的Restful Api工具类*

```typescript
import {Store,createStore} from "redux";
import {fromJS} from "immutable";
import {RestfulResource,ResourceReducer} from "redux-restful-resource";

let store:Store = createStore((state,action)=>{
    let res = state?state:fromJS({
        people:[],
        grid:{}
    });
    if(state && action && action.type==='jsAction'){
        console.log("received action:\n",action);
    }
    return ResourceReducer(res,action);
},fromJS({people:[],grid:{}}));

interface IUser{
    gender
}

let UserResource = new RestfulResource<IUser,{
    someAction:Promise<IUser>
}>({
    baseUrl:"http://192.168.150.211:3000/api/people",
    pathInState:['people'], // the location to store the immutable list of models in redux store.
    //id:x=>x._id, //the model must have an id property, default is "id"
    dispatch:store.dispatch.bind(store),
    fetch:window.fetch,
    actions:[{
        key:"someAction",
        method:"POST",
        path:":id/customAction2",
        getBody:(data)=>{
            return data; // your request's body
        },
        getDataFromResponse(res){
            return res.DataSet // get user list from response
        }
    }]
});

UserResource.action.someAction.then((data)=>{
    data.gender //type inferred
});
UserResource.delete({
    id:1
}).then(()=>{});
UserResource.post({
    gender:0
}).then(()=>{});
UserResource.get(1).then(data=>{
    console.log(data.gender)
});
UserResource.get().then((data)=>{
    return data.map(x=>{
        return x.gender //type is inferred. 类型会被推导出来，不用声明IUser[]
    })
})
```

# Redux

```typescript
store.getState().people.toArray(); 
```
*Be sure to register the ResourceReducer.*

After you call "get", "post", "put", "delete",
The redux store will be automatically synchronized.