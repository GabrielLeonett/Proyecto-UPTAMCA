// migrations/xxxx_create_profesores.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  

  await knex.raw(`
    COMMENT ON TABLE profesores IS 'Tabla de los profesores';
  `);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable("profesores");
}
