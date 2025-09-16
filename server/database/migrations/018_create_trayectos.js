// migrations/xxxx_create_trayectos.js


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex){
  await knex.schema.createTable('trayectos', (table) => {
    table.increments('id_trayecto').primary().notNullable();
    table.integer('poblacion_estudiantil').notNullable().defaultTo(0).comment('Cantidad de estudiantes en el trayecto');
    table.string('valor_trayecto', 20).notNullable().comment('Valor identificador del trayecto (ej: Trayecto I, Trayecto II)');
    table.smallint('id_pnf').notNullable().comment('Referencia al PNF al que pertenece el trayecto');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now()).comment('Fecha de creación del registro');
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now()).comment('Fecha de última actualización del registro');

    // Índices
    table.index('id_pnf', 'idx_trayectos_pnf', 'btree');
    table.index(['valor_trayecto', 'id_pnf'], 'idx_trayectos_valor_pnf', 'btree');

    // Relación con PNFs (CASCADE como especificaste)
    table.foreign('id_pnf')
      .references('id_pnf')
      .inTable('pnfs')
      .onDelete('CASCADE');

    knex.raw(`
      ALTER TABLE trayectos 
      ALTER COLUMN TYPE SMALLINT;
    `)
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex){
  await knex.schema.dropTable('trayectos');
};