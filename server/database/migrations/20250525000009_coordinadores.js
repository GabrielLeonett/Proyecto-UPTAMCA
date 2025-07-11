// migrations/YYYYMMDDHHMMSS_create_coordinadores_table.js
export function up(knex) {
  return knex.schema.createTable('coordinadores', (table) => {
    table.bigIncrements('id_coordinador').primary()
    table.bigInteger('id_profesor').unsigned().notNullable().references('id_profesor').inTable('profesores');
    table.tinyint('id_pnf').unsigned().notNullable().references('id_pnf').inTable('pnfs');
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTable('coordinadores');
}