// ts2fable 0.8.0
module rec Dotenv
open System
open Fable.Core
open Fable.Core.JS

type Error = System.Exception

let [<Import("load","dotenv")>] load: obj = jsNative

let [<Import("default", "dotenv")>] e : IExports = jsNative

type [<AllowNullLiteral>] IExports =
    /// <summary>Parses a string or buffer in the .env file format into an object.</summary>
    /// <param name="src">- contents to be parsed</param>
    /// <param name="options">- additional options</param>
    abstract parse: src: U2<string, Buffer> * ?options: DotenvParseOptions -> DotenvParseOutput
    /// <summary>Loads `.env` file contents into {@link https://nodejs.org/api/process.html#process_process_env | `process.env`}.
    /// Example: 'KEY=value' becomes { parsed: { KEY: 'value' } }</summary>
    /// <param name="options">- controls behavior</param>
    abstract config: ?options: DotenvConfigOptions -> DotenvConfigOutput

type [<AllowNullLiteral>] DotenvParseOptions =
    /// You may turn on logging to help debug why certain keys or values are not being set as you expect.
    abstract debug: bool option with get, set

type [<AllowNullLiteral>] DotenvParseOutput =
    [<EmitIndexer>] abstract Item: name: string -> string with get, set

type [<AllowNullLiteral>] DotenvConfigOptions =
    /// You may specify a custom path if your file containing environment variables is located elsewhere.
    abstract path: string with get, set
    /// You may specify the encoding of your file containing environment variables.
    abstract encoding: string with get, set
    /// You may turn on logging to help debug why certain keys or values are not being set as you expect.
    abstract debug: bool with get, set

type [<AllowNullLiteral>] DotenvConfigOutput =
    abstract error: Error option with get, set
    abstract parsed: DotenvParseOutput option with get, set

/// dotenv library interface
type [<AllowNullLiteral>] DotEnv =
    abstract config: obj with get, set
    abstract parse: obj with get, set
