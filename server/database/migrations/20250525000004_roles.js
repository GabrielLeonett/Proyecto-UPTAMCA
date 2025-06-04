export async function up(knex) {
  await knex.schema.createTable("roles", (table) => {
    // Identificador numérico pequeño (óptimo para tablas de referencia)
    table.tinyint("id_rol")
      .unsigned()
      .notNullable()
      .primary()
      .comment('ID numérico pequeño del rol (1-255)');
    
    // Nombre del rol
    table.string("nombre_rol", 50)
      .notNullable()
      .unique()
      .comment('Nombre descriptivo del rol (debe ser único)');

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
    table.index(["nombre_rol"], "idx_roles_nombre");
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("roles");
}