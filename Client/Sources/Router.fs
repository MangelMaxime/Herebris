[<RequireQualifiedAccess>]
module Router

    open Feliz
    open Feliz.Router


    [<RequireQualifiedAccess>]
    type AdministrationUrl =
        | UserIndex of pageRank : int option

        static member ToUrl (prefix : string, segment : AdministrationUrl) =
            match segment with
            | UserIndex (Some pageRank) ->
                Router.format(prefix, "user", "index", [ "pageRank", pageRank ])

            | UserIndex None ->
                Router.format(prefix, "user", "index")

    /// <note>
    /// Use the name Segment to avoid polluting the Route type from Feliz.Router
    /// </note>
    [<RequireQualifiedAccess>]
    type Url =
        | Home
        | Administration of AdministrationUrl
        | NotFound

        static member ToUrl (segment : Url) =
            match segment with
            | Home ->
                Router.format("home")
                // [ "home" ], []

            | Administration subSegment ->
                AdministrationUrl.ToUrl("administration", subSegment)
                // let subSegementPart, queryPart = AdministrationUrl.ToString subSegment
                // "administration" :: subSegementPart ,queryPart

            | NotFound ->
                Router.format("not-found")
                // [ "not-found" ], []

    let parseUrl (segments : string list) =
        match segments with
        | [ ] ->
            Url.Home

        | [ "administration"; "user"; "index" ] ->
            None
            |> AdministrationUrl.UserIndex
            |> Url.Administration

        | [ "administration"; "user"; "index"; Route.Query [ "pageRank", Route.Int pageRank ] ] ->
            Some pageRank
            |> AdministrationUrl.UserIndex
            |> Url.Administration

        | _ -> Url.NotFound

    let href (url : Url) =
        url
        |> Url.ToUrl
        |> prop.href

    let modifyUrl (url : Url) =
        url
        |> Url.ToUrl
        |> Router.navigate

    let newUrl (url : Url) =
        Router.navigate(Url.ToUrl url, HistoryMode.PushState)

    [<RequireQualifiedAccess>]
    module Cmd =

        let navigate (url : Url) =
            url
            |> Url.ToUrl
            |> Cmd.navigate
