namespace Database

open System
open Fable.Core
open Fable.Core.JsInterop

type User =
    {
        Id : Guid
        Email : string
        Password : string
        Firstname : string
        Surname : string
        IsActive : bool
        ResetToken : string option
        PasswordChangeRequired : bool
        RefreshToken : string option
        CreatedAt : DateTime
    }

module User =

    // type IPgString =
    //     abstract member toPostgres : obj -> string
        // abstract member rawType : bool

    // type PgString (v : string) =

    //     interface IPgString with

    //         member this.toPostgres (self) =
    //             "'test-3" + v + "'"

    type InsertInfo =
        {
            email : string
            password : string
            firstname : string
            surname : string
        }

    let insert (info : InsertInfo ) =
        promise {
//             let! res =
//                 db.result("""
// INSERT INTO
// hb."user"(email, "password", firstname, surname)
// VALUES
// (${email}, ${password}, ${firstname}, ${surname})
// RETURNING *
//                 """
//                 , info)

            // let readerInfo = ReaderInfo(res)
            // let reader = RowReader(res.rows.[0], res, readerInfo)

                // db.tx

            return! db.tx(fun t ->

                t
                |> Sql.query
//                     """
// INSERT INTO
//     hb."user"(email, "password", firstname, surname)
// VALUES
//     (${email}, ${password}, ${firstname}, ${surname})
// RETURNING *
//                     """
                        """
select * from hb."user"
                        """
                // |> Sql.parameter info
                |> Sql.executeOne
                    (fun read ->
                        read.uuid "id"
                    )
            )


//                 promise {
//                     // let _ = t.result("", null)

//                     return! Sql.result(
//                         t,
//                         (fun read ->
//                             read.uuid "id"
//                         ),
//                         """
// INSERT INTO
// hb."user"(email, "password", firstname, surname)
// VALUES
// (${email}, ${password}, ${firstname}, ${surname})
// RETURNING *
//                         """,
//                         info)

//                     t.result("""
// INSERT INTO
// hb."user"(email, "password", firstname, surname)
// VALUES
// (${email}, ${password}, ${firstname}, ${surname})
// RETURNING *
//                 """
//                         , info)


                    // failwith "failing on purpose"
            //     }
            // )

            // return
            //     // res.rows
            //     //     |> Seq.map (fun row ->

            //     {|
            //         Id = reader.uuid "id"
            //     |}
                    // )
                    // |> Seq.toList

            // Fable.Core.JS.console.log(res.fields)

//             return!
//                 Pool.Instance
//                 |> Sql.connectFromPool
//                 |> Sql.query
//                     """
// INSERT INTO
// hb."user"(email, "password", firstname, surname)
// VALUES
// ($1, $2, $3, $4)
// RETURNING *
//                     """
//                 |> Sql.parameters [
//                     Sql.string info.Email
//                     Sql.string info.Password
//                     Sql.string info.Firstname
//                     Sql.string info.Surname
//                 ]
//                 |> Sql.executeRow (fun read ->
//                     {
//                         Id = read.uuid "id"
//                         Email = read.string "email"
//                         Password = read.string "password"
//                         Firstname = read.string "firstname"
//                         Surname = read.string "surname"
//                         IsActive = read.bool "is_active"
//                         ResetToken = read.stringOrNone "reset_token"
//                         PasswordChangeRequired = read.bool "password_change_required"
//                         RefreshToken = read.stringOrNone "refresh_token"
//                         CreatedAt = read.datetime "created_at"
//                     } : User
//                 )
        }
