// migrations/xxxx_create_secciones.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex){
  await knex.schema.createTable('secciones', (table) => {
    table.increments('id_seccion').primary().notNullable().comment('ID único de la sección');
    table.string('valor_seccion', 2).notNullable().comment('Valor identificador de la sección (ej: "1")');
    table.bigInteger('id_trayecto').notNullable().comment('Trayecto al que pertenece la sección');
    table.bigInteger('id_turno').comment('El turno que tiene la seccion');
    table.integer('cupos_disponibles').notNullable().defaultTo(20).comment('Cantidad de cupos disponibles (8-40)');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now()).comment('Fecha de creación del registro');
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now()).comment('Fecha de última actualización');

    // Índices
    table.unique(['valor_seccion', 'id_trayecto'], 'uq_seccion_trayecto');
    table.index('id_trayecto', 'idx_secciones_trayecto', 'btree');
    table.index('valor_seccion', 'idx_secciones_valor', 'btree');

    // Relaciones (CASCADE como especificaste)
    table.foreign('id_trayecto')
      .references('id_trayecto')
      .inTable('trayectos')
      .onDelete('CASCADE');
    
    table.foreign('id_turno')
      .references('id_turno')
      .inTable('turnos')
      .onDelete('SET NULL');
  });

  await knex.raw(`
    COMMENT ON TABLE secciones IS 'Tabla de secciones académicas agrupadas por trayecto';
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex){
  await knex.schema.dropTable('secciones');
};