// migrations/xxxx_create_users.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex){
  await knex.schema.createTable('users', (table) => {
    table.bigInteger('cedula').primary().notNullable().comment('Número de cédula como identificador único');
    table.string('nombres', 50).notNullable().comment('Nombres del usuario');
    table.string('apellidos', 50).notNullable().comment('Apellidos del usuario');
    table.string('direccion', 200).notNullable().comment('Dirección completa del usuario');
    table.string('password', 100).notNullable().comment('Contraseña encriptada');
    table.string('telefono_movil', 15).notNullable().comment('Teléfono móvil principal');
    table.string('telefono_local', 15).comment('Teléfono local (opcional)');
    table.date('fecha_nacimiento').notNullable().comment('Fecha de nacimiento del usuario');
    table.text('genero').notNullable().comment('Género del usuario');
    table.string('email', 100).unique().notNullable().comment('Correo electrónico único');
    table.boolean('activo').defaultTo(true).comment('Indica si el usuario está activo en el sistema');
    table.timestamp('last_login').comment('Último inicio de sesión');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now()).comment('Fecha de creación del registro');
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now()).comment('Fecha de última actualización');

    // Índices
    table.index('activo', 'idx_users_activo', 'btree');
    table.index('email', 'idx_users_email', 'btree');
    table.index(['nombres', 'apellidos'], 'idx_users_nombre_completo', 'btree');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex){
  await knex.schema.dropTable('users');
};
