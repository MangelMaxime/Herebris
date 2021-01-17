// ts2fable 0.8.0
module rec PgSubset
open System
open Fable.Core
open Fable.Core.JS
open Node

type Array<'T> = System.Collections.Generic.IList<'T>
type Error = System.Exception
type Function = System.Action

type EventEmitter = Events.EventEmitter
// type checkServerIdentity = Tls. checkServerIdentity
// let [<Import("*","module")>] pg: Pg.IExports = jsNative

module Pg =

    type [<AllowNullLiteral>] IExports =
        abstract defaults: IDefaults
        abstract types: ITypes
        abstract Client: obj

    type [<AllowNullLiteral>] IColumn =
        abstract name: string with get, set
        abstract oid: float with get, set
        abstract dataTypeID: int with get, set
        abstract tableID: float with get, set
        abstract columnID: float with get, set
        abstract dataTypeSize: float with get, set
        abstract dataTypeModifier: float with get, set
        abstract format: string with get, set

    type [<AllowNullLiteral>] IResult =
        abstract command: string with get, set
        abstract rowCount: float with get, set
        abstract rows: ResizeArray<obj option> with get, set
        abstract fields: ResizeArray<IColumn> with get, set
        abstract rowAsArray: bool with get, set
        abstract _types: IResult_types with get, set
        abstract _parsers: Array<Function> with get, set

    type [<AllowNullLiteral>] ISSLConfig =
        abstract ca: U3<string, Buffer, Array<U2<string, Buffer>>> option with get, set
        abstract pfx: U3<string, Buffer, Array<U3<string, Buffer, obj>>> option with get, set
        abstract cert: U3<string, Buffer, Array<U2<string, Buffer>>> option with get, set
        abstract key: U3<string, Buffer, Array<U2<Buffer, obj>>> option with get, set
        abstract passphrase: string option with get, set
        abstract rejectUnauthorized: bool option with get, set
        abstract checkServerIdentity: obj option with get, set
        abstract secureOptions: float option with get, set
        abstract NPNProtocols: U5<ResizeArray<string>, Buffer, ResizeArray<Buffer>, Uint8Array, ResizeArray<Uint8Array>> option with get, set

    type DynamicPassword =
        U3<string, (unit -> string), (unit -> Promise<string>)>

    type IConnectionParameters =
        IConnectionParameters<IClient>

    type [<AllowNullLiteral>] IConnectionParameters<'C when 'C :> IClient> =
        abstract connectionString: string option with get, set
        abstract host: string option with get, set
        abstract database: string option with get, set
        abstract user: string option with get, set
        abstract password: DynamicPassword option with get, set
        abstract port: float option with get, set
        abstract ssl: U2<bool, ISSLConfig> option with get, set
        abstract binary: bool option with get, set
        abstract client_encoding: string option with get, set
        abstract encoding: string option with get, set
        abstract application_name: string option with get, set
        abstract fallback_application_name: string option with get, set
        abstract isDomainSocket: bool option with get, set
        abstract max: float option with get, set
        abstract maxUses: float option with get, set
        abstract idleTimeoutMillis: float option with get, set
        abstract parseInputDatesAsUTC: bool option with get, set
        abstract rows: float option with get, set
        abstract statement_timeout: U2<bool, float> option with get, set
        abstract query_timeout: U2<bool, float> option with get, set
        abstract connectionTimeoutMillis: float option with get, set
        abstract keepAliveInitialDelayMillis: float option with get, set
        abstract keepAlive: bool option with get, set
        abstract keepalives: float option with get, set
        abstract keepalives_idle: float option with get, set
        abstract Client: obj option with get, set
        abstract Promise: obj option with get, set
        abstract types: ITypeOverrides option with get, set

    type [<RequireQualifiedAccess>] TypeId =
        | BOOL = 16
        | BYTEA = 17
        | CHAR = 18
        | INT8 = 20
        | INT2 = 21
        | INT4 = 23
        | REGPROC = 24
        | TEXT = 25
        | OID = 26
        | TID = 27
        | XID = 28
        | CID = 29
        | JSON = 114
        | XML = 142
        | PG_NODE_TREE = 194
        | SMGR = 210
        | PATH = 602
        | POLYGON = 604
        | CIDR = 650
        | FLOAT4 = 700
        | FLOAT8 = 701
        | ABSTIME = 702
        | RELTIME = 703
        | TINTERVAL = 704
        | CIRCLE = 718
        | MACADDR8 = 774
        | MONEY = 790
        | MACADDR = 829
        | INET = 869
        | ACLITEM = 1033
        | BPCHAR = 1042
        | VARCHAR = 1043
        | DATE = 1082
        | TIME = 1083
        | TIMESTAMP = 1114
        | TIMESTAMPTZ = 1184
        | INTERVAL = 1186
        | TIMETZ = 1266
        | BIT = 1560
        | VARBIT = 1562
        | NUMERIC = 1700
        | REFCURSOR = 1790
        | REGPROCEDURE = 2202
        | REGOPER = 2203
        | REGOPERATOR = 2204
        | REGCLASS = 2205
        | REGTYPE = 2206
        | UUID = 2950
        | TXID_SNAPSHOT = 2970
        | PG_LSN = 3220
        | PG_NDISTINCT = 3361
        | PG_DEPENDENCIES = 3402
        | TSVECTOR = 3614
        | TSQUERY = 3615
        | GTSVECTOR = 3642
        | REGCONFIG = 3734
        | REGDICTIONARY = 3769
        | JSONB = 3802
        | REGNAMESPACE = 4089
        | REGROLE = 4096

    type [<StringEnum>] [<RequireQualifiedAccess>] ParserFormat =
        | Text
        | Binary

    type [<AllowNullLiteral>] ITypeOverrides =
        abstract setTypeParser: id: TypeId * parseFn: U2<string, (string -> obj option)> -> unit
        abstract setTypeParser: id: TypeId * format: ParserFormat * parseFn: U2<string, (string -> obj option)> -> unit
        abstract getTypeParser: id: TypeId * ?format: ParserFormat -> obj option

    type [<AllowNullLiteral>] ITypes =
        inherit ITypeOverrides
        abstract arrayParser: source: string * transform: (obj option -> obj option) -> ResizeArray<obj option>
        abstract builtins: obj with get, set

    type [<AllowNullLiteral>] IDefaults =
        abstract connectionString: string with get, set
        abstract host: string with get, set
        abstract user: string with get, set
        abstract database: string with get, set
        abstract password: DynamicPassword with get, set
        abstract port: float with get, set
        abstract rows: float with get, set
        abstract binary: bool with get, set
        abstract max: float with get, set
        abstract client_encoding: string with get, set
        abstract ssl: U2<bool, ISSLConfig> with get, set
        abstract application_name: string with get, set
        abstract fallback_application_name: string with get, set
        abstract parseInputDatesAsUTC: bool with get, set
        abstract statement_timeout: U2<bool, float> with get, set
        abstract query_timeout: U2<bool, float> with get, set
        abstract keepalives: float with get, set
        abstract keepalives_idle: float with get, set

    type [<AllowNullLiteral>] IPool =
        inherit EventEmitter
        abstract ``end``: unit -> Promise<obj>
        abstract ``end``: cb: (Error -> obj option) -> obj option
        abstract options: IPoolOptions
        abstract ended: bool
        abstract ending: bool
        abstract waitingCount: float
        abstract idleCount: float
        abstract totalCount: float

    type [<AllowNullLiteral>] IQuery =
        interface end

    type [<AllowNullLiteral>] IConnection =
        inherit EventEmitter
        abstract stream: Net.Socket with get, set

    type [<AllowNullLiteral>] IClient =
        inherit EventEmitter
        abstract query: config: obj option * values: ResizeArray<obj option> * callback: (Error -> IResult -> unit) -> obj
        abstract query: config: obj option * callback: (Error -> IResult -> unit) -> obj
        abstract query: config: obj option * values: ResizeArray<obj option> -> Promise<IResult>
        abstract query: config: obj option -> Promise<IResult>
        abstract connectionParameters: IConnectionParameters with get, set
        abstract database: string with get, set
        abstract user: string with get, set
        abstract password: DynamicPassword with get, set
        abstract port: float with get, set
        abstract host: string with get, set
        abstract serverVersion: string
        abstract connection: IConnection with get, set
        abstract queryQueue: ResizeArray<IQuery> with get, set
        abstract binary: bool with get, set
        abstract ssl: U2<bool, ISSLConfig> with get, set
        abstract secretKey: float with get, set
        abstract processID: float with get, set
        abstract encoding: string with get, set
        abstract readyForQuery: bool with get, set
        abstract activeQuery: IQuery with get, set

    type [<AllowNullLiteral>] IResult_types =
        abstract _types: obj option with get, set
        abstract text: obj option with get, set
        abstract binary: obj option with get, set

    type [<AllowNullLiteral>] IPoolOptions =
        [<EmitIndexer>] abstract Item: name: string -> obj option with get, set
