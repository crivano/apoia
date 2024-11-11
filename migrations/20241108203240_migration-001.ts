import type { Knex } from "knex";
import path from 'node:path'
import fs from "node:fs"

// TODO: como essas migraions já existiam basta enganar o banco de dados e dizer que estas já foram executadas

/** 
```sql
INSERT INTO knex_migrations (name, batch) 
VALUES ('20241108203240_migration-001.js', 1);
```
*/
export async function up(knex: Knex): Promise<void> {
    // Path to the .sql file
    const sqlFilePath = path.join(__dirname, 'migration-001.sql');

    // Read the SQL file content
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    // Run the SQL using Knex's raw query
    await knex.raw(sql);
}


export async function down(knex: Knex): Promise<void> {
    throw new Error("native migration is not allowed to revert")
}

