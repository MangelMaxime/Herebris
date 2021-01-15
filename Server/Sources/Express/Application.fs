namespace Jupiter

[<AutoOpen>]
module Application =

    open ServeServeStaticCore
    open Fable.Core.JsInterop

    type StaticRouter<'R when 'R :> Node.Http.ServerResponse> =
        {
            Route : string option
            FilePath : string
            Options : ServeStatic.ServeStatic.ServeStaticOptions<'R> option
        }


    type ApplicationState =
        {
            Port : int
            Router : Router option
            StaticRouters : StaticRouter<Express.E.Response> list
            CorsOptions : Cors.E.CorsOptions list
        }

    type ApplicationBuilder() =

        [<CustomOperation("use_router")>]
        member __.UseRouter (state, handler) =
            { state with
                Router = Some handler
            }

        [<CustomOperation("use_static")>]
        member __.UseStatic (state, path) =
            { state with
                StaticRouters =
                    {
                        Route = None
                        FilePath = path
                        Options = None
                    } :: state.StaticRouters
            }

        [<CustomOperation("use_static_with_route")>]
        member __.UseStaticWithRoute (state, route, path) =
            { state with
                StaticRouters =
                    {
                        Route = Some route
                        FilePath = path
                        Options = None
                    } :: state.StaticRouters
            }

        [<CustomOperation("use_static_with_options")>]
        member __.UseStaticWithOptions (state, path, options) =
            { state with
                StaticRouters =
                    {
                        Route = None
                        FilePath = path
                        Options = Some options
                    } :: state.StaticRouters
            }

        [<CustomOperation("use_static_with_route_and_options")>]
        member __.UseStaticWithRouteAndOptions (state, route, path, options) =
            { state with
                StaticRouters =
                    {
                        Route = Some route
                        FilePath = path
                        Options = Some options
                    } :: state.StaticRouters
            }

        [<CustomOperation("use_cors")>]
        member __.UseSimpleCors (state, host) =
            { state with
                CorsOptions = host :: state.CorsOptions
            }

        member __.Yield(_) =
            {
                Port = 3000
                Router = None
                StaticRouters = []
                CorsOptions = []
            }

        member __.Run(state : ApplicationState) =
            let app = Express.express.Invoke()

            for corsOption in state.CorsOptions do
                let corsHandler : ServeStatic.ServeStatic.RequestHandler<Node.Http.ServerResponse> = Cors.e.Invoke(corsOption)

                app.``use``(corsHandler)

            for staticRouterInfo in state.StaticRouters do
                match staticRouterInfo with
                | { Route = Some route; FilePath = path; Options = Some options } ->
                    let newStaterRouter = Express.e.``static``.Invoke(path)
                    app.``use``(route, newStaterRouter)

                | { Route = None; FilePath = path; Options = None } ->
                    let newStaterRouter = Express.e.``static``.Invoke(path)
                    app.``use``(newStaterRouter)

                | { Route = None; FilePath = path; Options = Some options } ->
                    let newStaterRouter = Express.e.``static``.Invoke(path, options)
                    app.``use``(newStaterRouter)

                | { Route = Some route ; FilePath = path; Options = None } ->
                    let newStaterRouter = Express.e.``static``.Invoke(path)
                    app.``use``(route, newStaterRouter)

            match state.Router with
            | Some router ->
                app.``use``(router)

            | None ->
                ()

            app

    let application = ApplicationBuilder()

    let run (application : Express) (port : int) =
        application.listen(float port)
        |> ignore
