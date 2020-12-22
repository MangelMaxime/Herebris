namespace Herebris.Express

[<AutoOpen>]
module Router =

    open System.Collections.Generic
    open Connect.CreateServer
    open ServeServeStaticCore

      [<RequireQualifiedAccess>]
      /// <summary>
      /// Type representing route type, used in internal state of the `application` computation expression
      /// </summary>
      type RouteType =
        | Get
        | Post
        | Put
        | Delete
        | Patch

    type Handler = System.Func<Request, Response, System.Func<obj option, unit>, unit>

    type RouterState =
        {
            Routes : Dictionary<string * RouteType, Request -> Response -> NextFunction -> unit>
            RoutesRegExp : Dictionary<RegExp * RouteType, Request -> Response -> NextFunction -> unit>
        }
     
    type RouteBuilder() =
        
        member __.Yield (_) =
            {
                Routes = Dictionary()
                RoutesRegExp = Dictionary()
            }
            
        member __.Run(state : RouterState) =
            let router = Express.e.Router()
            
            for KeyValue((path, typ), action) in state.Routes do
                match typ with
                | RouteType.Get ->
                    router.get(path, System.Func<Request, Response, NextFunction, unit>(action)) 
                | RouteType.Post ->
                    router.post(path, System.Func<Request, Response, NextFunction, unit>(action))
                | RouteType.Put ->
                    router.put(path, System.Func<Request, Response, NextFunction, unit>(action))
                | RouteType.Delete ->
                    router.delete(path, System.Func<Request, Response, NextFunction, unit>(action))
                | RouteType.Patch ->
                    router.patch(path, System.Func<Request, Response, NextFunction, unit>(action))
                    
            for KeyValue((path, typ), action) in state.RoutesRegExp do
                match typ with
                | RouteType.Get ->
                    router.get(path, System.Func<Request, Response, NextFunction, unit>(action)) 
                | RouteType.Post ->
                    router.post(path, System.Func<Request, Response, NextFunction, unit>(action))
                | RouteType.Put ->
                    router.put(path, System.Func<Request, Response, NextFunction, unit>(action))
                | RouteType.Delete ->
                    router.delete(path, System.Func<Request, Response, NextFunction, unit>(action))
                | RouteType.Patch ->
                    router.patch(path, System.Func<Request, Response, NextFunction, unit>(action))
              
            router
         
        [<CustomOperation("get")>]
        member __.Get(state : RouterState, path : string, action) =
            state.Routes.[(path, RouteType.Get)] <- action
            state
            
        [<CustomOperation("get_regex")>]
        member __.GetRegExp(state : RouterState, path : RegExp, action) =
            state.RoutesRegExp.[(path, RouteType.Get)] <- action
            state
            
        [<CustomOperation("post")>]
        member __.Post(state : RouterState, path : string, action) =
            state.Routes.[(path, RouteType.Post)] <- action
            state
            
        [<CustomOperation("post_regex")>]
        member __.PostRegExp(state : RouterState, path : RegExp, action) =
            state.RoutesRegExp.[(path, RouteType.Post)] <- action
            state
                        
        [<CustomOperation("put")>]
        member __.Put(state : RouterState, path : string, action) =
            state.Routes.[(path, RouteType.Put)] <- action
            state
            
        [<CustomOperation("put_regex")>]
        member __.PutRegExp(state : RouterState, path : RegExp, action) =
            state.RoutesRegExp.[(path, RouteType.Put)] <- action
            state
        
        [<CustomOperation("delete")>]
        member __.Delete(state : RouterState, path : string, action) =
            state.Routes.[(path, RouteType.Delete)] <- action
            state
            
        [<CustomOperation("delete_regex")>]
        member __.DeleteRegExp(state : RouterState, path : RegExp, action) =
            state.RoutesRegExp.[(path, RouteType.Delete)] <- action
            state
            
        [<CustomOperation("patch")>]
        member __.Patch(state : RouterState, path : string, action) =
            state.Routes.[(path, RouteType.Patch)] <- action
            state
            
        [<CustomOperation("patch_regex")>]
        member __.PatchRegExp(state : RouterState, path : RegExp, action) =
            state.RoutesRegExp.[(path, RouteType.Patch)] <- action
            state
            
    let router = RouteBuilder()
