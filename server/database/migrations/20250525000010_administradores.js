export async function up(knex) {
  await knex.schema.createTable("administradores", (table) => {
    table.bigIncrements("id_administrador")
      .primary()
      .comment('ID único del administrador');

    // Foreign key to users table (referenciando cedula como bigint)
    table.bigInteger("id_cedula")
      .unsigned()
      .notNullable()
      .references("cedula").inTable("users")
      .onDelete('CASCADE')
      .comment('Referencia al usuario en la tabla users');
    
    // Foreign key to roles table
    table.bigInteger("id_rol")
      .unsigned()
      .notNullable()
      .references("id_rol").inTable("roles")
      .onDelete('RESTRICT')
      .comment('Rol asignado al administrador');

    // Timestamps explícitos
    table.timestamp("created_at")
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('Fecha de creación del registro');
    
    table.timestamp("updated_at")
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('Fecha de última actualización');

    // Restricción única compuesta
    table.unique(["id_cedula", "id_rol"], "uq_administrador_rol");

    // Índices para mejor rendimiento
    table.index(["id_cedula"], "idx_administradores_usuario");
    table.index(["id_rol"], "idx_administradores_rol");
  });

  // Comentario descriptivo para la tabla
  await knex.raw('COMMENT ON TABLE administradores IS \'Tabla de asociación entre usuarios y roles administrativos\'');
}

export async function down(knex) {
  await knex.schema.dropTable("administradores");
}