module rec Pg

open System
open Fable.Core
open Fable.Core.JS
open Node

type Array<'T> = System.Collections.Generic.IList<'T>
type Error = System.Exception

module Pg =
    type ConnectionOptions = obj //Tls.ConnectionOptions
    let [<Import("types","pg")>] types: obj = jsNative
    let [<Import("*","pg")>] defaults: IExports = jsNative
    let [<Import("native","pg")>] native: obj option = jsNative

    type [<AllowNullLiteral>] IExports =
        abstract Connection: ConnectionStatic
        abstract Pool: PoolStatic
        abstract ClientBase: ClientBaseStatic
        abstract Client: ClientStatic
        abstract Query: QueryStatic
        abstract Events: EventsStatic

    type [<AllowNullLiteral>] ClientConfig =
        abstract user: string with get, set
        abstract database: string with get, set
        abstract password: U2<string, (unit -> U2<string, Promise<string>>)> with get, set
        abstract port: int with get, set
        abstract host: string with get, set
        abstract connectionString: string with get, set
        abstract keepAlive: bool with get, set
//        abstract stream: Stream.Duplex option with get, set
        abstract statement_timeout: int with get, set
        abstract parseInputDatesAsUTC: bool with get, set
        abstract ssl: U2<bool, ConnectionOptions> with get, set
        abstract query_timeout: int with get, set
        abstract keepAliveInitialDelayMillis: int with get, set
        abstract idle_in_transaction_session_timeout: int with get, set
        abstract application_name: string with get, set
        abstract connectionTimeoutMillis: int with get, set

    type ConnectionConfig =
        ClientConfig

    type [<AllowNullLiteral>] Defaults =
        inherit ClientConfig
        abstract poolSize: float option with get, set
        abstract poolIdleTimeout: float option with get, set
        abstract reapIntervalMillis: float option with get, set
        abstract binary: bool option with get, set
        abstract parseInt8: bool option with get, set

    type [<AllowNullLiteral>] PoolConfig =
        inherit ClientConfig
        abstract max: int with get, set
        abstract min: int with get, set
        abstract idleTimeoutMillis: int with get, set
        abstract log: (ResizeArray<obj option> -> unit) option with get, set
        abstract Promise: (*PromiseConstructorLike*) PromiseConstructor option with get, set

    type QueryConfig =
        QueryConfig<obj>

    type [<AllowNullLiteral>] QueryConfig<'I> =
        abstract name: string option with get, set
        abstract text: string with get, set
        abstract values: 'I option with get, set

    type [<AllowNullLiteral>] Submittable =
        abstract submit: (Connection -> unit) with get, set

    type QueryArrayConfig =
        QueryArrayConfig<obj>

    type [<AllowNullLiteral>] QueryArrayConfig<'I> =
        inherit QueryConfig<'I>
        abstract rowMode: string with get, set

    type [<AllowNullLiteral>] FieldDef =
        abstract name: string with get, set
        abstract tableID: float with get, set
        abstract columnID: float with get, set
        abstract dataTypeID: int with get, set
        abstract dataTypeSize: float with get, set
        abstract dataTypeModifier: float with get, set
        abstract format: string with get, set

    type [<AllowNullLiteral>] QueryResultBase =
        abstract command: string with get, set
        abstract rowCount: float with get, set
        abstract oid: float with get, set
        abstract fields: ResizeArray<FieldDef> with get, set

    type [<AllowNullLiteral>] QueryResultRow =
        [<Emit "$0[$1]{{=$2}}">] abstract Item: column: string -> obj option with get, set

    type QueryResult =
        QueryResult<obj>

    type [<AllowNullLiteral>] QueryResult<'R> =
        inherit QueryResultBase
        abstract rows: ResizeArray<'R> with get, set

    type QueryArrayResult =
        QueryArrayResult<obj>

    type [<AllowNullLiteral>] QueryArrayResult<'R> =
        inherit QueryResultBase
        abstract rows: ResizeArray<'R> with get, set

    type [<AllowNullLiteral>] Notification =
        abstract processId: float with get, set
        abstract channel: string with get, set
        abstract payload: string option with get, set

    type ResultBuilder =
        ResultBuilder<obj>

    type [<AllowNullLiteral>] ResultBuilder<'R> =
        inherit QueryResult<'R>
        abstract addRow: row: 'R -> unit

    type [<AllowNullLiteral>] QueryParse =
        abstract name: string with get, set
        abstract text: string with get, set
        abstract types: ResizeArray<string> with get, set

    type [<AllowNullLiteral>] BindConfig =
        abstract portal: string option with get, set
        abstract statement: string option with get, set
        abstract binary: string option with get, set
        abstract values: Array<U2<Buffer, string> option> option with get, set

    type [<AllowNullLiteral>] ExecuteConfig =
        abstract portal: string option with get, set
        abstract rows: string option with get, set

    type [<AllowNullLiteral>] MessageConfig =
        abstract ``type``: string with get, set
        abstract name: string option with get, set

    type [<AllowNullLiteral>] Connection =
        inherit Events.EventEmitter
