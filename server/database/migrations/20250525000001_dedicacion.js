export async function up(knex) {
  await knex.schema.createTable('dedicacion', (table) => {
    // Identificador numérico pequeño
    table.tinyint('id_dedicacion')
      .unsigned()
      .notNullable()
      .primary()
      .comment('ID numérico pequeño para tipo de dedicación (1-255)');
    
    // Nombre descriptivo
    table.string('nombre_dedicacion', 50)
      .notNullable()
      .unique()
      .comment('Nombre del tipo de dedicación (ej: Tiempo completo, Medio tiempo)');
    
    // Distribución horaria (usando intervalos correctamente)
    table.specificType('horas_docencia_semanales', 'interval')
      .notNullable()
      .comment('Horas semanales dedicadas a docencia (formato interval)');
    
    table.specificType('horas_administrativas_semanales', 'interval')
      .notNullable()
      .defaultTo(knex.raw("'0 hours'::interval"))
      .comment('Horas semanales dedicadas a actividades administrativas');
    
    // Auditoría
    table.timestamp('created_at')
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('Fecha de creación del registro');
    
    table.timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('Fecha de última actualización del registro');
    
  });
  await knex.raw(`
      ALTER TABLE dedicacion
      ADD CONSTRAINT chk_dedicacion_total
      CHECK (
        EXTRACT(EPOCH FROM horas_docencia_semanales)/3600 +
        EXTRACT(EPOCH FROM horas_administrativas_semanales)/3600 <= 40
      )
    `);
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('dedicacion');
}