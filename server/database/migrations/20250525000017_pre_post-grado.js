export async function up(knex) {
  // Tabla de tipos de pregrado
  await knex.schema.createTable("tipos_pre_grado", (table) => {
    table.integer('id_tipo_pre_grado').primary();
    table.string("nombre_tipo_pre_grado", 50).notNullable().unique();
    table.timestamps(true, true);
  });

  // Tabla de tipos de postgrado
  await knex.schema.createTable("tipos_post_grado", (table) => {
    table.integer("id_tipo_post_grado").primary();
    table.string("nombre_tipo_post_grado", 50).notNullable().unique();
    table.timestamps(true, true);
  });

  // Tabla de programas de pregrado
  await knex.schema.createTable("pre_grado", (table) => {
    table.increments('id_pre_grado').primary();
    table.string("nombre", 100).notNullable().unique();
    table
      .integer("tipo_id")
      .unsigned()
      .notNullable()
      .references("id_tipo_pre_grado")
      .inTable("tipos_pre_grado")
      .onDelete("RESTRICT");
    table.timestamps(true, true);
  });

  // Tabla de programas de postgrado
  await knex.schema.createTable("post_grado", (table) => {
    table.increments("id_post_grado").primary();
    table.string("nombre", 100).notNullable().unique();
    table
      .integer("tipo_id")
      .unsigned()
      .notNullable()
      .references("id_tipo_post_grado")
      .inTable("tipos_post_grado")
      .onDelete("RESTRICT");
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("pre_grado");
  await knex.schema.dropTableIfExists("post_grado");
  await knex.schema.dropTableIfExists("tipos_pre_grado");
  await knex.schema.dropTableIfExists("tipos_post_grado");
}
