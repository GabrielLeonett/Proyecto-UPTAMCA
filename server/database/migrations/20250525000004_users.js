export async function up(knex) {
  await knex.schema.createTable("users", (table) => {
    // Identificador principal (cédula como bigInt)
    table.bigInteger("cedula")
      .primary()
      .comment('Número de cédula como identificador único');
    
    // Datos personales
    table.string("nombres", 50)
      .notNullable()
      .comment('Nombres del usuario');
    
    table.string("apellidos", 50)
      .notNullable()
      .comment('Apellidos del usuario');
    
    table.string("direccion", 200)
      .notNullable()
      .comment('Dirección completa del usuario');
    
    // Credenciales y contacto
    table.string("password", 100)
      .notNullable()
      .comment('Contraseña encriptada');
    
    table.string("telefono_movil", 15)
      .notNullable()
      .comment('Teléfono móvil principal');
    
    table.string("telefono_local", 15)
      .nullable()
      .comment('Teléfono local (opcional)');
    
    // Información demográfica
    table.date("fecha_nacimiento")
      .notNullable()
      .comment('Fecha de nacimiento del usuario');
    
    table.enu("genero", ["masculino", "femenino"])
      .notNullable()
      .comment('Género del usuario');
    
    // Autenticación
    table.string("email", 100)
      .unique()
      .notNullable()
      .comment('Correo electrónico único');
    
    table.boolean("activo")
      .defaultTo(true)
      .comment('Indica si el usuario está activo en el sistema');
    
    table.timestamp("last_login")
      .nullable()
      .comment('Último inicio de sesión');
    
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
    table.index(["email"], "idx_users_email");
    table.index(["nombres", "apellidos"], "idx_users_nombre_completo");
    table.index(["activo"], "idx_users_activo");
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("usuario_rol");
  await knex.schema.dropTableIfExists("notifications");
  await knex.schema.dropTableIfExists("logs");
  await knex.schema.dropTableIfExists("profesores");
  await knex.schema.dropTableIfExists("coordinadores");
  await knex.schema.dropTableIfExists("users");
}