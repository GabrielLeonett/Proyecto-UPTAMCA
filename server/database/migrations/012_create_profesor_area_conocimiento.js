// migrations/xxxx_create_profesor_area_conocimiento.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex){
  await knex.schema.createTable('profesor_area_conocimiento', (table) => {
    table.increments('id').primary().comment('Id de relacion de profesor con area de conocimiento');
    table.integer('profesor_id').notNullable().comment('Profesor que tiene la relacion');
    table.integer('area_id').notNullable().comment('Area de conocimiento que tiene la relacion');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now()).comment('Fecha de Creación de la relacion');
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now()).comment('Fecha de Actualizacion de la relacion');

    // Índice único compuesto
    table.unique(['profesor_id', 'area_id'], 'profesor_area_conocimiento_profesor_id_area_id_unique');

    // Relaciones (CASCADE como especificaste)
    table.foreign('profesor_id')
      .references('id_profesor')
      .inTable('profesores')
      .onDelete('CASCADE');
    
    table.foreign('area_id')
      .references('id_area_conocimiento')
      .inTable('areas_de_conocimiento')
      .onDelete('CASCADE');
  });

  await knex.raw(`
    COMMENT ON TABLE profesor_area_conocimiento IS 'Esta tabla es la de la relacion entre el profesor y las areas de conocimiento';
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex){
  await knex.schema.dropTable('profesor_area_conocimiento');
};