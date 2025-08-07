// migrations/xxxx_create_categorias.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex){
  await knex.schema.createTable('categorias', (table) => {
    table.smallint('id_categoria').primary().comment('ID numérico pequeño de la categoría (1-255)');
    table.string('nombre_categoria', 50).unique().notNullable().comment('Nombre descriptivo de la categoría (debe ser único)');
    table.text('descripcion_categoria').comment('Descripción detallada de la categoría');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now()).comment('Fecha de creación del registro');
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now()).comment('Fecha de última actualización del registro');

    // Índice adicional
    table.index('nombre_categoria', 'idx_categoria_nombre', 'btree');
  });

  await knex.raw(`
    COMMENT ON TABLE categorias IS 'Tabla para la categoria de los';
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex){
  await knex.schema.dropTable('categorias');
};
