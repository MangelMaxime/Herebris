module Fable.Mocha.Extensions

open Fable.Mocha
open Fable.Core

let testCasePromise testName promise =
    testCaseAsync testName (Async.AwaitPromise promise)

let ftestCasePromise testName promise =
    ftestCaseAsync testName (Async.AwaitPromise promise)

[<Global>]
let it (msg: string) (f: (obj->unit)->unit): unit = jsNative

[<Global>]
let describe (msg: string) (f: unit->unit): unit = jsNative

[<Global>]
let before (f: unit->unit): unit = jsNative

[<Global>]
let after (f: unit->unit): unit = jsNative
