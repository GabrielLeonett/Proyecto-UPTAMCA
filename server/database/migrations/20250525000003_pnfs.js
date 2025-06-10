export async function up(knex) {
  await knex.schema.createTable("pnfs", (table) => {
    // Identificador numérico pequeño (mejor que UUID para tablas de referencia)
    table.specificType("id_pnf", "SMALLSERIAL")
      .unsigned()
      .notNullable()
      .primary()
    
    // Información básica
    table.string("codigo_pnf", 10)
      .notNullable()
      .unique()
      .comment('Código institucional del PNF (ej: ING-INF)');
    
    table.string("nombre_pnf", 60)
      .notNullable()
      .unique()
      .comment('Nombre completo del Programa Nacional de Formación');
    
    // Detalles académicos
    table.string("descripcion_pnf", 400)
      .notNullable()
      .comment('Objetivos y alcance del programa');
    
    // Estadísticas
    table.integer("poblacion_estudiantil_pnf")
      .unsigned()
      .defaultTo(0)
      .notNullable()
      .comment('Estudiantes activos registrados');
    
    // Estado y auditoría
    table.boolean("activo")
      .defaultTo(true)
      .notNullable()
      .comment('Indica si el PNF está actualmente activo');
    
    table.timestamp("created_at")
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('Fecha de creación del registro');
    
    table.timestamp("updated_at")
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('Fecha de última actualización');

    // Índices optimizados
    table.index(["codigo_pnf"], "idx_pnfs_codigo");
    table.index(["nombre_pnf"], "idx_pnfs_nombre");
    table.index(["activo"], "idx_pnfs_estado");
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("pnfs");
}