// migrations/xxxx_create_areas_de_conocimiento.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex){
  await knex.schema.createTable('areas_de_conocimiento', (table) => {
    table.increments('id_area_conocimiento').primary().comment('Id de el area de conocimiento');
    table.string('nombre_area_conocimiento', 50).unique().notNullable().comment('Nombre del area de conocimiento');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now()).comment('Fecha creacion de la area de conocimiento');
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now()).comment('Fecha de actualizacion de la area de conocimiento');
  });

  await knex.raw(`
    COMMENT ON TABLE areas_de_conocimiento IS 'Tabla para las areas de conocimiento';
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex){
  await knex.schema.dropTable('areas_de_conocimiento');
};