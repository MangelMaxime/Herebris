var pgMigrations = require("postgres-migrations")

async function run() {
    const dbConfig = {
        database: process.env.PGDATABASE,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        host: process.env.PGHOST,
        port: Number.parseInt(process.env.PGPORT)
    }

    await pgMigrations.createDb(process.env.PGDATABASE, {
        ...dbConfig,
        defaultDatabase: "postgres"
    });

    await pgMigrations.migrate(dbConfig, "./Migrations");
}

run();
