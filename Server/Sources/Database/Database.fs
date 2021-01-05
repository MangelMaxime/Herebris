namespace Database

open Pg
open Fable.Core
open Fable.Core.JsInterop
open System
open System.Text.RegularExpressions
open System.Collections.Generic
open Database.Postgres.Types

// module Env =

//     // TODO: Type check the env variable
//     let getEnvVariable (name : string)=
//         Node.Api.``process``.env?(name)

//     module Db =

//         let user : string = getEnvVariable "HEREBRIS_DB_USER"
//         let password : string = getEnvVariable "HEREBRIS_DB_PASSWORD"
//         let host : string = getEnvVariable "HEREBRIS_DB_HOST"
//         let port : int = getEnvVariable "HEREBRIS_DB_PORT" |> int
//         let database : string = getEnvVariable "HEREBRIS_DB_DATABASE"

exception MissingQueryException of string
exception NoResultsException of string
exception UnknownColumnException of string

[<RequireQualifiedAccess>]
type SqlValue =
    | Int of int
    | String of string
    | DateTime of System.DateTime
    | Bool of bool
    | Null


/// <summary>
/// Dummy type used to represent Sql value passed as parameters
/// We use `unbox<SqlObjValue>`  because `unbox` is erased in Fable. When testing with `value :> SqlObjValue` where `type SqlObjValue = obj` we add problems in the send types
///
/// Also, not aliasing `obj` make it harder for the user to pass an incorrect value
/// </summary>
type SqlObjValue =
    class end

module Utils =

    let sqlMap (value : 'a option) (f : 'a -> SqlObjValue) : SqlObjValue =
        Option.defaultValue (unbox<SqlObjValue> null) (Option.map f value)

type ExecutionTarget =
    | Connection of Pg.Client
    | Pool of Pg.Pool
    // | Transaction of Pg

type SqlBuilder = private {
    ExecutionTarget: ExecutionTarget
    SqlQuery : string
    Parameters : SqlObjValue list
}


type ReaderInfo (result : Pg.QueryResult) =
    let columnDictionnary = Dictionary<string, int>()
    let columnTypes = Dictionary<string, Builtins>()

    do
        for fieldIndex in [0 .. result.fields.Count - 1] do
            columnDictionnary.Add(result.fields.[fieldIndex].name, fieldIndex)
            columnTypes.Add(result.fields.[fieldIndex].name, enum<Builtins>result.fields.[fieldIndex].dataTypeID)

    member __.FailToRead (column : string, expectedType : string) =
        let availableColumns =
            columnDictionnary.Keys
            |> Seq.map (fun key ->
                sprintf "[%s:%s]" key (builtinsGetNames (columnTypes.[key]))
            )
            |> String.concat ", "

        sprintf "Could not read column '%s' as %s. Available columns are %s"
            column
            expectedType
            availableColumns
        |> UnknownColumnException
        |> raise

    member __.Names = columnDictionnary

    member __.Types = columnTypes

// Data type documentation: https://www.postgresql.org/docs/9.5/datatype.html

// Check if we should support TEXT for and try to parse the result
// The idea is that it seems like if the expected type is unkown pg use TEXT oid by default

