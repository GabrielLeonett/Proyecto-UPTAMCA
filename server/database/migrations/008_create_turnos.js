// migrations/xxxx_create_turnos.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex){
  await knex.schema.createTable('turnos', (table) => {
    table.smallint('id_turno').primary().notNullable();
    table.string('nombre_turno', 255).notNullable().comment('Nombre del turno (ej: Matutino, Vespertino)');
    table.time('inicio_hora').notNullable().comment('Hora de inicio del turno');
    table.time('fin_hora').notNullable().comment('Hora de fin del turno');
    table.timestamp('created_at').defaultTo(knex.fn.now()).comment('Fecha de creación del registro');
    table.timestamp('updated_at').defaultTo(knex.fn.now()).comment('Fecha de última actualización del registro');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex){
  await knex.schema.dropTable('turnos');
};