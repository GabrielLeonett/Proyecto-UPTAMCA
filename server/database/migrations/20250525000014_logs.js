/**
 * Tabla para registrar eventos del sistema (auditoría, trazabilidad).
 * - Cada registro representa un evento significativo (ej: login, creación de recursos).
 * - Los campos JSONB permiten flexibilidad para datos no estructurados.
 */
export async function up(knex) {
  await knex.schema.createTable('logs', (table) => {
    // ID único autoincremental
    table.bigIncrements('id').primary().comment('Identificador único del log');
    
    // Tipo de evento (categorización)
    table.string('event_type', 50).notNullable().comment('Tipo de evento (ej: "user_login", "post_created")');
    
    // Mensaje descriptivo
    table.text('message').comment('Descripción detallada del evento');
    
    // Datos adicionales en formato JSON
    table.jsonb('metadata').comment('Información adicional estructurada (ej: IP, dispositivo)');
    
    // Relación con usuarios (opcional)
    table.bigInteger('user_id').unsigned()
      .references('cedula').inTable('users')
      .onDelete('SET NULL')
      .comment('ID del usuario asociado al evento (si aplica)');
    
    // Referencia a recursos (ej: posts, comentarios)
    table.string('reference_id', 100).comment('ID del recurso relacionado (ej: "post_123")');
    
    // Fecha de creación automática
    table.timestamp('created_at').defaultTo(knex.fn.now())
      .comment('Fecha y hora en que se registró el evento');

    // Índices para optimización
    table.index(['event_type'], 'idx_logs_event_type').comment('Índice para filtrar por tipo de evento');
    table.index(['user_id'], 'idx_logs_user_id').comment('Índice para búsquedas por usuario');
  });
}

export async function down(knex) {
  await knex.schema.dropTable('logs');
}