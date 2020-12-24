module Fable.Mocha.Extensions

open Fable.Mocha
open Fable.Core

let testCasePromise testName promise = 
    testCaseAsync testName (Async.AwaitPromise promise)
 
