module Tests.Database.Sql

open Fable.Mocha
open Fable.Mocha.Extensions
open System

open Database

let pool = Pg.Pg.defaults.Pool.Create()

let tests =
    testList "Database.Sql" [
        testList "Basic" [

            testCasePromise "Basic setup of " <|
                promise {
                    do!
                        pool
                        |> Sql.connectFromPool
                        |> Sql.query
                            """
drop schema if exists dts;
create schema dts;
                            """
                        |> Sql.executeNonQuery
                }
        ]

        testList "Types reader" [

            testCasePromise "read.string works" <|
                promise {
                    let expected = "hello from the server"
                    let! res =
                        pool
                        |> Sql.connectFromPool
                        |> Sql.query
                            """
SELECT $1 as value;
                            """
                        |> Sql.parameters [
                            Sql.string expected
                        ]
                        |> Sql.execute (fun read ->
                            read.string "value"
                        )

                    Expect.equal res.Head expected ""
                }

            testCasePromise "read.int works" <|
                promise {
                    let expected = 42
                    let! res =
                        pool
                        |> Sql.connectFromPool
                        |> Sql.query
                            """
SELECT $1::int as value;
                            """
                        |> Sql.parameters [
                            Sql.int expected
                        ]
                        |> Sql.execute (fun read ->
                            read.int "value"
                        )

                    Expect.equal res.Head expected ""
                }

            testCasePromise "read.float works" <|
                promise {
                    let expected = 42.
                    let! res =
                        pool
                        |> Sql.connectFromPool
                        |> Sql.query
                            """
SELECT $1::float4 as value;
                            """
                        |> Sql.parameters [
                            Sql.float expected
                        ]
                        |> Sql.execute (fun read ->
                            read.float "value"
                        )

                    Expect.equal res.Head expected ""
                }

            testCasePromise "read.decimal works" <|
                promise {
                    let expected = 42.48M
                    let! res =
                        pool
                        |> Sql.connectFromPool
                        |> Sql.query
                            """
SELECT $1::float8 as value;
                            """
                        |> Sql.parameters [
                            Sql.decimal expected
                        ]
                        |> Sql.execute (fun read ->
                            read.decimal "value"
                        )

                    Expect.equal res.Head expected ""
                }


            testCasePromise "read.bool works" <|
                promise {
                    let expected = true
                    let! res =
                        pool
                        |> Sql.connectFromPool
                        |> Sql.query
                            """
SELECT true as value;
                            """
                        |> Sql.execute (fun read ->
                            read.bool "value"
                        )

                    Expect.equal res.Head expected ""
                }

            testCasePromise "read.boolOrNone works for Some value" <|
                promise {
                    let expected = Some false
                    let! res =
                        pool
                        |> Sql.connectFromPool
                        |> Sql.query
                            """
SELECT false as value;
                            """
                        |> Sql.execute (fun read ->
                            read.boolOrNone "value"
                        )

                    Expect.equal res.Head expected ""
                }

            testCasePromise "read.boolOrNone works for None" <|
                promise {
                    let expected = None
                    let! res =
                        pool
                        |> Sql.connectFromPool
                        |> Sql.query
                            """
SELECT NULL::bool as value;
                            """
                        |> Sql.execute (fun read ->
                            read.boolOrNone "value"
                        )

                    Expect.equal res.Head expected ""
                }

            testCasePromise "read.datetime works" <|
                promise {
                    let expected = DateTime(2020, 12, 17, 12, 45, 33)
                    let! res =
                        pool
                        |> Sql.connectFromPool
                        |> Sql.query
                            """
SELECT $1::timestamptz as value;
                            """
                        |> Sql.parameters [
                            Sql.datetime expected
                        ]
                        |> Sql.execute (fun read ->
                            read.datetime "value"
                        )

                    Expect.equal res.Head expected ""
                }

        ]
    ]
