// ts2fable 0.8.0
module rec PgMinify

open System
open Fable.Core
open Fable.Core.JS

type Error = System.Exception

let [<Import("*","pg-minify")>] pgMinify: PgMinify.IExports = jsNative

type [<AllowNullLiteral>] IExports =
    abstract pgMinify: sql: string * ?options: PgMinify.IMinifyOptions -> string

module PgMinify =

    type [<AllowNullLiteral>] IExports =
        abstract SQLParsingError: SQLParsingErrorStatic

    type [<AllowNullLiteral>] IMinifyOptions =
        abstract compress: bool option with get, set
        abstract removeAll: bool option with get, set

    type [<AllowNullLiteral>] IErrorPosition =
        abstract line: float with get, set
        abstract column: float with get, set

    type [<RequireQualifiedAccess>] parsingErrorCode =
        | UnclosedMLC = 0
        | UnclosedText = 1
        | UnclosedQI = 2
        | MultiLineQI = 3

    type [<AllowNullLiteral;AbstractClass>] SQLParsingError =
        inherit Error
        abstract name: string with get, set
        abstract message: string with get, set
        abstract stack: string with get, set
        abstract error: string with get, set
        abstract code: parsingErrorCode with get, set
        abstract position: IErrorPosition with get, set

    type [<AllowNullLiteral>] SQLParsingErrorStatic =
        [<EmitConstructor>] abstract Create: unit -> SQLParsingError
