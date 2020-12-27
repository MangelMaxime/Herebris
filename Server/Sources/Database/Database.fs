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

module Utils =

    let sqlMap (value : 'a option) (f : 'a -> SqlValue) : SqlValue =
        Option.defaultValue SqlValue.Null (Option.map f value)


type ExecutionTarget =
    | Connection of Pg.Client
    | Pool of Pg.Pool
    // | Transaction of Pg

type SqlObjValue = obj

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

    member __.FailToRead (column : string, columnType : Builtins) =
        let availableColumns =
            columnDictionnary.Keys
            |> Seq.map (fun key ->
                sprintf "[%s:%s]" key (builtinsGetNames (columnTypes.[key]))
            )
            |> String.concat ", "

        sprintf "Could not read column '%s' as %s. Available columns are %s"
            column
            (builtinsGetNames columnType)
            availableColumns
        |> UnknownColumnException
        |> raise

    member __.Names = columnDictionnary

    member __.Types = columnTypes

type RowReader (o : obj, result : Pg.QueryResult, readerInfo : ReaderInfo) =

    member this.int (column : string) =
        match readerInfo.Names.TryGetValue column with
        | true, columnIndex ->
            match enum<Builtins> result.fields.[columnIndex].dataTypeID with
            | Builtins.INT4 ->
                fun o ->
                    o?(column) |> int
            | _ ->
                readerInfo.FailToRead(column, Builtins.INT4)
        | false, _ -> readerInfo.FailToRead(column, Builtins.INT4)

    member this.string (column : string) =
        match readerInfo.Names.TryGetValue column with
        | true, columnIndex ->
            match enum<Builtins> result.fields.[columnIndex].dataTypeID with
            | Builtins.TEXT
            | Builtins.VARCHAR ->
                o?(column) |> string
            | _ ->
                readerInfo.FailToRead(column, Builtins.INT4)
        | false, _ -> readerInfo.FailToRead(column, Builtins.INT4)

    member this.uuid (column : string) =
        match readerInfo.Names.TryGetValue column with
        | true, columnIndex ->
            match enum<Builtins> result.fields.[columnIndex].dataTypeID with
            | Builtins.UUID ->
                o?(column) |> string |> System.Guid
            | _ ->
                readerInfo.FailToRead(column, Builtins.UUID)
        | false, _ -> readerInfo.FailToRead(column, Builtins.UUID)

[<RequireQualifiedAccess>]
module Sql =
    let int (value : int) = SqlValue.Int value
    let intOrNone (value : int option) = Utils.sqlMap value int
    let string (value : string) = value :> SqlObjValue
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
                        JS.console.log(row)
                        let reader = RowReader(row, res, readerInfo)
                        read reader
                    )
                    |> Seq.toList
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
