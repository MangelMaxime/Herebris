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