type RowReader (o : obj, result : Pg.QueryResult, readerInfo : ReaderInfo) =

    member __.bool (column : string) =
        match readerInfo.Names.TryGetValue column with
        | true, columnIndex ->
            match enum<Builtins> result.fields.[columnIndex].dataTypeID with
            | Builtins.BOOL ->
                unbox<bool> o?(column)
            | _ ->
                readerInfo.FailToRead(column, "bool")
        | false, _ -> readerInfo.FailToRead(column, "bool")

    member __.boolOrNone (column : string) =
        match readerInfo.Names.TryGetValue column with
        | true, columnIndex ->
            match enum<Builtins> result.fields.[columnIndex].dataTypeID with
            | Builtins.BOOL ->
                let value = o?(column)
                if isNull value then
                    None
                else
                    unbox<bool> value |> Some
            | _ ->
                readerInfo.FailToRead(column, "bool")
        | false, _ -> readerInfo.FailToRead(column, "bool")

    member __.int (column : string) =
        match readerInfo.Names.TryGetValue column with
        | true, columnIndex ->
            match enum<Builtins> result.fields.[columnIndex].dataTypeID with
            | Builtins.INT4 ->
                o?(column) |> int
            | _ ->
                readerInfo.FailToRead(column, "int")
        | false, _ -> readerInfo.FailToRead(column, "int")

    member __.string (column : string) =
        match readerInfo.Names.TryGetValue column with
        | true, columnIndex ->
            match enum<Builtins> result.fields.[columnIndex].dataTypeID with
            | Builtins.TEXT
            | Builtins.VARCHAR ->
                o?(column) |> string
            | _ ->
                readerInfo.FailToRead(column, "string")
        | false, _ -> readerInfo.FailToRead(column, "string")

    member __.stringOrNone (column : string) =
        match readerInfo.Names.TryGetValue column with
        | true, columnIndex ->
            match enum<Builtins> result.fields.[columnIndex].dataTypeID with
            | Builtins.TEXT
            | Builtins.VARCHAR ->
                let value = o?(column)
                if isNull value then
                    None
                else
                    value |> string |> Some
            | _ ->
                readerInfo.FailToRead(column, "string")
        | false, _ -> readerInfo.FailToRead(column, "string")

    member __.uuid (column : string) =
        match readerInfo.Names.TryGetValue column with
        | true, columnIndex ->
            match enum<Builtins> result.fields.[columnIndex].dataTypeID with
            | Builtins.UUID ->
                o?(column) |> string |> System.Guid
            | _ ->
                readerInfo.FailToRead(column, "uuid")
        | false, _ -> readerInfo.FailToRead(column, "uuid")

    member __.float (column : string) =
        match readerInfo.Names.TryGetValue column with
        | true, columnIndex ->
            match enum<Builtins> result.fields.[columnIndex].dataTypeID with
            | Builtins.FLOAT4 ->
                o?(column) |> float
            | _ ->
                readerInfo.FailToRead(column, "float")
        | false, _ -> readerInfo.FailToRead(column, "float")

    member __.decimal (column : string) =
        match readerInfo.Names.TryGetValue column with
        | true, columnIndex ->
            match enum<Builtins> result.fields.[columnIndex].dataTypeID with
            | Builtins.FLOAT8 ->
                o?(column) |> decimal
            | _ ->
                readerInfo.FailToRead(column, "decimal")
        | false, _ -> readerInfo.FailToRead(column, "decimal")

    member __.datetime (column : string) =
        match readerInfo.Names.TryGetValue column with
        | true, columnIndex ->
            match enum<Builtins> result.fields.[columnIndex].dataTypeID with
            | Builtins.TIMESTAMPTZ ->
                // Fable DateTime is using Date for the runtime representation
                o?(column) |> unbox<DateTime>
            | _ ->
                readerInfo.FailToRead(column, "datetime")
        | false, _ -> readerInfo.FailToRead(column, "datetime")

