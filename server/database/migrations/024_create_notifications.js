// migrations/xxxx_create_notifications.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex){
  await knex.schema.createTable('notifications', (table) => {
    table.bigInteger('id').primary().comment('ID único de la notificación');
    table.bigInteger('user_id').comment('ID del usuario destinatario (nulo para notificaciones masivas)');
    table.string('type', 50).notNullable().comment('Tipo de notificación');
    table.string('title', 255).notNullable().comment('Título de la notificación');
    table.text('body').comment('Contenido principal de la notificación');
    table.boolean('is_read').defaultTo(false).comment('Indica si la notificación fue leída');
    table.timestamp('read_at').comment('Fecha/hora de lectura');
    table.jsonb('metadata').comment('Metadatos adicionales en formato JSON');
    table.timestamp('created_at').defaultTo(knex.fn.now()).comment('Fecha de creación');
    table.boolean('is_mass').defaultTo(false).comment('Indica si es notificación masiva');
    table.bigInteger('mass_parent_id').comment('ID de la notificación padre para masivas');

    // Índices
    table.index('created_at', 'notifications_created_at_index', 'btree');
    table.index('is_mass', 'notifications_is_mass_index', 'btree');
    table.index('user_id', 'notifications_user_id_index', 'btree');

    // Relaciones
    table.foreign('user_id')
      .references('cedula')
      .inTable('users')
      .onDelete('CASCADE');
      
    table.foreign('mass_parent_id')
      .references('id')
      .inTable('notifications');
  });

  await knex.raw(`
    COMMENT ON TABLE notifications IS 'Esta es la tabla principal de las notificaciones';
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex){
  await knex.schema.dropTable('notifications');
};