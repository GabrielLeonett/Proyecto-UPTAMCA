// migrations/xxxx_create_aulas.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex){
  await knex.schema.createTable('aulas', (table) => {
    table.increments('id_aula').primary().comment('Id de la aula');
    table.integer('id_sede').notNullable().comment('Id de la sede en la que esta la aula');
    table.string('codigo', 5).notNullable().comment('Codigo de la aula ejemplo: 75');
    table.enum('tipo_aula', [
      'Convencional', 'Magistral', 'Interactiva', 'Computación', 
      'Ciencias', 'Ingeniería', 'Arte', 'Música', 'Clínica', 
      'Multimedia', 'Virtual', 'Inteligente', 'Estudio', 
      'Investigación', 'Exterior'
    ]).notNullable().comment('Tipo de aula');
    table.integer('capacidad').notNullable().comment('Capacidad del aula');
    table.boolean('activa').defaultTo(true).comment('Esta disponible');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now()).comment('Fecha de Creacion del aula');
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now()).comment('Fecha de Actualizacion del aula');

    // Índice único compuesto
    table.unique(['id_sede', 'codigo'], 'aulas_id_sede_codigo_unique');

    // Relación con sedes (cascade como especificaste)
    table.foreign('id_sede')
      .references('id_sede')
      .inTable('sedes')
      .onDelete('CASCADE');
  });

  await knex.raw(`
    COMMENT ON TABLE aulas IS 'Tabla para las aulas';
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex){
  await knex.schema.dropTable('aulas');
};