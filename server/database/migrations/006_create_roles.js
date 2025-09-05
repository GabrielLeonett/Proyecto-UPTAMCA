// migrations/xxxx_create_roles.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex){
  await knex.schema.createTable('roles', (table) => {
    table.smallint('id_rol').primary().notNullable().comment('Identificador único del rol (valor entre 1-255)');
    table.string('nombre_rol', 50).unique().notNullable().comment('Nombre descriptivo del rol (profesor, coordinador, etc.)');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now()).comment('Fecha y hora de creación del registro');
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now()).comment('Fecha y hora de última actualización');
  });

  await knex.raw(`
    COMMENT ON TABLE roles IS 'Tabla de los roles del sistema';
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex){
  await knex.schema.dropTable('roles');
};