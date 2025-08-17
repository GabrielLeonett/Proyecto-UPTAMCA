// migrations/xxxx_create_sedes.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex){
  await knex.schema.createTable('sedes', (table) => {
    table.smallint('id_sede').primary().notNullable().comment('Identificador único numerico de la ubicación en rango (1-255)');
    table.string('nombre_sede', 100).unique().notNullable().comment('Nombre descriptivo de la ubicación (debe ser único)');
    table.string('ubicacion_sede', 150).unique().notNullable().comment('Nombre descriptivo de la ubicación (debe ser único)');
    table.string('google_sede', 150).unique().notNullable().comment('Nombre descriptivo de la ubicación (debe ser único)');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now()).comment('Fecha de creación del registro');
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now()).comment('Fecha de última actualización del registro');

    // Índice
    table.index('nombre_sede', 'idx_sede_nombre', 'btree');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex){
  await knex.schema.dropTable('sedes');
};