export async function up(knex) {
  await knex.schema.createTable('turnos', function(table) {
    table.tinyint('id_turno').primary();
    table.string('nombre_turno').notNullable().comment('Nombre del turno (ej: Matutino, Vespertino)');
    table.time('inicio_hora').notNullable().comment('Hora de inicio del turno');
    table.time('fin_hora').notNullable().comment('Hora de fin del turno');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Validación para asegurar que end_time > start_time
    table.check('fin_hora > inicio_hora', [], 'check_tiempo_turno');
  });
}

export async function down(knex) {
  await knex.schema.dropTable('turnos');
}