export function up(knex) {
  return knex.schema.createTable('trayectos', function(table) {
    table.bigIncrements('id').primary();
    table.integer('valor_trayecto').notNullable();
    table.bigInteger('id_pnf').notNullable().references('id').inTable('pnfs');
    table.timestamps(true, true);
    
    // Índice para mejorar rendimiento en búsquedas por PNF
    table.index('id_pnf');
  });
}

export function down(knex) {
  return knex.schema.dropTable('trayectos');
}