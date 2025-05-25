export function up(knex) {
  return knex.schema.createTable('ubicacion', function(table) {
    table.bigIncrements('id').primary();
    table.string('nombre_ubicacion', 255).notNullable();
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTable('ubicacion');
}