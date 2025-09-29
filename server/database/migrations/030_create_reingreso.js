// migrations/030_create_reingresos.js

export function up(knex) {
  return knex.schema.createTable('reingresos', function(table) {
    // Columnas principales
    table.bigIncrements('id_reingreso').primary();
    table.integer('usuario_id').notNullable();
    table.integer('rol_id').notNullable();
    
    // Información del reingreso
    table.enu('tipo_reingreso', ['REINGRESO', 'REINCORPORACION', 'REINTEGRO']).notNullable();
    table.text('motivo_reingreso').notNullable();
    table.text('observaciones');
    table.date('fecha_solicitud').notNullable();
    table.date('fecha_aprobacion').notNullable();
    table.date('fecha_efectiva').notNullable();
    
    // Referencia al registro anterior de destitución/eliminación
    table.bigInteger('registro_anterior_id').notNullable();
    
    // Estado del proceso
    table.enu('estado', ['PENDIENTE', 'APROBADO', 'RECHAZADO', 'CANCELADO']).defaultTo('PENDIENTE');
    
    // Usuarios involucrados
    table.integer('usuario_solicitante').notNullable();
    table.integer('usuario_aprobador');
    
    // Timestamps
    table.timestamps(true, true);

    // Foreign keys
    table.foreign('usuario_id')
         .references('cedula')
         .inTable('users')
         .onDelete('RESTRICT');
         
    table.foreign('rol_id')
         .references('id_rol')
         .inTable('roles')
         .onDelete('RESTRICT');
         
    table.foreign('registro_anterior_id')
         .references('id_registro')
         .inTable('destituciones')
         .onDelete('RESTRICT');
         
    table.foreign('usuario_solicitante')
         .references('cedula')
         .inTable('users')
         .onDelete('RESTRICT');
         
    table.foreign('usuario_aprobador')
         .references('cedula')
         .inTable('users')
         .onDelete('RESTRICT');

    // Índices
    table.index('usuario_id');
    table.index('rol_id');
    table.index('registro_anterior_id');
    table.index('estado');
    table.index('fecha_efectiva');
    table.index('fecha_solicitud');
  });
}

export function down(knex) {
  return knex.schema.dropTable('reingresos');
}