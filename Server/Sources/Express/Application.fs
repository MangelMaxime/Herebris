namespace Herebris.Express

[<AutoOpen>]
module Application =

    open ServeServeStaticCore
    open Fable.Core.JsInterop

    type ApplicationState =
        {
            Port : int
            Router : Router option 
        }

    type ApplicationBuilder() =
        
        [<CustomOperation("use_router")>]
        member __.UseRouter (state, handler) =
            { state with
                Router = Some handler 
            }
        
        member __.Yield(_) =
            {
                Port = 3000
                Router = None
            }
            
        member __.Run(state : ApplicationState) =
            let app = Express.express.Invoke()
            
            match state.Router with
            | Some router ->
                app?``use``(router) 
            | None -> ()
            
            app

    let application = ApplicationBuilder()

    let run (application : Express) (port : int) =
        application.listen(float port)
        |> ignore