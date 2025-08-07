// migrations/xxxx_create_pos_grado.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex){
  await knex.schema.createTable('pos_grado', (table) => {
    table.increments('id_pos_grado').primary().notNullable().comment('Id de el Pos-Grado');
    table.string('nombre_pos_grado', 100).unique().notNullable().comment('Nombre del Pos-Grado');
    table.enum('tipo_pos_grado', [
      'Especialización', 'Maestría', 'Doctorado', 'Diplomado', 
      'Posdoctorado', 'Certificación', 'Curso Avanzado', 
      'Residencia Médica', 'Fellowship'
    ]).notNullable().comment('Tipo de Pos-Grado');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now()).comment('Fecha de Creación del Pos-Grado');
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now()).comment('Fecha de Actualizacion del Pos-Grado');
  });

  await knex.raw(`
    COMMENT ON TABLE pos_grado IS 'Esta es la tabla de los Pos-Grados de los profesores';
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex){
  await knex.schema.dropTable('pos_grado');
};