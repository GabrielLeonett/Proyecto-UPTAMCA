export async function up(knex) {
  await knex.schema.createTable("secciones", (table) => {
    // Identificador único
    table.bigIncrements("id_seccion")
      .primary()
      .comment('ID único de la sección (UUID)');
    
    // Datos de la sección
    table.string("valor_seccion", 20)
      .notNullable()
      .comment('Valor identificador de la sección (ej: "Sección A")');
    
    // Relación con trayectos (corregida referencia a id_trayecto)
    table.bigInteger("id_trayecto")
      .notNullable()
      .references("id_trayecto").inTable("trayectos")
      .onDelete("CASCADE")
      .comment('Trayecto al que pertenece la sección');
    
    // Capacidad
    table.integer("cupos_disponibles")
      .notNullable()
      .defaultTo(20)
      .comment('Cantidad de cupos disponibles (8-40)');
    
    // Auditoría
    table.timestamp("created_at")
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('Fecha de creación del registro');
    
    table.timestamp("updated_at")
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('Fecha de última actualización');
    
    // Índices optimizados
    table.index(["id_trayecto"], "idx_secciones_trayecto");
    table.index(["valor_seccion"], "idx_secciones_valor");
    
    // Restricción para valores lógicos de cupos
    table.check(
      "cupos_disponibles >= 8 AND cupos_disponibles <= 40",
      [],
      "chk_secciones_cupos_validos"
    );

    // Restricción única compuesta
    table.unique(["valor_seccion", "id_trayecto"], "uq_seccion_trayecto");
  });

  // Comentario descriptivo para la tabla
  await knex.raw('COMMENT ON TABLE secciones IS \'Tabla de secciones académicas agrupadas por trayecto\'');
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("secciones");
}