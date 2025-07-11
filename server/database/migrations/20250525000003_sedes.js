export async function up(knex) {
  return knex.schema.createTable("sedes", (table) => {
    // Identificador autoincremental
    table.tinyint("id_sede")
      .primary()
      .comment('Identificador único numerico de la ubicación en rango (1-255)');
    
    // Nombre descriptivo
    table.string("nombre_sede", 100)
      .notNullable()
      .unique()
      .comment('Nombre descriptivo de la ubicación (debe ser único)');
    
    // Campos de auditoría (versión explícita de timestamps)
    table.timestamp("created_at")
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('Fecha de creación del registro');
      
    table.timestamp("updated_at")
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('Fecha de última actualización del registro');
    
    // Índice para búsquedas por nombre
    table.index(["nombre_sede"], "idx_sede_nombre");
  });
}

export async function down(knex) {
  return knex.schema.dropTable("sedes");
}