// migrations/xxxx_create_unidades_curriculares.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex){
  await knex.schema.createTable('unidades_curriculares', (table) => {
    table.bigInteger('id_unidad_curricular').primary().notNullable().comment('ID único de la unidad curricular');
    table.bigInteger('id_trayecto').notNullable().comment('Trayecto al que pertenece la unidad curricular');
    table.string('codigo_unidad', 20).unique().notNullable().comment('Código único identificador de la unidad (ej: MAT-101)');
    table.string('nombre_unidad_curricular', 100).notNullable().comment('Nombre completo de la unidad curricular');
    table.text('descripcion_unidad_curricular').notNullable().comment('Descripción detallada de los contenidos y objetivos');
    table.smallint('horas_clase').notNullable().comment('Duración de horas de clase');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now()).comment('Fecha de creación del registro');
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now()).comment('Fecha de última actualización');

    // Índices
    table.index('codigo_unidad', 'idx_uc_codigo', 'btree');
    table.index('nombre_unidad_curricular', 'idx_uc_nombre', 'btree');
    table.index('id_trayecto', 'idx_uc_trayecto', 'btree');

    // Relación con trayectos (CASCADE como especificaste)
    table.foreign('id_trayecto')
      .references('id_trayecto')
      .inTable('trayectos')
      .onDelete('CASCADE');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex){
  await knex.schema.dropTable('unidades_curriculares');
};