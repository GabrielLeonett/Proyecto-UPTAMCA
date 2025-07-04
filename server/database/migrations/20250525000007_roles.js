export async function up(knex) {
  await knex.schema.createTable("roles", (table) => {
    table
      .tinyint("id_rol")
      .unsigned()
      .notNullable()
      .primary()
      .comment("Identificador único del rol (valor entre 1-255)");

    table
      .string("nombre_rol", 50)
      .notNullable()
      .unique()
      .comment("Nombre descriptivo del rol (profesor, coordinador, etc.)");

    table
      .timestamp("created_at")
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment("Fecha y hora de creación del registro");

    table
      .timestamp("updated_at")
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment("Fecha y hora de última actualización");
  });

  await knex.schema.createTable("usuario_rol", (table) => {
    table
      .integer("usuario_id")
      .unsigned()
      .notNullable()
      .comment("ID del usuario en la tabla usuarios (parte de clave foránea)");

    table
      .integer("rol_id")
      .unsigned()
      .notNullable()
      .comment("ID del rol en la tabla roles (parte de clave foránea)");

    table
      .primary(["usuario_id", "rol_id"])
      .comment("Clave primaria compuesta por usuario_id + rol_id");

    // Claves foráneas SIN .comment()
    table
      .foreign("usuario_id")
      .references("cedula")
      .inTable("users")
      .onDelete("CASCADE");

    table
      .foreign("rol_id")
      .references("id_rol")
      .inTable("roles")
      .onDelete("CASCADE");

    table
      .timestamp("created_at")
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment("Fecha y hora de asignación del rol");

    table
      .timestamp("updated_at")
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment("Fecha y hora de última actualización de la asignación");
  });
  await knex.raw(`
  COMMENT ON TABLE usuario_rol IS 'Tabla de relación muchos-a-muchos entre usuarios y roles';
`);
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("usuario_rol");
  await knex.schema.dropTableIfExists("roles");
}