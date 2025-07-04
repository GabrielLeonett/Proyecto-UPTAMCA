// migrations/YYYYMMDDHHMMSS_create_coordinadores_table.js
export function up(knex) {
  return knex.schema.createTable('coordinadores', (table) => {
    table.bigIncrements('id_coordinador').primary()
    table.bigInteger('id_cedula').unsigned().notNullable()
      .references('cedula').inTable('users');
    table.tinyint('id_ubicacion').unsigned().notNullable()
      .references('id_ubicacion').inTable('ubicaciones');
    table.tinyint('id_pnf').unsigned().notNullable()
      .references('id_pnf').inTable('pnfs');
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTable('coordinadores');
}