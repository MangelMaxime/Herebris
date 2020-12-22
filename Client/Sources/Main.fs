module Herebris.Client

open Feliz

[<ReactComponent>]
let App (props : {| Foo : string |}) =
    Html.div [
        prop.children [
            Html.text props.Foo
            Html.button [
                prop.onClick (fun _ ->
                    printfn "clicked"    
                )
                prop.text "Cli2ck me"
            ]   
        ]
    ]
    
    