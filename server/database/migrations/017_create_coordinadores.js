// migrations/xxxx_create_coordinadores.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex){
  await knex.schema.createTable('coordinadores', (table) => {
    table.bigInteger('id_coordinador').primary().comment('Id del coordinador');
    table.bigInteger('id_profesor').notNullable().comment('Id del profesor que va a ser coordinador');
    table.smallint('id_pnf').notNullable().comment('Id del pnf del cual sera coordinador');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now()).comment('Fecha de Creación de este coordinador');
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now()).comment('Fecha de Actualización de este coordinador');

    // Relación con profesores
    table.foreign('id_profesor')
      .references('id_profesor')
      .inTable('profesores')
      .onDelete('CASCADE');

    // Relación con pnfs
    table.foreign('id_pnf')
      .references('id_pnf')
      .inTable('pnfs')
      .onDelete('RESTRICT'); // No especificaste acción, dejé RESTRICT como default
  });

  await knex.raw(`
    COMMENT ON TABLE coordinadores IS 'Tabla de los coordinadores';
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex){
  await knex.schema.dropTable('coordinadores');
};