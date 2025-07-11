export async function up(knex) {

  await knex.schema.createTable("profesores", (table) => {
    // Identificador único
    table.bigIncrements("id_profesor")
      .primary()
      .comment('ID único del profesor');
    
    table.bigInteger("id_cedula")
      .notNullable()
      .references("cedula").inTable("users")
      .onDelete("CASCADE")
      .unique()
      .comment('Relación con la tabla de usuarios (1 a 1)');
    
    
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
    table.index(["fecha_ingreso"], "idx_profesores_antiguedad");
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("profesores");
}