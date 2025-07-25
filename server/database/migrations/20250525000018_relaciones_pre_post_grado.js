export async function up(knex) {
  // Relación entre profesores y programas de pregrado
  await knex.schema.createTable("relacion_profesor_pre_grado", (table) => {
    table.increments("id_r_pre_grado_profesor").primary();

    table
      .integer("profesor_id")
      .unsigned()
      .notNullable()
      .references("id_profesor")
      .inTable("profesores")
      .onDelete("CASCADE");

    table
      .integer("pre_grado_id")
      .unsigned()
      .notNullable()
      .references("id_pre_grado")
      .inTable("pre_grado")
      .onDelete("CASCADE");

    table.timestamps(true, true);
  });

  // Relación entre profesores y programas de postgrado
  await knex.schema.createTable("relacion_profesor_post_grado", (table) => {
    table.increments("id_r_post_grado_profesor").primary();

    table
      .integer("profesor_id")
      .unsigned()
      .notNullable()
      .references("id_profesor")
      .inTable("profesores")
      .onDelete("CASCADE");

    table
      .integer("post_grado_id")
      .unsigned()
      .notNullable()
      .references("id_post_grado")
      .inTable("post_grado")
      .onDelete("CASCADE");

    table.timestamps(true, true);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("relacion_profesor_post_grado");
  await knex.schema.dropTableIfExists("relacion_profesor_pre_grado");
}
