module rec Express

// ts2fable 0.8.0
open System
open Fable.Core
open Fable.Core.JS

//module BodyParser = Body_parser
//module ServeStatic = Serve_static
module Core = ServeServeStaticCore

let [<Import("*","express")>] e: E.IExports = jsNative

[<Import("default", "express")>]
let express : IExports = jsNative

type [<AllowNullLiteral>] IExports =
    /// Creates an Express application. The express() function is a top-level function exported by the express module.
    [<Emit("$0()")>]
    abstract Invoke: unit -> ServeServeStaticCore.Express

module E =

    type [<AllowNullLiteral>] IExports =
        abstract json: obj
        abstract raw: obj
        abstract text: obj
        abstract application: Application
        abstract request: Request
        abstract response: Response
        abstract ``static``: ServeStatic.ServeStatic.RequestHandlerConstructor<Response>
        abstract urlencoded: obj
        /// This is a built-in middleware function in Express. It parses incoming request query parameters.
//        abstract query: options: U2<Qs.QueryString.IParseOptions, obj> -> Handler
        abstract Router: ?options: RouterOptions -> Core.Router

    type [<AllowNullLiteral>] RouterOptions =
        /// Enable case sensitivity.
        abstract caseSensitive: bool option with get, set
        /// Preserve the req.params values from the parent router.
        /// If the parent and the child have conflicting param names, the child’s value take precedence.
        abstract mergeParams: bool option with get, set
        /// Enable strict routing.
        abstract strict: bool option with get, set

    type [<AllowNullLiteral>] Application =
        inherit Core.Application

    type [<AllowNullLiteral>] CookieOptions =
        inherit Core.CookieOptions

    type [<AllowNullLiteral>] Errback =
        inherit Core.Errback

    type ErrorRequestHandler =
        ErrorRequestHandler<Core.ParamsDictionary, obj option, obj option, Core.Query>

    type ErrorRequestHandler<'P> =
        ErrorRequestHandler<'P, obj option, obj option, Core.Query>

    type ErrorRequestHandler<'P, 'ResBody> =
        ErrorRequestHandler<'P, 'ResBody, obj option, Core.Query>

    type ErrorRequestHandler<'P, 'ResBody, 'ReqBody> =
        ErrorRequestHandler<'P, 'ResBody, 'ReqBody, Core.Query>

    type [<AllowNullLiteral>] ErrorRequestHandler<'P, 'ResBody, 'ReqBody, 'ReqQuery> =
        inherit Core.ErrorRequestHandler<'P, 'ResBody, 'ReqBody, 'ReqQuery>

    type [<AllowNullLiteral>] Express =
        inherit Core.Express

//    type [<AllowNullLiteral>] Handler =
//        inherit Core.Handler

    type [<AllowNullLiteral>] IRoute =
        inherit Core.IRoute

    type [<AllowNullLiteral>] IRouter =
        inherit Core.IRouter

    type [<AllowNullLiteral>] IRouterHandler<'T> =
        inherit Core.IRouterHandler<'T>

    type [<AllowNullLiteral>] IRouterMatcher<'T> =
        inherit Core.IRouterMatcher<'T>

    type [<AllowNullLiteral>] MediaType =
        inherit Core.MediaType

//    type [<AllowNullLiteral>] NextFunction =
//        inherit Core.NextFunction

    type Request =
        Request<Core.ParamsDictionary, obj option, obj option, Core.Query>

    type Request<'P> =
        Request<'P, obj option, obj option, Core.Query>

    type Request<'P, 'ResBody> =
        Request<'P, 'ResBody, obj option, Core.Query>

    type Request<'P, 'ResBody, 'ReqBody> =
        Request<'P, 'ResBody, 'ReqBody, Core.Query>

    type [<AllowNullLiteral>] Request<'P, 'ResBody, 'ReqBody, 'ReqQuery> =
        inherit Core.Request<'P, 'ResBody, 'ReqBody, 'ReqQuery>

//    type RequestHandler =
//        RequestHandler<Core.ParamsDictionary, obj option, obj option, Core.Query>
//
//    type RequestHandler<'P> =
//        RequestHandler<'P, obj option, obj option, Core.Query>
//
//    type RequestHandler<'P, 'ResBody> =
//        RequestHandler<'P, 'ResBody, obj option, Core.Query>
//
//    type RequestHandler<'P, 'ResBody, 'ReqBody> =
//        RequestHandler<'P, 'ResBody, 'ReqBody, Core.Query>
//
//    type [<AllowNullLiteral>] RequestHandler<'P, 'ResBody, 'ReqBody, 'ReqQuery> =
//        inherit Core.RequestHandler<'P, 'ResBody, 'ReqBody, 'ReqQuery>

//    type [<AllowNullLiteral>] RequestParamHandler =
//        inherit Core.RequestParamHandler

    type Response =
        Response<obj option>

    type [<AllowNullLiteral>] Response<'ResBody> =
        inherit Core.Response<'ResBody>

    type [<AllowNullLiteral>] Router =
        inherit Core.Router

    type [<AllowNullLiteral>] Send =
        inherit Core.Send

