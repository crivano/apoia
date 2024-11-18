import type { Knex } from "knex";


/**
CREATE TABLE ia_content_source (
    id INT NOT NULL,
    descr VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
);

INSERT INTO ia_content_source (id, descr) VALUES (1, 'HTML');
INSERT INTO ia_content_source (id, descr) VALUES (2, 'PDF');
INSERT INTO ia_content_source (id, descr) VALUES (3, 'PDF (OCR)');
 */

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTableIfNotExists('ia_content_source', function (table) {
        table.integer('id').primary(); // Primary key column
        table.string('descr', 255).notNullable(); // Description column
    })
    for (const [index, value] of ['HTML', 'PDF', 'PDF (OCR)'].entries()) {
        const data = await knex('ia_content_source').select("*").where({
            id: index + 1,
            descr: value
        }).first()
        if (!data) {
            await knex('ia_content_source').insert({ id: index + 1, descr: value })
        }
    }
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('ia_content_source')
}
