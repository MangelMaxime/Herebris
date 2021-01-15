namespace Jupiter

[<AutoOpen>]
module Router =

    open System.Collections.Generic
    open Connect.CreateServer
    open ServeServeStaticCore
    open Fable.Core.JsInterop

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

    type HttpHandler = Request -> Response -> NextFunction -> unit

    // TODO: Test if we need to change the builder to keep the order of declaration
    // In Express, the order of declaration matter so perhaps that can cause some problem here
    // The test can probably done with the permissions system to see how it can be hooked into the routing system

    type RouterPart =
        | Route of string * RouteType * HttpHandler
        | RoutesRegExp of RegExp * RouteType * HttpHandler
        | Pipeline of HttpHandler
        | Router of string * Router

    type RouterState = RouterPart list

    type RouteBuilder() =

        member __.Yield (_) =
            []

        member __.Run(state : RouterState) =
            let router = Express.e.Router()

            for routerPart in state do
                match routerPart with
                | Route (path, routeType, handler) ->
                    match routeType with
                    | RouteType.Get ->
                        router.get(path, System.Func<Request, Response, NextFunction, unit>(handler))
                    | RouteType.Post ->
                        router.post(path, System.Func<Request, Response, NextFunction, unit>(handler))
                    | RouteType.Put ->
                        router.put(path, System.Func<Request, Response, NextFunction, unit>(handler))
                    | RouteType.Delete ->
                        router.delete(path, System.Func<Request, Response, NextFunction, unit>(handler))
                    | RouteType.Patch ->
                        router.patch(path, System.Func<Request, Response, NextFunction, unit>(handler))

                | RoutesRegExp _ ->
                    failwith "RoutesRegExp not yet implemtend"

                | Pipeline handler ->
                    router.``use``(System.Func<Request, Response, NextFunction, unit>(handler))

                | Router (path, subRouter) ->
                    router.``use``(path, subRouter)


            // for handler in state.Pipelines do
            //     router.``use``(System.Func<Request, Response, NextFunction, unit>(handler))

            // for KeyValue((path, typ), action) in state.Routes do
            //     match typ with
            //     | RouteType.Get ->
            //         router.get(path, System.Func<Request, Response, NextFunction, unit>(action))
            //     | RouteType.Post ->
            //         router.post(path, System.Func<Request, Response, NextFunction, unit>(action))
            //     | RouteType.Put ->
            //         router.put(path, System.Func<Request, Response, NextFunction, unit>(action))
            //     | RouteType.Delete ->
            //         router.delete(path, System.Func<Request, Response, NextFunction, unit>(action))
            //     | RouteType.Patch ->
            //         router.patch(path, System.Func<Request, Response, NextFunction, unit>(action))

            // for KeyValue((path, typ), action) in state.RoutesRegExp do
            //     match typ with
            //     | RouteType.Get ->
            //         router.get(path, System.Func<Request, Response, NextFunction, unit>(action))
            //     | RouteType.Post ->
            //         router.post(path, System.Func<Request, Response, NextFunction, unit>(action))
            //     | RouteType.Put ->
            //         router.put(path, System.Func<Request, Response, NextFunction, unit>(action))
            //     | RouteType.Delete ->
            //         router.delete(path, System.Func<Request, Response, NextFunction, unit>(action))
            //     | RouteType.Patch ->
            //         router.patch(path, System.Func<Request, Response, NextFunction, unit>(action))

            // for (path, subRouter) in state.Routers do
            //     router.``use``(path, subRouter)

            router

        [<CustomOperation("get")>]
        member __.Get(state : RouterState, path : string, action) =
            state @ [ Route (path, RouteType.Get, action) ]

        // [<CustomOperation("get_regex")>]
        // member __.GetRegExp(state : RouterState, path : RegExp, action) =
        //     state.RoutesRegExp.[(path, RouteType.Get)] <- action
        //     state

        [<CustomOperation("post")>]
        member __.Post(state : RouterState, path : string, action) =
            state @ [ Route (path, RouteType.Post, action) ]

        // [<CustomOperation("post_regex")>]
        // member __.PostRegExp(state : RouterState, path : RegExp, action) =
        //     state.RoutesRegExp.[(path, RouteType.Post)] <- action
        //     state

        [<CustomOperation("put")>]
        member __.Put(state : RouterState, path : string, action) =
            state @ [ Route (path, RouteType.Put, action) ]

        // [<CustomOperation("put_regex")>]
        // member __.PutRegExp(state : RouterState, path : RegExp, action) =
        //     state.RoutesRegExp.[(path, RouteType.Put)] <- action
        //     state

        [<CustomOperation("delete")>]
        member __.Delete(state : RouterState, path : string, action) =
            state @ [ Route (path, RouteType.Delete, action) ]

        // [<CustomOperation("delete_regex")>]
        // member __.DeleteRegExp(state : RouterState, path : RegExp, action) =
        //     state.RoutesRegExp.[(path, RouteType.Delete)] <- action
        //     state

        [<CustomOperation("patch")>]
        member __.Patch(state : RouterState, path : string, action) =
            state @ [ Route (path, RouteType.Patch, action) ]

        // [<CustomOperation("patch_regex")>]
        // member __.PatchRegExp(state : RouterState, path : RegExp, action) =
        //     state.RoutesRegExp.[(path, RouteType.Patch)] <- action
        //     state

        [<CustomOperation("pipe_through")>]
        member __.PipeThrough(state : RouterState, pipeline : HttpHandler) =
            state @ [ Pipeline pipeline ]

        [<CustomOperation("sub_router")>]
        member __.SubRouter(state : RouterState, path, newRouter) =
            state @ [ Router (path, newRouter) ]

//        [<CustomOperation("handler")>]
//        member __.SubRouter(state : RouterState, x) =
//            { state with
//
//            }

    let router = RouteBuilder()
