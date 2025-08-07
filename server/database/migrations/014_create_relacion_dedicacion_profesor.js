// migrations/xxxx_create_relacion_dedicacion_profesor.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex){
  await knex.schema.createTable('relacion_dedicacion_profesor', (table) => {
    table.increments('id').primary().comment('Id de la relacion de profesor y sus dedicaciones');
    table.integer('profesor_id').notNullable().comment('Id del profesor que esta en la relacion');
    table.integer('dedicacion_id').notNullable().comment('Id del de la dedicacion que esta en la relación');
    table.date('fecha_inicio').notNullable().comment('Fecha en la que se inicio esa dedicación');
    table.date('fecha_fin').nullable().comment('Fecha en la que se termino esa dedicacion');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now()).comment('Fecha de creación del registro');
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now()).comment('Fecha de última actualización');

    // Relaciones (RESTRICT para dedicacion_id y CASCADE para profesor_id)
    table.foreign('profesor_id')
      .references('id_profesor')
      .inTable('profesores')
      .onDelete('CASCADE');
    
    table.foreign('dedicacion_id')
      .references('id_dedicacion')
      .inTable('dedicaciones')
      .onDelete('RESTRICT');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex){
  await knex.schema.dropTable('relacion_dedicacion_profesor');
};