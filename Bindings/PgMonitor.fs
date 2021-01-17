// ts2fable 0.8.0
module rec PgMonitor

open System
open Fable.Core
open Fable.Core.JS

type Array<'T> = System.Collections.Generic.IList<'T>

let [<Import("detailed","pg-monitor")>] detailed: bool = jsNative

let [<Import("default", "pg-monitor")>] e : IExports = jsNative

type [<AllowNullLiteral>] IExports =
    abstract attach: options: obj * ?events: Array<LogEvent> * ?``override``: bool -> unit
    abstract detach: unit -> unit
    abstract isAttached: unit -> bool
    abstract setTheme: theme: U2<ThemeName, IColorTheme> -> unit
    abstract setLog: log: (string -> IEventInfo -> unit) -> unit
    abstract setDetailed: value: bool -> unit
    abstract connect: client: obj * dc: obj option * useCount: float * ?detailed: bool -> unit
    abstract disconnect: client: obj * dc: obj option * ?detailed: bool -> unit
    abstract query: e: obj * ?detailed: bool -> unit
    abstract task: e: obj -> unit
    abstract transact: e: obj -> unit
    abstract error: err: obj option * e: obj * ?detailed: bool -> unit

type [<AllowNullLiteral>] ITaskContext =
    abstract context: obj option
    abstract parent: ITaskContext option
    abstract connected: bool
    abstract inTransaction: bool
    abstract level: float
    abstract useCount: float
    abstract isTX: bool
    abstract start: DateTime
    abstract tag: obj option
    abstract dc: obj option
    abstract finish: DateTime option
    abstract duration: float option
    abstract success: bool option
    abstract result: obj option
    abstract txLevel: float option

type [<AllowNullLiteral>] ColorFunction =
    [<Emit "$0($1...)">] abstract Invoke: [<ParamArray>] values: obj option[] -> string

type [<AllowNullLiteral>] IColorTheme =
    abstract time: ColorFunction with get, set
    abstract value: ColorFunction with get, set
    abstract cn: ColorFunction with get, set
    abstract tx: ColorFunction with get, set
    abstract paramTitle: ColorFunction with get, set
    abstract errorTitle: ColorFunction with get, set
    abstract query: ColorFunction with get, set
    abstract special: ColorFunction with get, set
    abstract error: ColorFunction with get, set

type [<StringEnum>] [<RequireQualifiedAccess>] LogEvent =
    | Connect
    | Disconnect
    | Query
    | Task
    | Transact
    | Error

type [<StringEnum>] [<RequireQualifiedAccess>] ThemeName =
    | Dimmed
    | Bright
    | Monochrome
    | Minimalist
    | Matrix
    | InvertedMonochrome
    | InvertedContrast

type [<AllowNullLiteral>] IEventInfo =
    abstract time: DateTime option with get, set
    abstract colorText: string with get, set
    abstract text: string with get, set
    abstract ``event``: LogEvent with get, set
    abstract display: bool with get, set
    abstract ctx: ITaskContext option with get, set
