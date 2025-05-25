// migrations/YYYYMMDDHHMMSS_create_horario_table.js
export function up(knex) {
  return knex.schema.createTable('horarios', (table) => {
    table.bigIncrements('id').primary();
    
    // Mejoramos el campo dia_horario con ENUM para valores consistentes
    table.enum('dia_horario', [
      'lunes',
      'martes',
      'miércoles',
      'jueves',
      'viernes',
      'sábado',
      'domingo'
    ]).notNullable();
    
    // Campos de tiempo con validación adicional
    table.time('inicio_horario').notNullable();
    table.time('fin_horario').notNullable();
  });
}

export function down(knex) {
  return knex.schema.dropTable('horarios');
}