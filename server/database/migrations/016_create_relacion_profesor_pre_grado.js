// migrations/xxxx_create_relacion_profesor_pre_grado.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex){
  await knex.schema.createTable('relacion_profesor_pre_grado', (table) => {
    table.increments('id_r_pre_grado_profesor').primary();
    table.integer('profesor_id').notNullable();
    table.integer('pre_grado_id').notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now()).comment('Fecha de creación del registro');
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now()).comment('Fecha de última actualización');

    // Relaciones (CASCADE para ambas como especificaste)
    table.foreign('profesor_id')
      .references('id_profesor')
      .inTable('profesores')
      .onDelete('CASCADE');
    
    table.foreign('pre_grado_id')
      .references('id_pre_grado')
      .inTable('pre_grado')
      .onDelete('CASCADE');
  });

  await knex.raw(`
    COMMENT ON TABLE relacion_profesor_pre_grado IS 'Tabla de la relacion de los profesores y sus pre-grado';
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex){
  await knex.schema.dropTable('relacion_profesor_pre_grado');
};
