module Page.Administration.User.Index.Component

open Elmish
open Feliz

type Model = int

type Msg =
    | NoOp

let init () =
    2, Cmd.none

let update (msg : Msg) (model : Model) : Model * Cmd<Msg> =
    match msg with
    | NoOp ->
        model, Cmd.none

let view (model : Model) (dispatch : Dispatch<Msg>) =
    Html.text "user index"
