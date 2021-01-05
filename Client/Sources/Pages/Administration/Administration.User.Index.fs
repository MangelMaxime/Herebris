module Page.Administration.User.Index.Component

open Elmish
open Feliz

type Model = int

type Msg =
    | NoOp
    | Clicked

let init () =
    2, Cmd.none

let update (msg : Msg) (model : Model) : Model * Cmd<Msg> =
    match msg with
    | NoOp ->
        model
        , Cmd.none

    | Clicked ->
        model + 3
        , Cmd.none


let view (model : Model) (dispatch : Dispatch<Msg>) =
    Html.div [
        prop.children [
            Html.button [
                prop.onClick (fun _ ->
                    printfn "dzjidddddddojo22"
                    dispatch Clicked
                )
            ]
            Html.br [ ]
            Html.text (string model)
        ]
    ]
