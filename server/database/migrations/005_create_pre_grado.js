// migrations/xxxx_create_pre_grado.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex){
  await knex.schema.createTable('pre_grado', (table) => {
    table.increments('id_pre_grado').primary().notNullable().comment('Id del pre-grado');
    table.string('nombre_pre_grado', 100).unique().notNullable().comment('Nombre de el pre-grado');
    table.enum('tipo_pre_grado', [
      'Técnico Superior', 'Licenciatura', 'Ingeniería', 'Medicina', 
      'Arquitectura', 'Derecho', 'Educación', 'Administración', 
      'Contaduría', 'Comunicación', 'Psicología', 'Enfermería', 
      'Nutrición', 'Turismo', 'Idiomas'
    ]).notNullable().comment('Tipo de pre-grado');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now()).comment('Fecha de Creación del pre-grado');
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now()).comment('Fecha de Actualizacion del pre-grado');
  });

  await knex.raw(`
    COMMENT ON TABLE pre_grado IS 'Esta es la tabla de los pre-grados de los profesores';
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex){
  await knex.schema.dropTable('pre_grado');
};