export async function up(knex) {
  await knex.schema.createTable("unidades_curriculares", (table) => {
    // Identificador único
    table.bigIncrements("id_unidad_curricular")
      .primary()
      .comment('ID único de la unidad curricular');

    // Relación con trayectos (corregido a UUID si es el tipo en trayectos)
    table.bigInteger("id_trayecto")
      .notNullable()
      .references("id_trayecto").inTable("trayectos")
      .onDelete("CASCADE")
      .comment('Trayecto al que pertenece la unidad curricular');

    // Información académica
    table.string("codigo_unidad", 20)
      .notNullable()
      .unique()
      .comment('Código único identificador de la unidad (ej: MAT-101)');
      
    table.string("nombre_unidad_curricular", 100)
      .notNullable()
      .comment('Nombre completo de la unidad curricular');
    
    table.text("descripcion_unidad_curricular")
      .notNullable()
      .comment('Descripción detallada de los contenidos y objetivos');

    table.smallint("horas_clase")
      .notNullable()
      .comment('Duración de horas de clase');
    
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
    table.index(["id_trayecto"], "idx_uc_trayecto");
    table.index(["codigo_unidad"], "idx_uc_codigo");
    table.index(["nombre_unidad_curricular"], "idx_uc_nombre");
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("unidades_curriculares");
}