module Page.Administration.Component

open Elmish
open Feliz

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
    model, Cmd.none

let view (model : Model) (dispatch : Dispatch<Msg>) =
    match model.CurrentPage with
    | Page.UserIndex subModel ->
        User.Index.Component.view subModel (UserIndexMsg >> dispatch)

    | Page.UserCreate subModel ->
        Html.text "TODO: user create"