[<RequireQualifiedAccess>]
module Sql =
    let nil = unbox<SqlObjValue> null
    let bool (value : bool) = value |> unbox<SqlObjValue>
    let boolOrNone (value : bool option) = Utils.sqlMap value bool
    let int (value : int) = value |> unbox<SqlObjValue>
    // let intOrNone (value : int option) = Utils.sqlMap value int
    let float (value : float) = value |> unbox<SqlObjValue>
    let decimal (value : decimal) = value.ToString() |> unbox<SqlObjValue>
    let datetime (value : DateTime) = value |> unbox<SqlObjValue>
    let string (value : string) = value |> unbox<SqlObjValue>
    // let stringOrNone (value : string option) = Utils.sqlMap value string

    let beginTransaction () =
        promise {
            return ""
        }

    let connectFromPool (pool : Pg.Pool) =
        {
            ExecutionTarget = Pool pool
            SqlQuery = ""
            Parameters = []
        }

    let query (query : string) (sqlBuilder : SqlBuilder) =
        { sqlBuilder with
            SqlQuery = query
        }

    let parameters (value : SqlObjValue list) (sqlBuilder : SqlBuilder) =
        { sqlBuilder with
            Parameters =
                value // Perhaps, we need to do some conversion on the value to make it match JavaScript expected type

            // sqlBuilder.Parameters @ [ unbox value ] // Perhaps, we need to do some conversion on the value to make it match JavaScript expected type
        }

    let execute (read : RowReader -> 'Value) (sqlBuilder : SqlBuilder) : JS.Promise<'Value list> =
        promise {
            if String.IsNullOrEmpty sqlBuilder.SqlQuery then
                raise (MissingQueryException "No query provided. Please use Sql.query")

            match sqlBuilder.ExecutionTarget with
            | Pool pool ->
                let! (res : Pg.QueryResult<obj>) = pool.query(sqlBuilder.SqlQuery, sqlBuilder.Parameters |> List.toArray)
                // let mutable i = -1
                // let arr = Array.zeroCreate tokens.Length
                // let row = res.rows.[0]

                let readerInfo = ReaderInfo(res)

                return
                    res.rows
                    |> Seq.map (fun row ->
                        let reader = RowReader(row, res, readerInfo)
                        read reader
                    )
                    |> Seq.toList
            | _ ->
                return failwith "Not implemented"
        }

    let executeNonQuery (sqlBuilder : SqlBuilder) : JS.Promise<unit> =
        promise {
            if String.IsNullOrEmpty sqlBuilder.SqlQuery then
                raise (MissingQueryException "No query provided. Please use Sql.query")

            match sqlBuilder.ExecutionTarget with
            | Pool pool ->
                let! (res : Pg.QueryResult<obj>) = pool.query(sqlBuilder.SqlQuery, sqlBuilder.Parameters |> List.toArray)
                return ()
            | _ ->
                return failwith "Not implemented"
        }

    let executeRow (read : RowReader -> 'Value) (sqlBuilder : SqlBuilder) : JS.Promise<'Value> =
        promise {
            if String.IsNullOrEmpty sqlBuilder.SqlQuery then
                raise (MissingQueryException "No query provided. Please use Sql.query")

            match sqlBuilder.ExecutionTarget with
            | Pool pool ->
                let! (res : Pg.QueryResult<obj>) = pool.query(sqlBuilder.SqlQuery, sqlBuilder.Parameters |> List.toArray)
                // let mutable i = -1
                // let arr = Array.zeroCreate tokens.Length
                // let row = res.rows.[0]

                let readerInfo = ReaderInfo(res)

                JS.console.log(res)

                if res.rowCount < 1 then
                    failwith "Expected at least one row to be returned. Instead got an empty result"

                let reader = RowReader(res.rows.[0], res, readerInfo)
                return read reader
            | _ ->
                return failwith "Not implemented"
        }

        // promise {
        //     if String.IsNullOrEmpty sqlBuilder.SqlQuery then
        //         raise (MissingQueryException "No query provided. Please use Sql.query")
        //     // let parameters =
        //     //     sqlBuilder.Parameters
        //     //     |> List.map (fun parameter ->
        //     //         match parameter with
        //     //         | SqlValue.String value -> $"'{value}'"
        //     //         | SqlValue.Int value -> $"{value}"
        //     //         | SqlValue.DateTime value -> value.ToString("O")
        //     //         | SqlValue.Bool true -> "t"
        //     //         | SqlValue.Bool false -> "f"
        //     //         | SqlValue.Null -> "NULL"
        //     //     )
        //     //     |> List.toArray

        //     let pattern = "@([a-zA-Z]+)"
        //     let matchEvaluator =
        //         MatchEvaluator(fun m ->
        //             let parameterName = m.Groups.[1].Value
        //             match Map.tryFind parameterName sqlBuilder.Parameters with
        //             | Some parameter ->
        //                 match parameter with
        //                 | SqlValue.String value -> $"'{value}'"
        //                 | SqlValue.Int value -> $"{value}"
        //                 | SqlValue.DateTime value -> value.ToString("O")
        //                 | SqlValue.Bool true -> "t"
        //                 | SqlValue.Bool false -> "f"
        //                 | SqlValue.Null -> "NULL"
        //             | None ->
        //                 $"The query is using parameter {parameterName} but it has not been provided. Please add it using:\nSql.parameters [\n... \"{parameterName}\", <value>\n...\n]"
        //                 // raise (MissingParameterException "")
        //         )

        //     let computedQuery = Regex.Replace(sqlBuilder.SqlQuery, pattern, matchEvaluator)

            // "".Replace


        // }

type Pool private () =

    static let pool =
        let config =
            jsOptions<Pg.PoolConfig>(fun o ->
                // o.user <- Env.Db.user
                // o.password <- !^ Env.Db.password
                // o.host <- Env.Db.host
                // o.database <- Env.Db.database
                // o.port <- Env.Db.port
                o.min <- 0
                o.max <- 10
                o.idleTimeoutMillis <- 3000
                o.idle_in_transaction_session_timeout <- 3000
            )

        let pool = Pg.defaults.Pool.Create(config)

        pool.on("connect", fun client ->
            printfn "Connection established"
        ) |> ignore

        pool.on_error(fun error client ->
            printfn "An error occured in the pool:\n%s" error.Message
        ) |> ignore

        pool

    static member Instance = pool

    static member query (query : string) =
        promise {
            return! pool.query(query)
        }

    static member query<'Params> (query : string, parameters : 'Params array)=
        promise {
            return! pool.query(query, parameters)
        }