//        abstract stream: Stream.Duplex
        abstract bind: config: BindConfig option * more: bool -> unit
        abstract execute: config: ExecuteConfig option * more: bool -> unit
        abstract parse: query: QueryParse * more: bool -> unit
        abstract query: text: string -> unit
        abstract describe: msg: MessageConfig * more: bool -> unit
        abstract close: msg: MessageConfig * more: bool -> unit
        abstract flush: unit -> unit
        abstract sync: unit -> unit
        abstract ``end``: unit -> unit

    type [<AllowNullLiteral>] ConnectionStatic =
        [<Emit "new $0($1...)">] abstract Create: ?config: ConnectionConfig -> Connection

    /// {@link https://node-postgres.com/api/pool}
    type [<AllowNullLiteral>] Pool =
        inherit Events.EventEmitter
        abstract totalCount: float
        abstract idleCount: float
        abstract waitingCount: float
        abstract connect: unit -> Promise<PoolClient>
        abstract connect: callback: (Error -> PoolClient -> (obj -> unit) -> unit) -> unit
        abstract ``end``: unit -> Promise<unit>
        abstract ``end``: callback: (unit -> unit) -> unit
        abstract query: queryStream: 'T -> 'T
        abstract query: queryConfig: QueryArrayConfig<'I> * ?values: 'I -> Promise<QueryArrayResult<'R>>
        abstract query: queryConfig: QueryConfig<'I> -> Promise<QueryResult<'R>>
        // abstract query: queryTextOrConfig: U2<string, QueryConfig<'I>> * ?values: 'I -> Promise<QueryResult<'R>>
        abstract query: queryText: string * ?values: 'I -> Promise<QueryResult<'R>>
        abstract query: queryConfig: QueryConfig<'I> * ?values: 'I -> Promise<QueryResult<'R>>
        abstract query: queryConfig: QueryArrayConfig<'I> * callback: (Error -> QueryArrayResult<'R> -> unit) -> unit
        abstract query: queryTextOrConfig: U2<string, QueryConfig<'I>> * callback: (Error -> QueryResult<'R> -> unit) -> unit
        abstract query: queryText: string * values: 'I * callback: (Error -> QueryResult<'R> -> unit) -> unit
        [<Emit "$0.on('error',$1)">] abstract on_error: listener: (Error -> PoolClient -> unit) -> Pool
        abstract on: ``event``: PoolOnEvent * listener: (PoolClient -> unit) -> Pool

    type [<StringEnum>] [<RequireQualifiedAccess>] PoolOnEvent =
        | Connect
        | Acquire
        | Remove

    /// {@link https://node-postgres.com/api/pool}
    type [<AllowNullLiteral>] PoolStatic =
        /// Every field of the config object is entirely optional.
        /// The config passed to the pool is also passed to every client
        /// instance within the pool when the pool creates that client.
        [<Emit "new $0($1...)">] abstract Create: ?config: PoolConfig -> Pool

    type [<AllowNullLiteral>] ClientBase =
        inherit Events.EventEmitter
        abstract connect: unit -> Promise<unit>
        abstract connect: callback: (Error -> unit) -> unit
        abstract query: queryStream: 'T -> Promise<'T>
        abstract query: queryConfig: QueryArrayConfig<'I> * ?values: 'I -> Promise<QueryArrayResult<'R>>
        abstract query: queryConfig: QueryConfig<'I> -> Promise<QueryResult<'R>>
        abstract query<'I, 'R> : queryTextOrConfig: string * ?values: 'I -> Promise<QueryResult<'R>>
        abstract query<'I, 'R> : queryTextOrConfig: QueryConfig<'I> * ?values: 'I -> Promise<QueryResult<'R>>
        abstract query: queryConfig: QueryArrayConfig<'I> * callback: (Error -> QueryArrayResult<'R> -> unit) -> unit
        abstract query: queryTextOrConfig: U2<string, QueryConfig<'I>> * callback: (Error -> QueryResult<'R> -> unit) -> unit
        abstract query: queryText: string * values: ResizeArray<obj option> * callback: (Error -> QueryResult<'R> -> unit) -> unit
        abstract copyFrom: queryText: string -> Stream.Writable<'T>
        abstract copyTo: queryText: string -> Stream.Readable<'T>
        abstract pauseDrain: unit -> unit
        abstract resumeDrain: unit -> unit
        abstract escapeIdentifier: str: string -> string
        abstract escapeLiteral: str: string -> string
        [<Emit "$0.on('drain',$1)">] abstract on_drain: listener: (unit -> unit) -> ClientBase
        abstract on: ``event``: ClientBaseOnEvent * listener: (Error -> unit) -> ClientBase
        [<Emit "$0.on('notification',$1)">] abstract on_notification: listener: (Notification -> unit) -> ClientBase
        [<Emit "$0.on('end',$1)">] abstract on_end: listener: (unit -> unit) -> ClientBase

    type [<StringEnum>] [<RequireQualifiedAccess>] ClientBaseOnEvent =
        | Error
        | Notice

    type [<AllowNullLiteral>] ClientBaseStatic =
        [<Emit "new $0($1...)">] abstract Create: ?config: U2<string, ClientConfig> -> ClientBase

    type [<AllowNullLiteral>] Client =
        inherit ClientBase
        abstract user: string option with get, set
        abstract database: string option with get, set
        abstract port: float with get, set
        abstract host: string with get, set
        abstract password: string option with get, set
        abstract ssl: bool with get, set
        abstract ``end``: unit -> Promise<unit>
        abstract ``end``: callback: (Error -> unit) -> unit

    type [<AllowNullLiteral>] ClientStatic =
        [<Emit "new $0($1...)">] abstract Create: unit -> Client
        [<Emit "new $0($1...)">] abstract Create: config: string -> Client
        [<Emit "new $0($1...)">] abstract Create: config: ClientConfig -> Client

    type [<AllowNullLiteral>] PoolClient =
        inherit ClientBase
        abstract release: ?err: U2<Error, bool> -> unit

    type Query<'I> =
        Query<obj, 'I>

    type Query =
        Query<obj, obj>

    type [<AllowNullLiteral>] Query<'R, 'I> =
        inherit Events.EventEmitter
        inherit Submittable
        abstract submit: (Connection -> unit) with get, set
        [<Emit "$0.on('row',$1)">] abstract on_row: listener: ('R -> ResultBuilder<'R> -> unit) -> Query<'R, 'I>
        [<Emit "$0.on('error',$1)">] abstract on_error: listener: (Error -> unit) -> Query<'R, 'I>
        [<Emit "$0.on('end',$1)">] abstract on_end: listener: (ResultBuilder<'R> -> unit) -> Query<'R, 'I>

    type [<AllowNullLiteral>] QueryStatic =
        [<Emit "new $0($1...)">] abstract Create: ?queryTextOrConfig: U2<string, QueryConfig<'I>> * ?values: 'I -> Query<'R, 'I>

    type [<AllowNullLiteral>] Events =
        inherit Events.EventEmitter
        [<Emit "$0.on('error',$1)">] abstract on_error: listener: (Error -> Client -> unit) -> Events

    type [<AllowNullLiteral>] EventsStatic =
        [<Emit "new $0($1...)">] abstract Create: unit -> Events
