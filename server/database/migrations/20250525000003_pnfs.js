export function up(knex) {
  return knex.schema.createTable('pnfs', function(table) {
    table.bigIncrements('id').primary();
    table.string('nombre_pnf', 255).notNullable();
    table.string('descripcion_pnf', 400).notNullable();
    table.timestamps(true, true); // Opcional: añade created_at y updated_at
  });
}

export function down(knex) {
  return knex.schema.dropTable('pnfs');
}