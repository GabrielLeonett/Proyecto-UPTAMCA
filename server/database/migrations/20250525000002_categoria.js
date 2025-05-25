export function up(knex) {
  return knex.schema.createTable('categoria', (table) => {
    table.bigIncrements('id').primary();
    table.string('nombre_categoria').notNullable();
  });
}

export function down(knex) {
  return knex.schema.dropTable('categoria');
}