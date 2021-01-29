// ts2fable 0.8.0
module rec PgPromise

open System
open Fable.Core
open Fable.Core.JS
open Node

module Pg = PgSubset.Pg
module SpexLib = Spex.Spex
module PgMinify = PgMinify.PgMinify

type Array<'T> = System.Collections.Generic.IList<'T>
type Error = System.Exception
type Symbol = obj

let [<Import("default","pg-promise")>] pgPromise: PgPromise.IExports = jsNative

type [<AllowNullLiteral>] IExports =
    [<Emit("$0($1)")>]
    abstract Invoke: ?options: PgPromise.IInitOptions<'Ext, 'C> -> PgPromise.IMain<'Ext, 'C> when 'C :> Pg.IClient

let [<Import("default", "pg-promise")>] e : IExports = jsNative

type XPromise<'T> =
    Promise<'T>

module PgPromise =
    let [<Import("errors","module/pgPromise")>] errors: Errors.IExports = jsNative

    type [<AllowNullLiteral>] IExports =
        abstract TableName: TableNameStatic
        abstract Column: ColumnStatic
        abstract ColumnSet: ColumnSetStatic
        abstract minify: obj
        abstract PreparedStatement: PreparedStatementStatic
        abstract ParameterizedQuery: ParameterizedQueryStatic
        // abstract QueryFile: QueryFileStatic
        [<Emit("new $0.QueryFile($1...)")>]
        abstract QueryFile: file: string * ?options: IQueryFileOptions -> QueryFile
        abstract txMode: ITXMode
        abstract utils: IUtils
        abstract ``as``: IFormatting
        abstract TransactionMode: TransactionModeStatic

    type [<AllowNullLiteral>] IQueryFileOptions =
        abstract debug: bool option with get, set
        abstract minify: U2<bool, string> option with get, set
        abstract compress: bool option with get, set
        abstract ``params``: obj option with get, set
        abstract noWarnings: bool option with get, set

    type [<AllowNullLiteral>] IFormattingOptions =
        abstract capSQL: bool option with get, set
        abstract partial: bool option with get, set
        abstract def: obj option with get, set

    type ILostContext =
        ILostContext<Pg.IClient>

    type [<AllowNullLiteral>] ILostContext<'C when 'C :> Pg.IClient> =
        abstract cn: string with get, set
        abstract dc: obj option with get, set
        abstract start: DateTime with get, set
        abstract client: 'C with get, set

    type IConnectionOptions =
        IConnectionOptions<Pg.IClient>

    type [<AllowNullLiteral>] IConnectionOptions<'C when 'C :> Pg.IClient> =
        abstract direct: bool option with get, set
        abstract onLost: err: obj option * e: ILostContext<'C> -> unit

    type [<AllowNullLiteral>] IPreparedStatement =
        abstract name: string option with get, set
        abstract text: U2<string, QueryFile> option with get, set
        abstract values: ResizeArray<obj option> option with get, set
        abstract binary: bool option with get, set
        abstract rowMode: U2<unit, string> option with get, set
        abstract rows: float option with get, set

    type [<AllowNullLiteral>] IParameterizedQuery =
        abstract text: U2<string, QueryFile> option with get, set
        abstract values: ResizeArray<obj option> option with get, set
        abstract binary: bool option with get, set
        abstract rowMode: U2<unit, string> option with get, set

    type [<AllowNullLiteral>] IPreparedParsed =
        abstract name: string with get, set
        abstract text: string with get, set
        abstract values: ResizeArray<obj option> with get, set
        abstract binary: bool with get, set
        abstract rowMode: U2<unit, string> with get, set
        abstract rows: float with get, set

    type [<AllowNullLiteral>] IParameterizedParsed =
        abstract text: string with get, set
        abstract values: ResizeArray<obj option> with get, set
        abstract binary: bool with get, set
        abstract rowMode: U2<unit, string> with get, set

    type [<AllowNullLiteral>] IColumnDescriptor<'T> =
        abstract source: 'T with get, set
        abstract name: string with get, set
        abstract value: obj option with get, set
        abstract exists: bool with get, set

    type [<AllowNullLiteral>] IColumnConfig<'T> =
        abstract name: string with get, set
        abstract prop: string option with get, set
        abstract ``mod``: FormattingFilter option with get, set
        abstract cast: string option with get, set
        abstract cnd: bool option with get, set
        abstract def: obj option with get, set
        abstract init: col: IColumnDescriptor<'T> -> obj option
        abstract skip: col: IColumnDescriptor<'T> -> bool

    type [<AllowNullLiteral>] IColumnSetOptions =
        abstract table: U3<string, ITable, TableName> option with get, set
        abstract ``inherit``: bool option with get, set

    type [<AllowNullLiteral>] ITable =
        abstract table: string with get, set
        abstract schema: string option with get, set

    type [<AllowNullLiteral>] IPromiseConfig =
        abstract create: resolve: (obj -> unit) * ?reject: (obj -> unit) -> XPromise<obj option>
        abstract resolve: ?value: obj -> unit
        abstract reject: ?reason: obj -> unit
        abstract all: iterable: obj option -> XPromise<obj option>

    type [<StringEnum>] [<RequireQualifiedAccess>] FormattingFilter =
        | [<CompiledName "^">] Filter_pow
        | [<CompiledName "~">] Filter_tild
        | [<CompiledName "#">] Filter_hash
        | [<CompiledName ":raw">] Filter_raw
        | [<CompiledName ":alias">] Filter_alias
        | [<CompiledName ":name">] Filter_name
        | [<CompiledName ":json">] Filter_json
        | [<CompiledName ":csv">] Filter_csv
        | [<CompiledName ":list">] Filter_list
        | [<CompiledName ":value">] Filter_value

    type QueryColumns<'T> =
        U3<Column<'T>, ColumnSet<'T>, Array<U3<string, IColumnConfig<'T>, Column<'T>>>>

    type QueryParam =
        U6<string, QueryFile, IPreparedStatement, IParameterizedQuery, PreparedStatement, ParameterizedQuery> //, (obj -> QueryParam)>

    type ValidSchema =
        U3<string, ResizeArray<string>, unit> option

    type [<AllowNullLiteral>] TableName =
        abstract name: string
        abstract table: string
        abstract schema: string
        abstract toString: unit -> string

    type [<AllowNullLiteral>] TableNameStatic =
        [<EmitConstructor>] abstract Create: table: U2<string, ITable> -> TableName

    type Column =
        Column<obj>

    type [<AllowNullLiteral>] Column<'T> =
        abstract name: string
        abstract prop: string
        abstract ``mod``: FormattingFilter
        abstract cast: string
        abstract cnd: bool
        abstract def: obj option
        abstract castText: string
        abstract escapedName: string
        abstract init: (IColumnDescriptor<'T> -> obj option)
        abstract skip: (IColumnDescriptor<'T> -> bool)
        abstract toString: ?level: float -> string

    type [<AllowNullLiteral>] ColumnStatic =
        [<EmitConstructor>] abstract Create: col: U2<string, IColumnConfig<'T>> -> Column<'T>

    type ColumnSet =
        ColumnSet<obj>

    type [<AllowNullLiteral>] ColumnSet<'T> =
        abstract columns: ResizeArray<Column<'T>>
        abstract names: string
        abstract table: TableName
        abstract variables: string
        abstract assign: ?source: ColumnSetAssignSource -> string
        abstract assignColumns: ?options: ColumnSetAssignColumnsOptions -> string
        abstract extend: columns: U3<Column<'T>, ColumnSet<'T>, Array<U3<string, IColumnConfig<'T>, Column<'T>>>> -> ColumnSet<'S>
        abstract merge: columns: U3<Column<'T>, ColumnSet<'T>, Array<U3<string, IColumnConfig<'T>, Column<'T>>>> -> ColumnSet<'S>
        abstract prepare: obj: obj -> obj
        abstract toString: ?level: float -> string

    type [<AllowNullLiteral>] ColumnSetAssignSource =
        abstract source: obj option with get, set
        abstract prefix: string option with get, set

    type [<AllowNullLiteral>] ColumnSetAssignColumnsOptions =
        abstract from: string option with get, set
        abstract ``to``: string option with get, set
        abstract skip: U3<string, ResizeArray<string>, (Column<'T> -> bool)> option with get, set

    type [<AllowNullLiteral>] ColumnSetStatic =
        [<EmitConstructor>] abstract Create: columns: Column<'T> * ?options: IColumnSetOptions -> ColumnSet<'T>
        [<EmitConstructor>] abstract Create: columns: Array<U3<string, IColumnConfig<'T>, Column<'T>>> * ?options: IColumnSetOptions -> ColumnSet<'T>
        [<EmitConstructor>] abstract Create: columns: obj * ?options: IColumnSetOptions -> ColumnSet<'T>

    type [<RequireQualifiedAccess>] queryResult =
        | One = 1
        | Many = 2
        | None = 4
        | Any = 6

    type [<AllowNullLiteral>] PreparedStatement =
        abstract name: string with get, set
        abstract text: U2<string, QueryFile> with get, set
        abstract values: ResizeArray<obj option> with get, set
        abstract binary: bool with get, set
        abstract rowMode: U2<unit, string> with get, set
        abstract rows: float with get, set
        abstract parse: unit -> U2<IPreparedParsed, Errors.PreparedStatementError>
        abstract toString: ?level: float -> string

    type [<AllowNullLiteral>] PreparedStatementStatic =
        [<EmitConstructor>] abstract Create: ?options: IPreparedStatement -> PreparedStatement

    type [<AllowNullLiteral>] ParameterizedQuery =
        abstract text: U2<string, QueryFile> with get, set
        abstract values: ResizeArray<obj option> with get, set
        abstract binary: bool with get, set
        abstract rowMode: U2<unit, string> with get, set
        abstract parse: unit -> U2<IParameterizedParsed, Errors.ParameterizedQueryError>
        abstract toString: ?level: float -> string

    type [<AllowNullLiteral>] ParameterizedQueryStatic =
        [<EmitConstructor>] abstract Create: ?options: U3<string, QueryFile, IParameterizedQuery> -> ParameterizedQuery

    type [<AllowNullLiteral>] QueryFile =
        abstract error: Error
        abstract file: string
        abstract options: obj option
        abstract prepare: unit -> unit
        abstract toString: ?level: float -> string

    type [<AllowNullLiteral>] QueryFileStatic =
        [<EmitConstructor>] abstract Create: file: string * ?options: IQueryFileOptions -> QueryFile

    type [<AllowNullLiteral>] PromiseAdapter =
        interface end

    type [<AllowNullLiteral>] PromiseAdapterStatic =
        [<EmitConstructor>] abstract Create: api: IPromiseConfig -> PromiseAdapter

    type IDatabase<'Ext> =
        IDatabase<'Ext, Pg.IClient>

    type [<AllowNullLiteral>] IDatabase<'Ext, 'C when 'C :> Pg.IClient> =
        inherit IBaseProtocol<'Ext>
        abstract connect: ?options: IConnectionOptions<'C> -> XPromise<IConnected<'Ext, 'C>>
        abstract ``$config``: ILibConfig<'Ext, 'C>
        abstract ``$cn``: U2<string, Pg.IConnectionParameters<'C>>
        abstract ``$dc``: obj option
        abstract ``$pool``: Pg.IPool

    type [<AllowNullLiteral>] IResultExt =
        inherit Pg.IResult
        abstract duration: float option with get, set

    type IMain =
        IMain<obj, Pg.IClient>

    type IMain<'Ext> =
        IMain<'Ext, Pg.IClient>

    type [<AllowNullLiteral>] IMain<'Ext, 'C when 'C :> Pg.IClient> =
        [<Emit "$0($1...)">] abstract Invoke: cn: U2<string, Pg.IConnectionParameters<'C>> * ?dc: obj -> IDatabase<'Ext, 'C>
        abstract PromiseAdapter: obj
        abstract PreparedStatement: obj
        abstract ParameterizedQuery: obj
        abstract QueryFile: obj
        abstract queryResult: obj
        abstract minify: obj
        abstract spex: SpexLib.ISpex
        abstract errors: obj
        abstract utils: IUtils
        abstract txMode: ITXMode
        abstract helpers: IHelpers
        abstract ``as``: IFormatting
        abstract pg: obj
        abstract ``end``: unit -> unit

    type [<AllowNullLiteral>] ITask<'Ext> =
        inherit IBaseProtocol<'Ext>
        inherit SpexLib.ISpexBase
        abstract ctx: ITaskContext

    type [<AllowNullLiteral>] IBaseProtocol<'Ext> =
        abstract query: query: QueryParam * ?values: obj * ?qrm: queryResult -> XPromise<'T>
        abstract none: query: QueryParam * ?values: obj -> XPromise<obj>
        abstract one: query: QueryParam * ?values: obj * ?cb: (obj option -> 'T) * ?thisArg: obj -> XPromise<'T>
        abstract oneOrNone: query: QueryParam * ?values: obj * ?cb: (obj option -> 'T) * ?thisArg: obj -> XPromise<'T option>
        abstract many: query: QueryParam * ?values: obj -> XPromise<ResizeArray<'T>>
        abstract manyOrNone: query: QueryParam * ?values: obj -> XPromise<ResizeArray<'T>>
        abstract any: query: QueryParam * ?values: obj -> XPromise<ResizeArray<'T>>

        abstract result: query: QueryParam * ?values: obj * ?cb: (IResultExt -> 'T) * ?thisArg: obj -> XPromise<IResultExt>
        abstract result: query: string * ?values: obj * ?cb: (IResultExt -> 'T) * ?thisArg: obj -> XPromise<IResultExt>
        abstract result: query: QueryFile * ?values: obj * ?cb: (IResultExt -> 'T) * ?thisArg: obj -> XPromise<IResultExt>
        abstract result: query: IPreparedStatement * ?values: obj * ?cb: (IResultExt -> 'T) * ?thisArg: obj -> XPromise<IResultExt>
        abstract result: query: IParameterizedQuery * ?values: obj * ?cb: (IResultExt -> 'T) * ?thisArg: obj -> XPromise<IResultExt>
        abstract result: query: PreparedStatement * ?values: obj * ?cb: (IResultExt -> 'T) * ?thisArg: obj -> XPromise<IResultExt>
        abstract result: query: ParameterizedQuery * ?values: obj * ?cb: (IResultExt -> 'T) * ?thisArg: obj -> XPromise<IResultExt>

        abstract multiResult: query: QueryParam * ?values: obj -> XPromise<ResizeArray<Pg.IResult>>
        abstract multi: query: QueryParam * ?values: obj -> XPromise<Array<ResizeArray<'T>>>
        abstract stream: qs: Stream.Stream * init: (Stream.Stream -> unit) -> XPromise<IBaseProtocolStreamXPromise>
        abstract func: funcName: string * ?values: obj * ?qrm: queryResult -> XPromise<'T>
        abstract proc: procName: string * ?values: obj * ?cb: (obj option -> 'T) * ?thisArg: obj -> XPromise<'T option>
        abstract map: query: QueryParam * values: obj option * cb: (obj option -> float -> ResizeArray<obj option> -> 'T) * ?thisArg: obj -> XPromise<ResizeArray<'T>>
        abstract each: query: QueryParam * values: obj option * cb: (obj option -> float -> ResizeArray<obj option> -> unit) * ?thisArg: obj -> XPromise<ResizeArray<'T>>
        abstract task: cb: (obj -> U2<'T, XPromise<'T>>) -> XPromise<'T>
        abstract task: tag: U2<string, float> * cb: (obj -> U2<'T, XPromise<'T>>) -> XPromise<'T>
        abstract task: options: IBaseProtocolTaskOptions * cb: (obj -> U2<'T, XPromise<'T>>) -> XPromise<'T>
        abstract taskIf: cb: (obj -> U2<'T, XPromise<'T>>) -> XPromise<'T>
        abstract taskIf: tag: U2<string, float> * cb: (obj -> U2<'T, XPromise<'T>>) -> XPromise<'T>
        abstract taskIf: options: IBaseProtocolTaskIfOptions * cb: (obj -> U2<'T, XPromise<'T>>) -> XPromise<'T>
        // abstract tx: cb: (obj -> U2<'T, XPromise<'T>>) -> XPromise<'T>
        // abstract tx: cb: (ITask<obj> -> 'T) -> XPromise<'T>
        abstract tx : cb: (ITask<obj> -> XPromise<'T>) -> XPromise<'T>
        abstract tx: tag: U2<string, float> * cb: (obj -> U2<'T, XPromise<'T>>) -> XPromise<'T>
        abstract tx: options: IBaseProtocolTxOptions * cb: (obj -> U2<'T, XPromise<'T>>) -> XPromise<'T>
        abstract txIf: cb: (obj -> U2<'T, XPromise<'T>>) -> XPromise<'T>
        abstract txIf: tag: U2<string, float> * cb: (obj -> U2<'T, XPromise<'T>>) -> XPromise<'T>
        abstract txIf: options: IBaseProtocolTxIfOptions * cb: (obj -> U2<'T, XPromise<'T>>) -> XPromise<'T>

    type [<AllowNullLiteral>] IBaseProtocolTaskOptions =
        abstract tag: obj option with get, set

    type [<AllowNullLiteral>] IBaseProtocolTaskIfOptions =
        abstract tag: obj option with get, set
        abstract cnd: U2<bool, (obj -> bool)> option with get, set

    type [<AllowNullLiteral>] IBaseProtocolTxOptions =
        abstract tag: obj option with get, set
        abstract mode: TransactionMode option with get, set

    type [<AllowNullLiteral>] IBaseProtocolTxIfOptions =
        abstract tag: obj option with get, set
        abstract mode: TransactionMode option with get, set
        abstract reusable: U2<bool, (obj -> bool)> option with get, set
        abstract cnd: U2<bool, (obj -> bool)> option with get, set

    type [<AllowNullLiteral>] IConnected<'Ext, 'C when 'C :> Pg.IClient> =
        inherit IBaseProtocol<'Ext>
        inherit SpexLib.ISpexBase
        abstract client: 'C
        abstract ``done``: ?kill: bool -> unit

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
        abstract serverVersion: string

    type IEventContext =
        IEventContext<Pg.IClient>

    type [<AllowNullLiteral>] IEventContext<'C when 'C :> Pg.IClient> =
        abstract client: 'C with get, set
        abstract cn: obj option with get, set
        abstract dc: obj option with get, set
        abstract query: obj option with get, set
        abstract ``params``: obj option with get, set
        abstract ctx: ITaskContext with get, set

    module Errors =

        type [<AllowNullLiteral>] IExports =
            abstract QueryResultError: QueryResultErrorStatic
            abstract QueryFileError: QueryFileErrorStatic
            abstract PreparedStatementError: PreparedStatementErrorStatic
            abstract ParameterizedQueryError: ParameterizedQueryErrorStatic

        type [<AllowNullLiteral;AbstractClass>] QueryResultError =
            inherit Error
            abstract name: string with get, set
            abstract message: string with get, set
            abstract stack: string with get, set
            abstract result: Pg.IResult with get, set
            abstract received: float with get, set
            abstract code: queryResultErrorCode with get, set
            abstract query: string with get, set
            abstract values: obj option with get, set
            abstract toString: unit -> string

        type [<AllowNullLiteral>] QueryResultErrorStatic =
            [<EmitConstructor>] abstract Create: unit -> QueryResultError

        type [<AllowNullLiteral;AbstractClass>] QueryFileError =
            inherit Error
            abstract name: string with get, set
            abstract message: string with get, set
            abstract stack: string with get, set
            abstract file: string with get, set
            abstract options: IQueryFileOptions with get, set
            abstract error: PgMinify.SQLParsingError with get, set
            abstract toString: ?level: float -> string

        type [<AllowNullLiteral>] QueryFileErrorStatic =
            [<EmitConstructor>] abstract Create: unit -> QueryFileError

        type [<AllowNullLiteral;AbstractClass>] PreparedStatementError =
            inherit Error
            abstract name: string with get, set
            abstract message: string with get, set
            abstract stack: string with get, set
            abstract error: QueryFileError with get, set
            abstract toString: ?level: float -> string

        type [<AllowNullLiteral>] PreparedStatementErrorStatic =
            [<EmitConstructor>] abstract Create: unit -> PreparedStatementError

        type [<AllowNullLiteral;AbstractClass>] ParameterizedQueryError =
            inherit Error
            abstract name: string with get, set
            abstract message: string with get, set
            abstract stack: string with get, set
            abstract error: QueryFileError with get, set
            abstract toString: ?level: float -> string

        type [<AllowNullLiteral>] ParameterizedQueryErrorStatic =
            [<EmitConstructor>] abstract Create: unit -> ParameterizedQueryError

        type [<RequireQualifiedAccess>] queryResultErrorCode =
            | NoData = 0
            | NotEmpty = 1
            | Multiple = 2

    type [<RequireQualifiedAccess>] isolationLevel =
        | None = 0
        | Serializable = 1
        | RepeatableRead = 2
        | ReadCommitted = 3

    type [<AllowNullLiteral>] TransactionMode =
        abstract ``begin``: ?cap: bool -> string

    type [<AllowNullLiteral>] TransactionModeStatic =
        [<EmitConstructor>] abstract Create: ?options: TransactionModeStaticOptions -> TransactionMode

    type [<AllowNullLiteral>] TransactionModeStaticOptions =
        abstract tiLevel: isolationLevel option with get, set
        abstract readOnly: bool option with get, set
        abstract deferrable: bool option with get, set

    type IInitOptions =
        IInitOptions<obj, Pg.IClient>

    type IInitOptions<'Ext> =
        IInitOptions<'Ext, Pg.IClient>

    type [<AllowNullLiteral>] IInitOptions<'Ext, 'C when 'C :> Pg.IClient> =
        abstract noWarnings: bool option with get, set
        abstract pgFormatting: bool option with get, set
        abstract pgNative: bool option with get, set
        abstract promiseLib: obj option with get, set
        abstract noLocking: bool option with get, set
        abstract capSQL: bool option with get, set
        abstract schema: U2<ValidSchema, (obj option -> ValidSchema)> option with get, set
        abstract connect: client: 'C * dc: obj option * useCount: float -> unit
        abstract disconnect: client: 'C * dc: obj option -> unit
        abstract query: e: IEventContext<'C> -> unit
        abstract receive: data: ResizeArray<obj option> * result: IResultExt * e: IEventContext<'C> -> unit
        abstract task: e: IEventContext<'C> -> unit
        abstract transact: e: IEventContext<'C> -> unit
        abstract error: err: obj option * e: IEventContext<'C> -> unit
        abstract extend: obj: obj * dc: obj option -> unit

    type ILibConfig<'Ext> =
        ILibConfig<'Ext, Pg.IClient>

    type [<AllowNullLiteral>] ILibConfig<'Ext, 'C when 'C :> Pg.IClient> =
        abstract version: string with get, set
        abstract promiseLib: obj option with get, set
        abstract promise: IGenericPromise with get, set
        abstract options: IInitOptions<'Ext, 'C> with get, set
        abstract pgp: IMain<'Ext, 'C> with get, set
        abstract ``$npm``: obj option with get, set

    type [<AllowNullLiteral>] ICTFObject =
        abstract toPostgres: a: obj option -> obj option

    type [<AllowNullLiteral>] IFormatting =
        abstract ctf: IFormattingCtf with get, set
        abstract alias: name: U2<string, (unit -> string)> -> string
        abstract array: arr: U2<ResizeArray<obj option>, (unit -> ResizeArray<obj option>)> * ?options: IFormattingArrayOptions -> string
        abstract bool: value: U2<obj option, (unit -> obj option)> -> string
        abstract buffer: obj: U2<obj, (unit -> obj)> * ?raw: bool -> string
        abstract csv: values: U2<obj option, (unit -> obj option)> -> string
        abstract date: d: U2<DateTime, (unit -> DateTime)> * ?raw: bool -> string
        abstract format: query: U3<string, QueryFile, ICTFObject> * ?values: obj * ?options: IFormattingOptions -> string
        abstract func: func: (obj option -> obj option) * ?raw: bool * ?cc: obj -> string
        abstract json: data: U2<obj option, (unit -> obj option)> * ?raw: bool -> string
        abstract name: name: U2<obj option, (unit -> obj option)> -> string
        abstract number: value: U3<float, obj, (unit -> U2<float, obj>)> -> string
        abstract text: value: U2<obj option, (unit -> obj option)> * ?raw: bool -> string
        abstract value: value: U2<obj option, (unit -> obj option)> -> string

    type [<AllowNullLiteral>] IFormattingArrayOptions =
        abstract capSQL: bool option with get, set

    type [<AllowNullLiteral>] ITXMode =
        abstract isolationLevel: obj with get, set
        abstract TransactionMode: obj with get, set

    type [<AllowNullLiteral>] IArguments =
        interface end

    type [<AllowNullLiteral>] ITaskArguments<'T> =
        inherit IArguments
        abstract options: obj with get, set
        abstract cb: unit -> obj option

    type [<AllowNullLiteral>] IUtils =
        abstract camelize: text: string -> string
        abstract camelizeVar: text: string -> string
        abstract enumSql: dir: string * ?options: IUtilsEnumSqlOptions * ?cb: (string -> string -> string -> obj option) -> obj option
        abstract taskArgs: args: IArguments -> ITaskArguments<'T>

    type [<AllowNullLiteral>] IUtilsEnumSqlOptions =
        abstract recursive: bool option with get, set
        abstract ignoreErrors: bool option with get, set

    type [<AllowNullLiteral>] IHelpers =
        abstract concat: queries: Array<U3<string, QueryFile, IHelpersConcatArray>> -> string
        abstract insert: data: U2<obj, ResizeArray<obj>> * ?columns: QueryColumns<obj option> * ?table: U3<string, ITable, TableName> -> string
        abstract update: data: U2<obj, ResizeArray<obj>> * ?columns: QueryColumns<obj option> * ?table: U3<string, ITable, TableName> * ?options: IHelpersUpdateOptions -> obj option
        abstract values: data: U2<obj, ResizeArray<obj>> * ?columns: QueryColumns<obj option> -> string
        abstract sets: data: obj * ?columns: QueryColumns<obj option> -> string
        abstract Column: obj with get, set
        abstract ColumnSet: obj with get, set
        abstract TableName: obj with get, set

    type [<AllowNullLiteral>] IHelpersUpdateOptions =
        abstract tableAlias: string option with get, set
        abstract valueAlias: string option with get, set
        abstract emptyUpdate: obj option with get, set

    type [<AllowNullLiteral>] IGenericPromise =
        [<Emit "$0($1...)">] abstract Invoke: cb: ((obj -> unit) -> (obj -> unit) -> unit) -> XPromise<obj option>
        abstract resolve: ?value: obj -> unit
        abstract reject: ?reason: obj -> unit
        abstract all: iterable: obj option -> XPromise<obj option>

    type [<AllowNullLiteral>] IBaseProtocolStreamXPromise =
        abstract processed: float with get, set
        abstract duration: float with get, set

    type [<AllowNullLiteral>] IFormattingCtf =
        abstract toPostgres: Symbol with get, set
        abstract rawType: Symbol with get, set

    type [<AllowNullLiteral>] IHelpersConcatArray =
        abstract query: U2<string, QueryFile> with get, set
        abstract values: obj option with get, set
        abstract options: IFormattingOptions option with get, set
