export async function up(knex) {

  await knex.schema.createTable("profesores", (table) => {
    // Identificador único
    table.bigIncrements("id_profesor")
      .primary()
      .comment('ID único del profesor');
    
    // Relaciones con otras tablas (corregido tipo de dato para UUID)
    table.tinyint("id_categoria")
      .notNullable()
      .references("id_categoria").inTable("categoria")
      .onDelete("RESTRICT")
      .comment('Categoría del profesor');
    
    table.bigInteger("id_cedula")
      .notNullable()
      .references("cedula").inTable("users")
      .onDelete("CASCADE")
      .unique()
      .comment('Relación con la tabla de usuarios (1 a 1)');
    
    table.tinyint("id_dedicacion")
      .notNullable()
      .references("id_dedicacion").inTable("dedicacion")
      .onDelete("RESTRICT")
      .comment('Tipo de dedicación del profesor');
    
    table.smallint("id_ubicacion")
      .notNullable()
      .references("id_ubicacion").inTable("ubicacion")
      .onDelete("RESTRICT")
      .comment('Ubicación física del profesor');
    
    // Información académica
    table.text("pre_grado")
      .notNullable()
      .comment('Formación de pregrado del profesor');
    
    table.text("post_grado")
      .notNullable()
      .comment('Formación de posgrado del profesor');
    
    table.string("area_de_conocimiento", 300)
      .notNullable()
      .comment('Área principal de conocimiento');
    
    table.date("fecha_ingreso")
      .notNullable()
      .comment('Fecha de ingreso a la institución');
    
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
    table.index(["id_cedula"], "idx_profesores_usuario");
    table.index(["id_ubicacion"], "idx_profesores_ubicacion");
    table.index(["id_categoria"], "idx_profesores_categoria");
    table.index(["id_dedicacion"], "idx_profesores_dedicacion");
    table.index(["fecha_ingreso"], "idx_profesores_antiguedad");
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("profesores");
}