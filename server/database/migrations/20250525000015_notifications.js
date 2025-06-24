/**
 * Tabla para notificaciones a usuarios (estilo Facebook).
 * - Soporta notificaciones dinámicas con enlaces a recursos.
 * - Permite marcar como leídas/no leídas.
 */
export async function up(knex) {
  await knex.schema.createTable('notifications', (table) => {
    // ID único autoincremental
    table.bigIncrements('id').primary().comment('Identificador único de la notificación');
    
    // Usuario destinatario (relación obligatoria)
    table.bigInteger('user_id').unsigned().notNullable()
      .references('cedula').inTable('users')
      .onDelete('CASCADE')
      .comment('ID del usuario que recibe la notificación');
    
    // Tipo de notificación
    table.string('type', 50).notNullable()
      .comment('Categoría de la notificación (ej: "friend_request", "post_comment")');
    
    // Título breve
    table.string('title', 100).notNullable()
      .comment('Título resumido (ej: "Nuevo comentario en tu post")');
    
    // Cuerpo detallado
    table.text('body')
      .comment('Contenido extendido de la notificación');
    
    // Estado de lectura
    table.boolean('is_read').defaultTo(false)
      .comment('Indica si la notificación ha sido leída');
    
    // Recurso relacionado
    table.string('reference_id', 100)
      .comment('ID del recurso vinculado (ej: "post_789")');
    
    // URL de acción dinámica
    table.string('action_url', 500)
      .comment('URL plantilla para redirección (ej: "/posts/:post_id")');
    
    // Metadatos flexibles (JSON)
    table.jsonb('metadata')
      .comment('Datos adicionales (ej: avatar del remitente, preview)');
    
    // Fecha de creación automática
    table.timestamp('created_at').defaultTo(knex.fn.now())
      .comment('Fecha y hora de creación');

    // Índices para optimización
    table.index(['user_id', 'is_read'], 'idx_notifications_user_unread')
      .comment('Índice para consultar notificaciones no leídas por usuario');
    table.index(['type'], 'idx_notifications_type')
      .comment('Índice para filtrar por tipo de notificación');
  });
}

export async function down(knex) {
  await knex.schema.dropTable('notifications');
}