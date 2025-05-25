export async function up(knex) {
  // 1. Crear tabla r_horarios_unidad_curricular
  await knex.schema.createTable('r_horarios_unidad_curricular', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('id_horario').unsigned().notNullable().references('id').inTable('horarios')
    table.bigInteger('id_unidad_curricular').unsigned().notNullable().references('id').inTable('unidad_curricular')
    
    table.unique(['id_horario', 'id_unidad_curricular']);
    table.index('id_horario');
    table.index('id_unidad_curricular');
  });

  // 2. Crear tabla r_profesores_unidad_curricular
  await knex.schema.createTable('r_profesores_unidad_curricular', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('id_profesores').unsigned().notNullable().references('id').inTable('profesores')
    table.bigInteger('id_unidad_curricular').unsigned().notNullable().references('id').inTable('unidad_curricular')
    
    table.unique(['id_profesores', 'id_unidad_curricular']);
    table.index('id_profesores');
    table.index('id_unidad_curricular');
  });

  // 3. Crear tabla r_unidad_curricular_seccion
  await knex.schema.createTable('r_unidad_curricular_seccion', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('id_unidad_curricular').unsigned().notNullable().references('id').inTable('unidad_curricular')
    table.bigInteger('id_seccion').unsigned().notNullable().references('id').inTable('secciones')
    
    table.unique(['id_unidad_curricular', 'id_seccion']);
    table.index('id_unidad_curricular');
    table.index('id_seccion');
  });
}

export async function down(knex) {
  // Eliminar en orden inverso al de creación
  await knex.schema.dropTable('r_unidad_curricular_seccion');
  await knex.schema.dropTable('r_profesores_unidad_curricular');
  await knex.schema.dropTable('r_horarios_unidad_curricular');
}