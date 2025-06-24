export async function up(knex) {
  await knex.schema.createTable("categorias", (table) => {
    // Identificador numérico pequeño (óptimo para tablas de referencia)
    table.tinyint("id_categoria")
      .unsigned()
      .notNullable()
      .primary()
      .comment('ID numérico pequeño de la categoría (1-255)');
    
    // Nombre descriptivo
    table.string("nombre_categoria", 50)
      .notNullable()
      .unique()
      .comment('Nombre descriptivo de la categoría (debe ser único)');
    
    // Descripción opcional
    table.text("descripcion_categoria", 200)
      .nullable()
      .comment('Descripción detallada de la categoría');

    // Auditoría
    table.timestamp("created_at")
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('Fecha de creación del registro');
    
    table.timestamp("updated_at")
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('Fecha de última actualización del registro');

    // Índices
    table.index(["nombre_categoria"], "idx_categoria_nombre");
  });

}

export async function down(knex) {
  await knex.schema.dropTableIfExists("categorias");
}