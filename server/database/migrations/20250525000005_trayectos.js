export async function up(knex) {
  await knex.schema.createTable("trayectos", (table) => {
    // Identificador único
    table.specificType("id_trayecto", "SMALLSERIAL")
      .unsigned()
      .notNullable()
      .primary()
        
    // Datos del trayecto
    table.integer("poblacion_estudiantil")
      .unsigned()
      .defaultTo(0)
      .notNullable()
      .comment('Cantidad de estudiantes en el trayecto');
    
    table.string("valor_trayecto", 20)
      .notNullable()
      .comment('Valor identificador del trayecto (ej: Trayecto I, Trayecto II)');
    
    // Relación con PNFs
    table.smallint("id_pnf")
      .notNullable()
      .references("id_pnf")
      .inTable("pnfs")
      .onDelete("CASCADE")
      .comment('Referencia al PNF al que pertenece el trayecto');
    
    // Auditoría
    table.timestamp("created_at")
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('Fecha de creación del registro');
    
    table.timestamp("updated_at")
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('Fecha de última actualización del registro');
    
    // Índices optimizados
    table.index(["id_pnf"], "idx_trayectos_pnf");
    table.index(["valor_trayecto", "id_pnf"], "idx_trayectos_valor_pnf");
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("trayectos");
}