// ts2fable 0.8.0
module rec Spex

open System
open Fable.Core
open Fable.Core.JS

type Array<'T> = System.Collections.Generic.IList<'T>
type Error = System.Exception

let [<Import("*","spex")>] spex: Spex.IExports = jsNative

type [<AllowNullLiteral>] IExports =
    abstract spex: promise: obj option -> Spex.ISpex

module Spex =
    let [<Import("errors","module/spex")>] errors: Errors.IExports = jsNative

    type [<AllowNullLiteral>] IExports =
        abstract PromiseAdapter: PromiseAdapterStatic

    type [<AllowNullLiteral>] IOriginData =
        abstract success: bool
        abstract result: obj option

    type [<AllowNullLiteral>] IBatchData =
        abstract success: bool
        abstract result: obj option
        abstract origin: IOriginData option

    type [<AllowNullLiteral>] IBatchStat =
        abstract total: float
        abstract succeeded: float
        abstract failed: float
        abstract duration: float

    type [<AllowNullLiteral>] IStreamReadOptions =
        abstract closable: bool option with get, set
        abstract readChunks: bool option with get, set
        abstract readSize: float option with get, set

    type [<AllowNullLiteral>] IStreamReadResult =
        abstract calls: float
        abstract reads: float
        abstract length: float
        abstract duration: float

    type [<AllowNullLiteral>] IPageResult =
        abstract pages: float
        abstract total: float
        abstract duration: float

    type [<AllowNullLiteral>] ISequenceResult =
        abstract total: float
        abstract duration: float

    type [<AllowNullLiteral>] IArrayExt<'T> =
        inherit Array<'T>
        abstract duration: float

    module Errors =

        type [<AllowNullLiteral>] IExports =
            abstract BatchError: BatchErrorStatic
            abstract PageError: PageErrorStatic
            abstract SequenceError: SequenceErrorStatic

        type [<AllowNullLiteral;AbstractClass>] BatchError =
            inherit Error
            abstract name: string with get, set
            abstract message: string with get, set
            abstract stack: string with get, set
            abstract data: Array<IBatchData> with get, set
            abstract stat: IBatchStat with get, set
            abstract first: obj option with get, set
            abstract getErrors: unit -> Array<obj option>
            abstract toString: unit -> string

        type [<AllowNullLiteral>] BatchErrorStatic =
            [<EmitConstructor>] abstract Create: unit -> BatchError

        type [<AllowNullLiteral;AbstractClass>] PageError =
            inherit Error
            abstract name: string with get, set
            abstract message: string with get, set
            abstract stack: string with get, set
            abstract error: obj option with get, set
            abstract index: float with get, set
            abstract duration: float with get, set
            abstract reason: string with get, set
            abstract source: obj option with get, set
            abstract dest: obj option with get, set
            abstract toString: unit -> string

        type [<AllowNullLiteral>] PageErrorStatic =
            [<EmitConstructor>] abstract Create: unit -> PageError

        type [<AllowNullLiteral;AbstractClass>] SequenceError =
            inherit Error
            abstract name: string with get, set
            abstract message: string with get, set
            abstract stack: string with get, set
            abstract error: obj option with get, set
            abstract index: float with get, set
            abstract duration: float with get, set
            abstract reason: string with get, set
            abstract source: obj option with get, set
            abstract dest: obj option with get, set
            abstract toString: unit -> string

        type [<AllowNullLiteral>] SequenceErrorStatic =
            [<EmitConstructor>] abstract Create: unit -> SequenceError

    type [<AllowNullLiteral>] IStream =
        abstract read: stream: obj option * receiver: (float -> Array<obj option> -> float -> obj option) * ?options: IStreamReadOptions -> Promise<IStreamReadResult>

    type [<AllowNullLiteral>] PromiseAdapter =
        interface end

    type [<AllowNullLiteral>] PromiseAdapterStatic =
        [<EmitConstructor>] abstract Create: create: (obj option -> obj) * resolve: (obj option -> unit) * reject: (obj option -> unit) -> PromiseAdapter

    type [<AllowNullLiteral>] ISpexBase =
        abstract batch: values: ResizeArray<U2<'T, Promise<'T>>> * ?options: ISpexBaseBatchOptions -> Promise<IArrayExt<'T>>
        abstract batch: values: U2<'T1, Promise<'T1>> * U2<'T2, Promise<'T2>> * ?options: ISpexBaseBatchOptions_ -> Promise<obj>
        abstract batch: values: U2<'T1, Promise<'T1>> * U2<'T2, Promise<'T2>> * U2<'T3, Promise<'T3>> * ?options: ISpexBaseBatchOptions__ -> Promise<obj>
        abstract batch: values: U2<'T1, Promise<'T1>> * U2<'T2, Promise<'T2>> * U2<'T3, Promise<'T3>> * U2<'T4, Promise<'T4>> * ?options: ISpexBaseBatchOptions___ -> Promise<obj>
        abstract batch: values: U2<'T1, Promise<'T1>> * U2<'T2, Promise<'T2>> * U2<'T3, Promise<'T3>> * U2<'T4, Promise<'T4>> * U2<'T5, Promise<'T5>> * ?options: ISpexBaseBatchOptions____ -> Promise<obj>
        abstract batch: values: U2<'T1, Promise<'T1>> * U2<'T2, Promise<'T2>> * U2<'T3, Promise<'T3>> * U2<'T4, Promise<'T4>> * U2<'T5, Promise<'T5>> * U2<'T6, Promise<'T6>> * ?options: ISpexBaseBatchOptions_____ -> Promise<obj>
        abstract batch: values: U2<'T1, Promise<'T1>> * U2<'T2, Promise<'T2>> * U2<'T3, Promise<'T3>> * U2<'T4, Promise<'T4>> * U2<'T5, Promise<'T5>> * U2<'T6, Promise<'T6>> * U2<'T7, Promise<'T7>> * ?options: ISpexBaseBatchOptions______ -> Promise<obj>
        abstract batch: values: U2<'T1, Promise<'T1>> * U2<'T2, Promise<'T2>> * U2<'T3, Promise<'T3>> * U2<'T4, Promise<'T4>> * U2<'T5, Promise<'T5>> * U2<'T6, Promise<'T6>> * U2<'T7, Promise<'T7>> * U2<'T8, Promise<'T8>> * ?options: ISpexBaseBatchOptions_______ -> Promise<obj>
        abstract batch: values: U2<'T1, Promise<'T1>> * U2<'T2, Promise<'T2>> * U2<'T3, Promise<'T3>> * U2<'T4, Promise<'T4>> * U2<'T5, Promise<'T5>> * U2<'T6, Promise<'T6>> * U2<'T7, Promise<'T7>> * U2<'T8, Promise<'T8>> * U2<'T9, Promise<'T9>> * ?options: ISpexBaseBatchOptions________ -> Promise<obj>
        abstract batch: values: U2<'T1, Promise<'T1>> * U2<'T2, Promise<'T2>> * U2<'T3, Promise<'T3>> * U2<'T4, Promise<'T4>> * U2<'T5, Promise<'T5>> * U2<'T6, Promise<'T6>> * U2<'T7, Promise<'T7>> * U2<'T8, Promise<'T8>> * U2<'T9, Promise<'T9>> * U2<'T10, Promise<'T10>> * ?options: ISpexBaseBatchOptions_________ -> Promise<obj>
        abstract page: source: (float -> obj option -> float -> obj option) * ?options: ISpexBasePageOptions -> Promise<IPageResult>
        abstract sequence: source: (float -> obj option -> float -> obj option) * ?options: ISpexBaseSequenceOptions -> Promise<U2<ISequenceResult, IArrayExt<obj option>>>

    type [<AllowNullLiteral>] ISpexBaseBatchOptions =
        abstract cb: (float -> bool -> obj option -> float -> obj option) option with get, set

    type [<AllowNullLiteral>] ISpexBaseBatchOptions_ =
        abstract cb: (float -> bool -> obj option -> float -> obj option) option with get, set

    type [<AllowNullLiteral>] ISpexBaseBatchOptions__ =
        abstract cb: (float -> bool -> obj option -> float -> obj option) option with get, set

    type [<AllowNullLiteral>] ISpexBaseBatchOptions___ =
        abstract cb: (float -> bool -> obj option -> float -> obj option) option with get, set

    type [<AllowNullLiteral>] ISpexBaseBatchOptions____ =
        abstract cb: (float -> bool -> obj option -> float -> obj option) option with get, set

    type [<AllowNullLiteral>] ISpexBaseBatchOptions_____ =
        abstract cb: (float -> bool -> obj option -> float -> obj option) option with get, set

    type [<AllowNullLiteral>] ISpexBaseBatchOptions______ =
        abstract cb: (float -> bool -> obj option -> float -> obj option) option with get, set

    type [<AllowNullLiteral>] ISpexBaseBatchOptions_______ =
        abstract cb: (float -> bool -> obj option -> float -> obj option) option with get, set

    type [<AllowNullLiteral>] ISpexBaseBatchOptions________ =
        abstract cb: (float -> bool -> obj option -> float -> obj option) option with get, set

    type [<AllowNullLiteral>] ISpexBaseBatchOptions_________ =
        abstract cb: (float -> bool -> obj option -> float -> obj option) option with get, set

    type [<AllowNullLiteral>] ISpexBasePageOptions =
        abstract dest: (float -> obj option -> float -> obj option) option with get, set
        abstract limit: float option with get, set

    type [<AllowNullLiteral>] ISpexBaseSequenceOptions =
        abstract dest: (float -> obj option -> float -> obj option) option with get, set
        abstract limit: float option with get, set
        abstract track: bool option with get, set

    type [<AllowNullLiteral>] ISpex =
        inherit ISpexBase
        abstract stream: IStream
        abstract errors: obj
