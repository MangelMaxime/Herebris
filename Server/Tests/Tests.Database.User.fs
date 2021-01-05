module Tests.Database.User

open Fable.Mocha
open Fable.Mocha.Extensions
open System

open Database

let tests =
    testList "Database.User" [
        testCasePromise "Insert user in database " <|
            promise {
                let! insertedUser =
                    User.insert
                        {
                            Email = "test_user@mail.com"
                            Firstname = "Test"
                            Surname = "User"
                            Password = "my awesome password"
                        }

                Expect.equal "test_user@mail.com" insertedUser.Email ""
            }
    ]
