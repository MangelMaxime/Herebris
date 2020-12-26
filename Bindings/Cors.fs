// ts2fable 0.8.0
module rec Cors

open System
open Fable.Core
open Fable.Core.JsInterop
open Fable.Core.JS

type Error = System.Exception
type RegExp = System.Text.RegularExpressions.Regex

type IncomingHttpHeaders = obj

//[<Import("default", "cors")>]
// Attributes doesn't work /shrug so we use "code import" as the JavaScript seems more correct that way
let e: IExports =  import "default" "cors"

type [<AllowNullLiteral>] IExports =
    // abstract e: ?options: U2<E.CorsOptions, E.CorsOptionsDelegate<'T>> -> ('T -> IExports -> (obj -> obj option) -> unit) when 'T :> E.CorsRequest
    [<Emit "$0()">]
    abstract Invoke: unit -> ServeStatic.ServeStatic.RequestHandler<_>
    [<Emit "$0($1...)">]
    abstract Invoke: ?options: E.CorsOptions -> ServeStatic.ServeStatic.RequestHandler<_>
    [<Emit "$0($1...)">]
    abstract Invoke: ?options: E.CorsOptionsDelegate<'T> -> ServeStatic.ServeStatic.RequestHandler<_>

type [<AllowNullLiteral>] CustomOrigin =
    [<Emit "$0($1...)">] abstract Invoke: requestOrigin: string option * callback: (Error option -> bool -> unit) -> unit

module E =

    type [<AllowNullLiteral>] CorsRequest =
        abstract ``method``: string option with get, set
        abstract headers: IncomingHttpHeaders with get, set

    type [<AllowNullLiteral>] CorsOptions =
        abstract origin: U5<bool, string, RegExp, ResizeArray<U2<string, RegExp>>, CustomOrigin> with get, set
        abstract methods: U2<string, ResizeArray<string>> with get, set
        abstract allowedHeaders: U2<string, ResizeArray<string>> with get, set
        abstract exposedHeaders: U2<string, ResizeArray<string>> with get, set
        abstract credentials: bool with get, set
        abstract maxAge: float with get, set
        abstract preflightContinue: bool with get, set
        abstract optionsSuccessStatus: float with get, set

    type CorsOptionsDelegate =
        CorsOptionsDelegate<CorsRequest>

    type [<AllowNullLiteral>] CorsOptionsDelegate<'T when 'T :> CorsRequest> =
        [<Emit "$0($1...)">] abstract Invoke: req: 'T * callback: (Error option -> CorsOptions -> unit) -> unit

    type [<AllowNullLiteral>] IExports =
        abstract statusCode: float option with get, set
        abstract setHeader: key: string * value: string -> obj option
        abstract ``end``: unit -> obj option
