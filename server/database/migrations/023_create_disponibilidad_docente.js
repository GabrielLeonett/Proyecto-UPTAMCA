// migrations/xxxx_create_disponibilidad.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex){
  await knex.schema.createTable('disponibilidad_docente', (table) => {
    table.increments('id_disponibilidad').primary().comment('Id de la disponibilidad del docente');
    table.bigInteger('id_profesor').notNullable().comment('Id del profesor que tiene la disponibilidad del docente');
    table.enum('dia_semana', ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'])
      .notNullable()
      .comment('Día de la semana (domingo excluido por ser no lectivo)');
    table.time('hora_inicio').notNullable().comment('Hora de inicio de la disponibilidad del docente');
    table.time('hora_fin').notNullable().comment('Hora de finalización de la disponibilidad del docente');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now()).comment('Fecha de creación del registro');
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now()).comment('Fecha de última actualización');

    // Índice único compuesto
    table.unique(['id_profesor', 'dia_semana'], 'disponibilidad_unica_docente');

    // Relación con profesores
    table.foreign('id_profesor')
      .references('id_profesor')
      .inTable('profesores')
      .onDelete('CASCADE');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex){
  await knex.schema.dropTable('disponibilidad_docente');
};