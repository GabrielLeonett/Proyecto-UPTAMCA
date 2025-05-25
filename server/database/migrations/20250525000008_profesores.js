export async function up(knex) {
  // 1. Primero crear la tabla profesores
  await knex.schema.createTable("profesores", (table) => {
    table.bigIncrements("id").primary();
    table.bigInteger("id_categoria").unsigned().notNullable().references("id").inTable("categoria");
    table.bigInteger("id_cedula").unsigned().notNullable().references("id").inTable("users").unique();
    table.bigInteger("id_dedicacion").unsigned().notNullable().references("id").inTable("dedicacion");
    table.bigInteger("id_ubicacion").unsigned().notNullable().references("id").inTable("ubicacion");
    table.string("pre_grado", 300).notNullable();
    table.string("pos_grado", 300).notNullable();
    table.date("fecha_ingreso").notNullable();
    table.integer("disponibilidad").notNullable();
    table.timestamps(true, true);
    
    // Índices para mejorar rendimiento en búsquedas frecuentes
    table.index(["id_cedula"]);
    table.index(["id_ubicacion"]);
  });

  // 2. Luego crear el procedimiento almacenado
  await knex.raw(`
    CREATE OR REPLACE PROCEDURE public.registrar_profesor(
      IN p_id_categoria bigint,
      IN p_id_cedula bigint,
      IN p_id_dedicacion bigint,
      IN p_id_ubicacion bigint,
      IN p_pre_grado varchar,
      IN p_pos_grado varchar,
      IN p_fecha_ingreso date,
      IN p_disponibilidad integer,
      OUT p_resultado varchar
    )
    LANGUAGE plpgsql
    AS $$
    DECLARE
      v_id_profesor BIGINT;
      v_user_exists BOOLEAN;
      v_es_profesor BOOLEAN;
    BEGIN
      -- Verificar que el usuario existe
      SELECT EXISTS(SELECT 1 FROM users WHERE id = p_id_cedula) INTO v_user_exists;
      IF NOT v_user_exists THEN
        p_resultado := 'Error: El usuario con ID ' || p_id_cedula || ' no existe';
        RETURN;
      END IF;
      
      -- Verificar que no es ya profesor
      SELECT EXISTS(SELECT 1 FROM profesores WHERE id_cedula = p_id_cedula) INTO v_es_profesor;
      IF v_es_profesor THEN
        p_resultado := 'Error: El usuario ya está registrado como profesor';
        RETURN;
      END IF;
      
      -- Verificar referencias en tablas relacionadas
      IF NOT EXISTS (SELECT 1 FROM categoria WHERE id = p_id_categoria) THEN
        p_resultado := 'Error: La categoría especificada no existe';
        RETURN;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM dedicacion WHERE id = p_id_dedicacion) THEN
        p_resultado := 'Error: La dedicación especificada no existe';
        RETURN;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM ubicacion WHERE id = p_id_ubicacion) THEN
        p_resultado := 'Error: La ubicación especificada no existe';
        RETURN;
      END IF;

      -- Insertar el nuevo profesor
      INSERT INTO profesores (
        id_categoria,
        id_cedula,
        id_dedicacion,
        id_ubicacion,
        pre_grado,
        pos_grado,
        fecha_ingreso,
        disponibilidad,
        created_at,
        updated_at
      ) VALUES (
        p_id_categoria,
        p_id_cedula,
        p_id_dedicacion,
        p_id_ubicacion,
        p_pre_grado,
        p_pos_grado,
        p_fecha_ingreso,
        p_disponibilidad,
        NOW(),
        NOW()
      ) RETURNING id INTO v_id_profesor;
      
      p_resultado := 'Éxito: Profesor registrado con ID ' || v_id_profesor;
    EXCEPTION
      WHEN unique_violation THEN
        p_resultado := 'Error: Ya existe un profesor con esta cédula';
      WHEN foreign_key_violation THEN
        p_resultado := 'Error: Datos inválidos en relaciones (categoría, dedicación o ubicación)';
      WHEN OTHERS THEN
        p_resultado := 'Error inesperado: ' || SQLERRM;
    END;
    $$;
  `);
}

export async function down(knex) {
  // 1. Eliminar el procedimiento primero
  await knex.raw('DROP PROCEDURE IF EXISTS public.registrar_profesor(bigint, bigint, bigint, bigint, varchar, varchar, date, integer, OUT varchar)');
  
  // 2. Luego eliminar la tabla
  await knex.schema.dropTable("profesores");
}