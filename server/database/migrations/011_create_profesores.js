// migrations/xxxx_create_profesores.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable("profesores", (table) => {
    table
      .increments("id_profesor")
      .primary()
      .notNullable()
      .comment("ID único del profesor");
    table
      .bigInteger("id_cedula")
      .unique()
      .notNullable()
      .comment("Relación con la tabla de usuarios (1 a 1)");
    table
      .date("fecha_ingreso")
      .notNullable()
      .comment("Fecha de ingreso a la institución");
    table
      .enum("municipio", ["Carrizal", "Guaicaipuro", "Los Salias"])
      .notNullable()
      .comment("Municipio donde vive el profesor");
    table
      .boolean("activo")
      .defaultTo(true)
      .comment("Indica si el usuario está activo en el sistema como profesor");
    table
      .timestamp("updated_at")
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment("Fecha de última actualización");

    // Índices
    table.index("fecha_ingreso", "idx_profesores_antiguedad", "btree");
    table.index("id_cedula", "idx_profesores_usuario", "btree");

    // Relación con users (CASCADE como especificaste)
    table
      .foreign("id_cedula")
      .references("cedula")
      .inTable("users")
      .onDelete("CASCADE");
  });

  await knex.raw(`
    COMMENT ON TABLE profesores IS 'Tabla de los profesores';
  `);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTable("profesores");
}
