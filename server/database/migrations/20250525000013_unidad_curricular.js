export function up(knex) {
  return knex.schema.createTable('unidad_curricular', function(table) {
    table.bigIncrements('id').primary();
    table.string('nombre_unidad_curricular', 255).notNullable();
    table.string('descripcion_unidad_curricular', 400).notNullable();
    table.integer('carga_horas').notNullable();
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTable('unidad_curricular');
}