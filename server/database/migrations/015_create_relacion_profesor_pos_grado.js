// migrations/xxxx_create_relacion_profesor_pos_grado.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex){
  await knex.schema.createTable('relacion_profesor_pos_grado', (table) => {
    table.increments('id_r_pos_grado_profesor').primary().comment('Id de la relacion del pos-grado con el profesor');
    table.integer('profesor_id').notNullable().comment('Id del profesor que esta en la relacion');
    table.integer('pos_grado_id').notNullable().comment('Id del pos-grado que esta en la relacion');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now()).comment('Fecha de creación del registro');
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now()).comment('Fecha de última actualización');

    // Relaciones (CASCADE para ambas como especificaste)
    table.foreign('profesor_id')
      .references('id_profesor')
      .inTable('profesores')
      .onDelete('CASCADE');
    
    table.foreign('pos_grado_id')
      .references('id_pos_grado')
      .inTable('pos_grado')
      .onDelete('CASCADE');
  });

  await knex.raw(`
    COMMENT ON TABLE relacion_profesor_pos_grado IS 'Tabla de la relacion de los profesores y sus pos-grado';
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex){
  await knex.schema.dropTable('relacion_profesor_pos_grado');
};