// migrations/YYYYMMDDHHMMSS_create_coordinadores_table.js
export function up(knex) {
  return knex.schema.createTable('coordinadores', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('id_cedula').unsigned().notNullable()
      .references('id').inTable('users');
    table.bigInteger('id_ubicacion').unsigned().notNullable()
      .references('id').inTable('ubicacion');
    table.bigInteger('id_pnf').unsigned().notNullable()
      .references('id').inTable('pnfs');
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTable('coordinadores');
}