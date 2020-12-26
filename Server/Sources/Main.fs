module Server

open System
open Fable.Core
open Fable.Core.JsInterop
open Pg
open ServeServeStaticCore
open Thoth.Json

open Herebris.Express

let config : Pg.ClientConfig =
    jsOptions<Pg.ClientConfig>(fun o ->
        o.user <- Some "postgres"
        o.password <- Some !^"use env var"
        o.host <- Some "localhost"
        o.database <- Some "Test"
    )

let client = Pg.defaults.Client.Create(config)

let userRouter = router {
    get "/index" (fun req res next ->
        res.write("user index :)") |> ignore
        res.``end``()
    )
}

let mainRouter = router {
    get "/hello" (fun req res next ->
        res.write("hello from the serv2er") |> ignore
        res.``end``()
    )

    get "/echo" (fun req res next ->
        let value = unbox<string> req.query.["value"]
        let text = sprintf "Echo: %s" value
        res.write(text) |> ignore
        res.``end``()
    )

    get "/api/fake-data" (fun req res next ->
        Encode.object [
            "name", Encode.string "maxime"
        ]
        |> Encode.toString 4
        |> res.write
        |> ignore

        res.``end``()
    )

    get "/errored" (fun req res next ->
        next.Invoke(box "fake error")
    )

    sub_router "/user" userRouter
}

let app = application {
    use_cors (jsOptions<Cors.E.CorsOptions>(fun o ->
        o.origin <- !^"http://localhost:8080"
    ))

    use_router mainRouter

    // When working on local dev env the static folder is serve using Snowpack
    #if !LOCAL_DEV
    use_static "static"
    #endif
}

// app.``use``(mainRouter)

run app 3000

// let corsOptions = jsOptions<Cors.E.CorsOptions>(fun o ->
//     o.origin <- Some !^"http://localhost:8080/"
// )

// let corsHandler : ServeStatic.ServeStatic.RequestHandler<Node.Http.ServerResponse> = Cors.e.Invoke()

// app.``use``(corsHandler)
