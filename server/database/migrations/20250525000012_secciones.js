export function up(knex) {
  return knex.schema.createTable('secciones', function(table) {
    table.bigIncrements('id').primary();
    table.integer('valor_seccion').notNullable();
    table.bigInteger('id_trayecto').notNullable().references('id').inTable('trayectos');
    table.timestamps(true, true); // Opcional: añade created_at y updated_at
    
    // Opcional: índice para mejorar rendimiento en búsquedas por trayecto
    table.index('id_trayecto');
  });
}

export function down(knex) {
  return knex.schema.dropTable('secciones');
}