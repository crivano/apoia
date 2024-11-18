import type { Knex } from "knex";

/**
CREATE TABLE ia_model (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
 */
export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTableIfNotExists('ia_model', function (table) {
        table.increments('id').primary(); // Auto-incrementing primary key

        table.string('name', 128).notNullable(); // Model name column (required, max length 128)
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable(); // Timestamp column with default value CURRENT_TIMESTAMP
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('ia_model')
}

