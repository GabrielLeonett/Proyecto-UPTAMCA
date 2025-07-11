export async function up(knex) {
  // Tabla para historial de categorías del profesor
  await knex.schema.createTable("relacion_categoria_profesor", (table) => {
    table.increments("id").primary();
    table
      .integer("profesor_id")
      .unsigned()
      .notNullable()
      .references("id_profesor")
      .inTable("profesores")
      .onDelete("CASCADE");

    table
      .integer("categoria_id")
      .unsigned()
      .notNullable()
      .references("id_categoria")
      .inTable("categorias")
      .onDelete("RESTRICT");

    table.date("fecha_inicio").notNullable();
    table.date("fecha_fin").nullable(); // Si es null, sigue vigente

    table.timestamps(true, true); // created_at, updated_at
  });

  // Tabla para historial de dedicaciones del profesor
  await knex.schema.createTable("relacion_dedicacion_profesor", (table) => {
    table.increments("id").primary();
    table
      .integer("profesor_id")
      .unsigned()
      .notNullable()
      .references("id_profesor")
      .inTable("profesores")
      .onDelete("CASCADE");

    table
      .integer("dedicacion_id")
      .unsigned()
      .notNullable()
      .references("id_dedicacion")
      .inTable("dedicaciones")
      .onDelete("RESTRICT");

    table.date("fecha_inicio").notNullable();
    table.date("fecha_fin").nullable(); // Si es null, sigue vigente

    table.timestamps(true, true); // created_at, updated_at
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("relacion_dedicacion_profesor");
  await knex.schema.dropTableIfExists("relacion_categoria_profesor");
}
