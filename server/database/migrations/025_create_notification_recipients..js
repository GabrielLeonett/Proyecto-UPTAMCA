// migrations/xxxx_create_notification_recipients.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex){
  await knex.schema.createTable('notification_recipients', (table) => {
    table.bigInteger('notification_id').notNullable().comment('ID de la notificación');
    table.bigInteger('user_id').notNullable().comment('ID del usuario destinatario');
    table.boolean('is_read').defaultTo(false).comment('Indica si el usuario leyó esta notificación masiva');

    // Clave primaria compuesta
    table.primary(['notification_id', 'user_id'], 'notification_recipients_pkey');
    
    // Índice adicional
    table.index('user_id', 'notification_recipients_user_id_index', 'btree');

    // Relaciones
    table.foreign('notification_id')
      .references('id')
      .inTable('notifications')
      .onDelete('CASCADE');
      
    table.foreign('user_id')
      .references('cedula')
      .inTable('users')
      .onDelete('CASCADE');
  });

  await knex.raw(`
    COMMENT ON TABLE notification_recipients IS 'Esta tabla es para notificaciones a uno o varios usuarios';
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex){
  await knex.schema.dropTable('notification_recipients');
};