module Page.Administration.Component

open Elmish
open Feliz
open Fable.Core

[<RequireQualifiedAccess>]
type Page =
    | UserIndex of User.Index.Component.Model
    | UserCreate of User.Create.Component.Model

[<RequireQualifiedAccess>]
type Menu =
    | User

type Model =
    {
        CurrentPage : Page
        ActiveMenu : Menu
    }

type Msg =
    | UserIndexMsg of User.Index.Component.Msg

let init (route : Router.AdministrationUrl) =
    match route with
    | Router.AdministrationUrl.UserIndex pageRank ->
        let (userModel, userCmd) = User.Index.Component.init ()
        {
            CurrentPage = Page.UserIndex userModel
            ActiveMenu = Menu.User
        }
        , Cmd.map UserIndexMsg userCmd

let update (msg : Msg) (model : Model) =
    match msg, model.CurrentPage with
    | UserIndexMsg subMsg, Page.UserIndex subModel ->
        let newSubModel, subCmd = User.Index.Component.update subMsg subModel
        { model with
            CurrentPage = Page.UserIndex newSubModel
        }
        , Cmd.map UserIndexMsg subCmd

    | discardedMsg , _ ->
        JS.console.warn("Administration | message discarded: ", string discardedMsg)

        model
        , Cmd.none


let view (model : Model) (dispatch : Dispatch<Msg>) =
    match model.CurrentPage with
    | Page.UserIndex subModel ->
        User.Index.Component.view subModel (UserIndexMsg >> dispatch)

    | Page.UserCreate subModel ->
        Html.text "TODO: user create"
