module Herebris.Server

open System
open Fable.Core
open Fable.Core.JsInterop
open Pg

let config : Pg.ClientConfig =
    jsOptions<Pg.ClientConfig>(fun o ->
        o.user <- Some "postgres"
        o.password <- Some !^"use env var"
        o.host <- Some "localhost"
        o.database <- Some "Test"
    )

let client = Pg.defaults.Client.Create(config)

let run () =
    promise {
        do! client.connect()

        let! res = client.query<_, {| now: DateTime |}>("SELECT NOW()")

        JS.console.log(res.rows)
        JS.console.log(res.rows.[0])
        printfn "%A" (res.rows.[0].now.ToUniversalTime())

        do! client.``end``()
    }

run ()
