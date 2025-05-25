export function up(knex) {
  return knex.schema.createTable('roles', function(table) {
    table.bigIncrements('id').primary();
    table.integer('tipo_rol').notNullable();
    table.string('nombre_rol', 255).notNullable();
    table.timestamps(true, true); // Opcional: añade created_at y updated_at
  });
}

export function down(knex) {
  return knex.schema.dropTable('roles');
}