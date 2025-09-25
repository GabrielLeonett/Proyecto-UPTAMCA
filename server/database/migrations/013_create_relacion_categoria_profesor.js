// migrations/xxxx_create_relacion_categoria_profesor.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex){
  await knex.schema.createTable('relacion_categoria_profesor', (table) => {
    table.increments('id').primary().comment('Id de la relacion del profesor y sus categorias');
    table.integer('profesor_id').notNullable().comment('Id del profesor que esta en la relacion');
    table.integer('categoria_id').notNullable().comment('ID de la categoria que esta en la relacion');
    table.date('fecha_inicio').notNullable().comment('Fecha de inicio de esa categoria');
    table.date('fecha_fin').nullable().comment('Fecha en la que se termino esa categoría');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now()).comment('Fecha de creación del registro');
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now()).comment('Fecha de última actualización');

    // Relaciones (RESTRICT para categoria_id y CASCADE para profesor_id como especificaste)
    table.foreign('profesor_id')
      .references('id_profesor')
      .inTable('profesores')
      .onDelete('CASCADE');
    
    table.foreign('categoria_id')
      .references('id_categoria')
      .inTable('categorias')
      .onDelete('RESTRICT');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex){
  await knex.schema.dropTable('relacion_categoria_profesor');
};