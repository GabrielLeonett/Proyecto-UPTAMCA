// migrations/xxxx_create_pnfs.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex){
  await knex.schema.createTable('pnfs', (table) => {  
    table.increments('id_pnf', { primaryKey: true }); // Crea como integer primero
    table.string('codigo_pnf', 10).unique().notNullable().comment('Código institucional del PNF (ej: ING-INF)');
    table.string('nombre_pnf', 60).unique().notNullable().comment('Nombre completo del Programa Nacional de Formación');
    table.smallint('id_sede').notNullable();
    table.string('descripcion_pnf', 400).notNullable().comment('Objetivos y alcance del programa');
    table.integer('poblacion_estudiantil_pnf').notNullable().defaultTo(0).comment('Estudiantes activos registrados');
    table.boolean('activo').notNullable().defaultTo(true).comment('Indica si el PNF está actualmente activo');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now()).comment('Fecha de creación del registro');
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now()).comment('Fecha de última actualización');

    // Índices
    table.index('codigo_pnf', 'idx_pnfs_codigo', 'btree');
    table.index('activo', 'idx_pnfs_estado', 'btree');
    table.index('nombre_pnf', 'idx_pnfs_nombre', 'btree');

    // Relación con sedes
    table.foreign('id_sede')
      .references('id_sede')
      .inTable('sedes')
      .onDelete('RESTRICT');
  });

  await knex.raw(`
    COMMENT ON TABLE pnfs IS 'Esta es la tabla de los pnfs';

    ALTER TABLE pnfs 
    ALTER COLUMN id_pnf TYPE SMALLINT;
    
    CREATE SEQUENCE IF NOT EXISTS pnfs_id_pnf_seq 
    AS SMALLINT OWNED BY pnfs.id_pnf;
    
    ALTER TABLE pnfs 
    ALTER COLUMN id_pnf 
    SET DEFAULT nextval('pnfs_id_pnf_seq');
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex){
  await knex.schema.dropTable('pnfs');
};