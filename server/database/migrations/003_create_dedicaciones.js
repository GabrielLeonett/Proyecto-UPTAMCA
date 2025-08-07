// migrations/xxxx_create_dedicaciones.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex){
  await knex.schema.createTable('dedicaciones', (table) => {
    table.smallint('id_dedicacion').primary().comment('ID numérico pequeño para tipo de dedicación (1-255)');
    table.string('nombre_dedicacion', 50).unique().notNullable().comment('Nombre del tipo de dedicación (ej: Tiempo completo, Medio tiempo)');
    table.specificType('horas_docencia_semanales', 'interval').notNullable().comment('Horas semanales dedicadas a docencia (formato interval)');
    table.specificType('horas_administrativas_semanales', 'interval').notNullable().defaultTo('00:00:00').comment('Horas semanales dedicadas a actividades administrativas');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now()).comment('Fecha de creación del registro');
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now()).comment('Fecha de última actualización del registro');
  });

  await knex.raw(`
    COMMENT ON TABLE dedicaciones IS 'Tablas de la dedicaciones de los profesores';
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex){
  await knex.schema.dropTable('dedicaciones');
};