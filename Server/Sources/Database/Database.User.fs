namespace Database

open System

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

    type InsertInfo =
        {
            Email : string
            Password : string
            Firstname : string
            Surname : string
        }

    let insert (info : InsertInfo ) =
        promise {
            return!
                Pool.Instance
                |> Sql.connectFromPool
                |> Sql.query
                    """
INSERT INTO
hb."user"(email, "password", firstname, surname)
VALUES
($1, $2, $3, $4)
RETURNING *
                    """
                |> Sql.parameters [
                    Sql.string info.Email
                    Sql.string info.Password
                    Sql.string info.Firstname
                    Sql.string info.Surname
                ]
                |> Sql.executeRow (fun read ->
                    {
                        Id = read.uuid "id"
                        Email = read.string "email"
                        Password = read.string "password"
                        Firstname = read.string "firstname"
                        Surname = read.string "surname"
                        IsActive = read.bool "is_active"
                        ResetToken = read.stringOrNone "reset_token"
                        PasswordChangeRequired = read.bool "password_change_required"
                        RefreshToken = read.stringOrNone "refresh_token"
                        CreatedAt = read.datetime "created_at"
                    } : User
                )
        }
