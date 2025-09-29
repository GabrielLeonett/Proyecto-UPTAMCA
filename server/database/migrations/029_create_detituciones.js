// migrations/20250929000000_create_destituciones.js

export async function up(knex) {
  await knex.schema.createTable('destituciones', (table) => {
    // Columnas principales
    table.bigIncrements('id_registro').primary();
    table.integer('usuario_id').notNullable();
    table.integer('rol_id').notNullable();
    table.enu('tipo_accion', ['DESTITUCION', 'ELIMINACION', 'RENUNCIA', 'RETIRO']).notNullable();
    table.text('razon').notNullable();
    table.text('observaciones');
    table.date('fecha_efectiva').notNullable();
    table.integer('usuario_accion').notNullable();
    table.timestamps(true, true); // created_at y updated_at

    // Foreign keys
    table.foreign('usuario_id')
         .references('cedula')
         .inTable('users')
         .onDelete('CASCADE');
         
    table.foreign('rol_id')
         .references('id_rol')
         .inTable('roles')
         .onDelete('CASCADE');
         
    table.foreign('usuario_accion')
         .references('cedula')
         .inTable('users')
         .onDelete('CASCADE');

    // Índices
    table.index('usuario_id');
    table.index('rol_id');
    table.index('fecha_efectiva');
    table.index('tipo_accion');
  });

  // Comentarios (si tu versión de PostgreSQL y Knex lo soportan)
  await knex.raw(`
    COMMENT ON TABLE destituciones IS 'Registro de destituciones, eliminaciones, renuncias o retiros de usuarios de roles específicos';
    COMMENT ON COLUMN destituciones.id_registro IS 'ID único del registro';
    COMMENT ON COLUMN destituciones.usuario_id IS 'ID del usuario afectado (referencia a users.cedula)';
    COMMENT ON COLUMN destituciones.rol_id IS 'Rol del que fue destituido/eliminado (referencia a roles.id_rol)';
    COMMENT ON COLUMN destituciones.tipo_accion IS 'Tipo de acción: DESTITUCION, ELIMINACION, RENUNCIA, RETIRO';
    COMMENT ON COLUMN destituciones.razon IS 'Razón principal de la destitución/eliminación';
    COMMENT ON COLUMN destituciones.observaciones IS 'Observaciones adicionales o detalles';
    COMMENT ON COLUMN destituciones.fecha_efectiva IS 'Fecha cuando la acción es efectiva';
    COMMENT ON COLUMN destituciones.usuario_accion IS 'Usuario que ejecutó la acción (referencia a users.cedula)';
  `);
}

export function down(knex) {
  return knex.schema.dropTable('destituciones');
}