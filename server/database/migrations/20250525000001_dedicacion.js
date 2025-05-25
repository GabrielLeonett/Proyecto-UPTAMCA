export function up(knex) {
  return knex.schema.createTable('dedicacion', (table) => {
    table.bigIncrements('id').primary();
    table.string('nombre_dedicacion').notNullable();
  });
}

export function down(knex) {
  return knex.schema.dropTable('dedicacion');
}