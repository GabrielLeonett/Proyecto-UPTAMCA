export async function up(knex) {
  await knex.schema.createTable("areas_de_conocimiento", (table) => {
    table.increments("id").primary();
    table.string("nombre").notNullable().unique();
    table.text("descripcion").nullable();
    table.timestamps(true, true); // created_at y updated_at
  });
  await knex.schema.createTable("profesor_area_conocimiento", (table) => {
    table.increments("id").primary();

    table
      .integer("profesor_id")
      .unsigned()
      .notNullable()
      .references("id_profesor")
      .inTable("profesores")
      .onDelete("CASCADE");

    table
      .integer("area_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("areas_de_conocimiento")
      .onDelete("CASCADE");

    table.unique(["profesor_id", "area_id"]); // Evitar duplicados

    table.timestamps(true, true);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("profesor_area_conocimiento");
  await knex.schema.dropTableIfExists("areas_de_conocimiento");
}
