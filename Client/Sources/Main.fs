module Herebris.Client

open Feliz
open Thoth.Json

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

promise {
    let decoder =
        Decode.field "name" Decode.string

    let! res = Thoth.Fetch.Fetch.get("http://localhost:3000/api/fake-data", decoder = decoder)

    printfn "%A" res
}
|> ignore
