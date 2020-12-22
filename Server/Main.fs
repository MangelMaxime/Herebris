module Server

open System
open Fable.Core
open Fable.Core.JsInterop
open Pg
open ServeServeStaticCore

open Herebris.Express

let config : Pg.ClientConfig =
    jsOptions<Pg.ClientConfig>(fun o ->
        o.user <- Some "postgres"
        o.password <- Some !^"use env var"
        o.host <- Some "localhost"
        o.database <- Some "Test"
    )

let client = Pg.defaults.Client.Create(config)



//let run (app : Application) =
//    app.listen(float state.Port)

//let app = Express.express.Invoke()
//
//app.get("/hello",  fun req res next ->
//    res.write("hello from the server")
//    res.``end``()
//)
//
//app.listen(3000.)

let mainRouter = router {
    get "/hello" (fun req res next ->
        res.write("hello from the server") |> ignore
        res.``end``()
    )
    
    get "/echo" (fun req res next ->
        let value = unbox<string> req.query.["value"]
        let text = sprintf "Echo: %s" value 
        res.write(text) |> ignore
        res.``end``()
    )
    
    get "/errored" (fun req res next ->
        next.Invoke(box "fake error")
    )
}

let app = application {
    use_router mainRouter
}

run app 3000
