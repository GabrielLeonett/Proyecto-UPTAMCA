export async function up(knex) {
  await knex.schema.createTable("horarios", (table) => {
    table.bigIncrements("id_horario")
      .primary()
      .comment('ID único del horario');

    table.bigInteger("seccion_id")
      .notNullable()
      .references("id_seccion").inTable("secciones")
      .onDelete("CASCADE")
      .comment('Sección asociada al horario');
    
    table.bigInteger("profesor_id")
      .notNullable()
      .references("id_profesor").inTable("profesores")
      .onDelete("RESTRICT")
      .comment('Profesor asignado');
    
    table.bigInteger("unidad_curricular_id")
      .notNullable()
      .references("id_unidad_curricular").inTable("unidades_curriculares")
      .onDelete("RESTRICT")
      .comment('Unidad curricular programada');

    // Configuración del horario
    table.enu("dia_semana", [
        "Lunes", 
        "Martes", 
        "Miércoles", 
        "Jueves", 
        "Viernes", 
        "Sábado"
      ])
      .notNullable()
      .comment('Día de la semana (domingo excluido por ser no lectivo)');
    
    table.time("hora_inicio")
      .notNullable()
      .comment('Hora de inicio de la clase');
    
    table.time("hora_fin")
      .notNullable()
      .comment('Hora de finalización de la clase');
    
    // Detalles adicionales
    table.string("aula", 50)
      .notNullable()
      .comment('Aula o espacio físico asignado');
    
    
    table.boolean("activo")
      .defaultTo(true)
      .notNullable()
      .comment('Indica si el horario está actualmente activo');

    // Auditoría
    table.timestamp("created_at")
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('Fecha de creación del registro');
    
    table.timestamp("updated_at")
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('Fecha de última actualización');

    // Restricciones
    table.check("hora_inicio < hora_fin", [], "chk_horario_valido");
    
    // Restricción de unicidad compuesta
    table.unique(
      ["profesor_id", "dia_semana", "hora_inicio","hora_fin"], 
      "uq_profesor_horario"
    );
    
    table.unique(
      ["aula", "dia_semana", "hora_inicio", "hora_fin"], 
      "uq_aula_horario"
    );

    // Índices para mejor rendimiento
    table.index(["seccion_id"], "idx_horarios_seccion");
    table.index(["profesor_id"], "idx_horarios_profesor");
    table.index(["unidad_curricular_id"], "idx_horarios_uc");
    table.index(["dia_semana", "hora_inicio"], "idx_horarios_dia_hora");
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists("horarios");
}