// ts2fable 0.8.0
module rec RangeParser
open System
open Fable.Core
open Fable.Core.JS

type Array<'T> = System.Collections.Generic.IList<'T>

let [<Import("*","module")>] rangeParser: RangeParser.IExports = jsNative

type [<AllowNullLiteral>] IExports =
    /// When ranges are returned, the array has a "type" property which is the type of
    /// range that is required (most commonly, "bytes"). Each array element is an object
    /// with a "start" and "end" property for the portion of the range.
    abstract RangeParser: size: float * str: string * ?options: RangeParser.Options -> U2<RangeParser.Result, RangeParser.Ranges>

module RangeParser =

    type [<AllowNullLiteral>] Ranges =
        inherit Array<Range>
        abstract ``type``: string with get, set

    type [<AllowNullLiteral>] Range =
        abstract start: float with get, set
        abstract ``end``: float with get, set

    type [<AllowNullLiteral>] Options =
        /// The "combine" option can be set to `true` and overlapping & adjacent ranges
        /// will be combined into a single range.
        abstract combine: bool option with get, set

    // Should be -1
    // d.ts: type ResultUnsatisfiable = -1;
    type ResultUnsatisfiable = int

    // Should be -2
    // d.ts: type ResultInvalid = -2;
    type ResultInvalid = int

    type Result =
        U2<ResultUnsatisfiable, ResultInvalid>
        