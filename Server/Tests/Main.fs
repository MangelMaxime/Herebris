module Herebris.Server.Tests

open System.Diagnostics
open Fable.Core
open Fable.Core.JsInterop
open Fable.Mocha
open Fable.Mocha.Extensions
open Node

let dotenvOptions =
    jsOptions<Dotenv.DotenvConfigOptions>(fun o ->
        o.path <- Api.path.join(Api.__dirname, "..", ".env")
    )

Dotenv.e.config(dotenvOptions) |> ignore

let tests =
    testList "All" [
        Tests.Database.Sql.tests
        Tests.Database.User.tests
    ]

Mocha.runTests tests |> ignore
