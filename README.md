# Herebris

Goal: Write an (small) excel online like to demonstrate how we can use Fable on both the front and back end.

### Features

- [ ] Login
    - [ ] Create the view
    - [ ] Create the back routes
        - [ ] SignIn route
- File management
    - [ ] List of file
    - [ ] Open file
    - [ ] Delete file
    - [ ] Create file
    - [ ] Rename file
    - [ ] Move file
    - [ ] Create folder
    - [ ] Delete folder
    - [ ] Rename folder
    - [ ] Move folder
- [ ] Admin page
    - [ ] User management
        - [ ] Index
        - [ ] Create user
        - [ ] Update user
        - [ ] Disable user
- [ ] Sheet support
    - [ ] Todo list of basic feature for the sheets

## Notes

- Project to test SQL injections: https://github.com/sqlmapproject/sqlmap
- Article about bulk insert with `node-postgresql`: https://www.wlaurance.com/2018/09/node-postgres-insert-multiple-rows

Create a user `herebris_migration` with the role "Create Db" and a password.

Execute migrations:

```bash
PGUSER=dbuser \
  PGHOST=database.server.com \
  PGPASSWORD=secretpassword \
  PGDATABASE=mydb \
  PGPORT=3211 \
  node script.js
```

Tips: You can create an alias or a script named `migrate.sh` (it will not be tracked) for this command to avoid typing it all the time.

### Things to explain

- [ ] Module/namesapce organisation
    - [ ] Delegation of the responsabilities
- [ ] Router.fs structure and why/how to use it
- [ ] How the build system works and why use simple package.json instead of Fake or stuff like that for now
    - [ ] .env usage

*Tested with webpack:*

- For HMR / Fast Refresh, to work using a "pure" Elmish application there are several ways. By having a `[<ReactComponentt>]` at the root of the application which use `React.useElmish`
    - 1. Add the following code to accept HMR support for all files

    ```js
    if (module.hot) {
        module.hot.accept();
    }
    ```
    - 2. Make all the functions private (except the one exposing the React component) in the `Main.fs` file it seems to make Fast Refresh works

*All these "tricks" are here because Fast refresh plugin of webpack only accept reload of module exposing **only** React components*
