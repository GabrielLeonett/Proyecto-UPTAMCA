// migrations/YYYYMMDDHHMMSS_create_administradores_table.js
export function up(knex) {
  return knex.schema.createTable('administradores', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('id_cedula').unsigned().notNullable()
      .references('id').inTable('users');
    table.bigInteger('id_rol').unsigned().notNullable()
      .references('id').inTable('roles');
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTable('administradores');
}