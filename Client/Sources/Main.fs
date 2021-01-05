module Herebris.Client.Component

open Feliz
open Feliz.Router
open Thoth.Json
open Elmish
open Fable.Core

module Administration = Page.Administration.Component

[<RequireQualifiedAccess>]
type Page =
    | Administration of Administration.Model
    | Loading

type Model =
    {
        CurrentRoute : Router.Url
        ActivePage : Page
    }

type Msg =
    | RouteChanged of Router.Url
    | AdministrationMsg of Administration.Msg

let routeChanged (route : Router.Url) (model : Model) =
    let model =
        { model with
            CurrentRoute = route
        }

    match route with
    | Router.Url.Home ->
        // TODO
        model
        , Cmd.none

    | Router.Url.NotFound ->
        // TODO
        model
        , Cmd.none

    | Router.Url.Administration adminRoute ->
        let (subModel, subCmd) = Administration.init adminRoute
        { model with
            ActivePage =
                subModel
                |> Page.Administration
        }
        , Cmd.map AdministrationMsg subCmd

let update (msg : Msg) (model : Model) =
    match model.ActivePage, msg with
    | _, RouteChanged nextPage ->
        routeChanged nextPage model

    | Page.Administration subModel, AdministrationMsg subMsg ->
        printfn "hijojo"
        let (newSubModel, subCmd) = Administration.update subMsg subModel

        { model with
            ActivePage = Page.Administration newSubModel
        }
        , Cmd.map AdministrationMsg subCmd

    | _, discardedMsg ->
        JS.console.warn("Message discarded:\n", string discardedMsg)

        model
        , Cmd.none

let init () =
    let initialModel =
        {
            CurrentRoute = Router.Url.Home
            ActivePage = Page.Loading
        }

    let segments =
        Router.currentUrl()
        |> Router.parseUrl

    routeChanged segments initialModel

let view (model : Model) (dispatch : Dispatch<Msg>) =
    let currentRoute =
        match model.ActivePage with
        | Page.Loading ->
            Html.text "Loading..."

        | Page.Administration subModel ->
            Html.div [
                Administration.view subModel (AdministrationMsg >> dispatch)
            ]

    React.router [
        router.onUrlChanged (Router.parseUrl >> RouteChanged >> dispatch)
        router.children currentRoute
    ]

open Elmish.React

#if DEBUG
open Elmish.HMR
#endif

Program.mkProgram init update view
|> Program.withReactSynchronous "root"
|> Program.run
