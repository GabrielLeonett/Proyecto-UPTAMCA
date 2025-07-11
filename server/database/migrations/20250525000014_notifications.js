export function up(knex) {
  return knex.schema.createTable('notifications', (table) => {
      table.bigIncrements('id').primary().comment('ID único de la notificación');
      table.bigInteger('user_id').nullable().references('users.cedula').onDelete('CASCADE')
        .comment('ID del usuario destinatario (nulo para notificaciones masivas)');
      table.string('type', 50).notNullable().comment('Tipo de notificación');
      table.string('title', 255).notNullable().comment('Título de la notificación');
      table.text('body').nullable().comment('Contenido principal de la notificación');
      table.boolean('is_read').defaultTo(false).comment('Indica si la notificación fue leída');
      table.timestamp('read_at').nullable().comment('Fecha/hora de lectura');
      table.jsonb('metadata').nullable().comment('Metadatos adicionales en formato JSON');
      table.timestamp('created_at').defaultTo(knex.fn.now()).comment('Fecha de creación');
      table.boolean('is_mass').defaultTo(false).comment('Indica si es notificación masiva');
      table.bigInteger('mass_parent_id').nullable().references('notifications.id')
        .comment('ID de la notificación padre para masivas');
      
      table.index(['user_id']).comment('Índice para búsquedas por usuario');
      table.index(['is_mass']).comment('Índice para filtrar notificaciones masivas');
      table.index(['created_at']).comment('Índice para ordenar por fecha');
    })
    .then(() => {
      return knex.schema.createTable('notification_roles', (table) => {
        table.bigInteger('notification_id').references('notifications.id').onDelete('CASCADE')
          .comment('ID de la notificación relacionada');
        table.integer('role_id').references('roles.id_rol').onDelete('CASCADE')
          .comment('ID del rol destinatario');
        table.primary(['notification_id', 'role_id'])
          .comment('Clave primaria compuesta para relación notificación-rol');
      });
    })
    .then(() => {
      return knex.schema.createTable('notification_recipients', (table) => {
        table.bigInteger('notification_id').references('notifications.id').onDelete('CASCADE')
          .comment('ID de la notificación');
        table.bigInteger('user_id').references('users.cedula').onDelete('CASCADE')
          .comment('ID del usuario destinatario');
        table.boolean('is_read').defaultTo(false)
          .comment('Indica si el usuario leyó esta notificación masiva');
        table.primary(['notification_id', 'user_id'])
          .comment('Clave primaria compuesta');
        table.index(['user_id']).comment('Índice para búsquedas por usuario');
      });
    });
}

export function down(knex) {
  return knex.schema.dropTable('notification_recipients')
    .then(() => knex.schema.dropTable('notification_roles'))
    .then(() => knex.schema.dropTable('notifications'));
}