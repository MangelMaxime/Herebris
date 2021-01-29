module Server

open System
open Fable.Core
open Fable.Core.JsInterop
// open Pg
open ServeServeStaticCore
open Thoth.Json
open Database
open Node

open Jupiter

let userRouter = router {
    get "/index" (fun req res next ->
        res.write("user index :)") |> ignore
        res.``end``()
    )
}

let mainRouter = router {
    get "/hello" (fun req res next ->
        res.write("hello from the serv2er") |> ignore
        res.``end``()
    )

    get "/echo" (fun req res next ->
        let value = unbox<string> req.query.["value"]
        let text = sprintf "Echo: %s" value
        res.write(text) |> ignore
        res.``end``()
    )

    get "/api/fake-data" (fun req res next ->
        Encode.object [
            "name", Encode.string "maxime"
        ]
        |> Encode.toString 4
        |> res.write
        |> ignore

        res.``end``()
    )

    get "/errored" (fun req res next ->
        next.Invoke(box "fake error")
    )

    sub_router "/user" userRouter
}

let app = application {
    use_cors (jsOptions<Cors.E.CorsOptions>(fun o ->
        o.origin <- !^"http://localhost:8080"
    ))

    use_router mainRouter

    // When working on local dev env the static folder is serve using Snowpack
    #if !LOCAL_DEV
    use_static "static"
    #endif
}

run app 3000


// let run () =
//     promise {
//         // printfn "running query "
//         // let! _ = Database.pool.connect()
//         // let! res = Database.pool.query("SELECT NOW()")
//         // Fable.Core.JS.console.log(res)

// //         let! createdUser =
// //             Database.Pool.Instance.query("""
// // INSERT INTO hb."user"(email, password, firstname, surname)
// // VALUES ($1, $2, $3, $4)
// // RETURNING *
// //         """, [|"mail@domain.com2"; "passwordvalue"; "Test1"; "Test2"|]
// //         )

//         let! createdUser =

// //             Pool.query("""
// // INSERT INTO hb."user"(email, password, firstname, surname)
// // VALUES ($1, $2, $3, $4)
// // RETURNING *; select now()
// //         """, [|"mail2@domain.com2"; "passwordvalue"; "Test1"; "test"|])
// //             Database.Pool.Instance.query("""
// // select * from hb."user" where email = $1
// //             """, [| "'';select now()" |]
// //             )



//         JS.console.log(createdUser)



//     }
//     |> ignore

//     promise {
//         let! res = Pool.Instance
//                     |> Sql.connectFromPool
//                     |> Sql.query """
// INSERT INTO
// hb."user"(email, password, firstname, surname)
// VALUES
// ($1, $2, $3, $4)
// RETURNING *
//                     """
//                     |> Sql.parameters [
//                         Sql.string "mail8@test.com"
//                         Sql.string "mypassword"
//                         Sql.string "Maxime"
//                         Sql.string "Mangel"
//                     ]
//                     |> Sql.execute (fun read ->
//                         {|
//                             // Id = read.uuid "id"
//                             Firstname = read.string "firstname"
//                         |}
//                     )
//         // JS.console.log(res)

//         res
//         |> List.iter (fun u ->
//             printfn "%A" u.Firstname
//         )
//         // printfn "%A" res
//     }

// let run2 () =
//     promise {
//         let! res = Pool.Instance
//                     |> Sql.connectFromPool
//                     |> Sql.query """
// select * from hb."user";
//                     """
//                     |> Sql.execute (fun read ->
//                         {|
//                             Id = read.uuid "id"
//                             Firstname = read.string "firstname"
//                         |}
//                     )
//         // JS.console.log(res)

//         res
//         |> List.iter (fun u ->
//             JS.console.log(u)
//         )
//         // printfn "%A" res
//     }

// run()
// run2()

// printfn "%A" Database.Env.Db.user
// printfn "%A" Database.Env.Db.password
// printfn "%A" Database.Env.Db.host
// printfn "%A" Database.Env.Db.database
// printfn "%A" Database.Env.Db.port

let user =
    Database.User.insert
        {
            email = "test17@mail-promise.fr"
            password = "djzidjozd"
            firstname = "firstname"
            surname = "surname"
        }
        |> Promise.map (fun user ->
            printfn "%A" user
        )
        |> Promise.catchEnd (fun error ->

            printfn "%A" error.Message

            // try
            //     raise error
            // with
            //     | Sql.QueryResultError msg ->
            //         printfn "dz dzdz: %A" msg
            //     | _ ->
            //         printfn "other"
        )

open PgPromise

promise {
    let path = path.join(__dirname, "../Sql/test.sql")
    let options = jsOptions<PgPromise.IQueryFileOptions>(fun o ->
        o.debug <- Some true
    )
    let file = pgPromise.QueryFile(path, options)

    JS.console.log(file.file)
    JS.console.log(file.error)

    ()
}

|> ignore
