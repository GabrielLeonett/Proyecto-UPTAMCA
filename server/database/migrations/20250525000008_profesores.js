export async function up(knex) {
  // 1. Crear tabla profesores
  await knex.schema.createTable("profesores", (table) => {
    table.bigIncrements("id").primary();
    
    // Relaciones con otras tablas
    table.bigInteger("id_categoria").unsigned().notNullable()
      .references("id").inTable("categoria").onDelete("RESTRICT");
    table.bigInteger("id_cedula").unsigned().notNullable()
      .references("id").inTable("users").onDelete("CASCADE").unique();
    table.bigInteger("id_dedicacion").unsigned().notNullable()
      .references("id").inTable("dedicacion").onDelete("RESTRICT");
    table.bigInteger("id_ubicacion").unsigned().notNullable()
      .references("id").inTable("ubicacion").onDelete("RESTRICT");
    
    // Información académica
    table.string("pre_grado", 300).notNullable();
    table.string("pos_grado", 300).notNullable();
    table.string("area_de_conocimiento", 300).notNullable();
    table.date("fecha_ingreso").notNullable();
    
    // Timestamps
    table.timestamps(true, true);
    
    // Índices para mejor rendimiento
    table.index(["id_cedula"]);
    table.index(["id_ubicacion"]);
    table.index(["id_categoria"]);
    table.index(["id_dedicacion"]);
  });

  await knex.raw(`
    CREATE FUNCTION public.buscar_profesor(p_busqueda character varying DEFAULT NULL::character varying) RETURNS TABLE(id character varying, nombres character varying, apellidos character varying, email character varying, nombre_dedicacion character varying, nombre_categoria character varying, nombre_ubicacion character varying, area_conocimiento character varying, fecha_ingreso date, genero character varying)
    LANGUAGE plpgsql
    AS $$
    BEGIN
        RETURN QUERY
        SELECT 
            p.id_cedula::VARCHAR AS id,
            u.nombres::VARCHAR,
            u.apellidos::VARCHAR,
            u.email::VARCHAR,
            d.nombre_dedicacion::VARCHAR AS nombre_dedicacion,  -- Nombre en lugar de ID
            c.nombre_categoria::VARCHAR AS nombre_categoria,   -- Nombre en lugar de ID
            ub.nombre_ubicacion::VARCHAR AS nombre_ubicacion,  -- Nombre en lugar de ID
            p.area_de_conocimiento::VARCHAR,
            p.fecha_ingreso,
            u.genero::VARCHAR
        FROM 
            profesores p
        JOIN 
            users u ON p.id_cedula = u.id
        LEFT JOIN 
            dedicacion d ON p.id_dedicacion = d.id  -- JOIN para obtener nombre
        LEFT JOIN 
            categoria c ON p.id_categoria = c.id     -- JOIN para obtener nombre
        LEFT JOIN 
            ubicacion ub ON p.id_ubicacion = ub.id  -- JOIN para obtener nombre
        WHERE 
            p_busqueda IS NULL OR
            (
                p.id_cedula::VARCHAR = p_busqueda OR
                CONCAT(u.nombres, ' ', u.apellidos) ILIKE '%' || p_busqueda || '%' OR
                u.nombres ILIKE '%' || p_busqueda || '%' OR
                u.apellidos ILIKE '%' || p_busqueda || '%'
            )
        ORDER BY 
            u.apellidos, u.nombres;
    END;
    $$;

    CREATE FUNCTION public.mostrar_profesor(p_nombre_dedicacion character varying DEFAULT NULL::character varying, p_nombre_categoria character varying DEFAULT NULL::character varying, p_nombre_ubicacion character varying DEFAULT NULL::character varying, p_area_de_conocimiento character varying DEFAULT NULL::character varying, p_fecha_ingreso date DEFAULT NULL::date, p_genero character varying DEFAULT NULL::character varying) RETURNS TABLE(id character varying, nombres character varying, apellidos character varying, email character varying, nombre_dedicacion character varying, nombre_categoria character varying, nombre_ubicacion character varying, area_conocimiento character varying, fecha_ingreso date, genero character varying)
    LANGUAGE plpgsql
    AS $$
    BEGIN
        RETURN QUERY
        SELECT 
            p.id_cedula::VARCHAR AS id,
            u.nombres::VARCHAR,
            u.apellidos::VARCHAR,
            u.email::VARCHAR,
            d.nombre_dedicacion::VARCHAR AS nombre_dedicacion,
            c.nombre_categoria::VARCHAR AS nombre_categoria,
            ub.nombre_ubicacion::VARCHAR AS nombre_ubicacion,
            p.area_de_conocimiento::VARCHAR,
            p.fecha_ingreso,
            u.genero::VARCHAR
        FROM 
            profesores p
        JOIN 
            users u ON p.id_cedula = u.id
        LEFT JOIN 
            dedicacion d ON p.id_dedicacion = d.id
        LEFT JOIN 
            categoria c ON p.id_categoria = c.id
        LEFT JOIN 
            ubicacion ub ON p.id_ubicacion = ub.id
        WHERE 
            (p_nombre_dedicacion IS NULL OR d.nombre_dedicacion ILIKE '%' || p_nombre_dedicacion || '%')
            AND (p_nombre_categoria IS NULL OR c.nombre_categoria ILIKE '%' || p_nombre_categoria || '%')
            AND (p_nombre_ubicacion IS NULL OR ub.nombre_ubicacion ILIKE '%' || p_nombre_ubicacion || '%')
            AND (p_area_de_conocimiento IS NULL OR p.area_de_conocimiento ILIKE '%' || p_area_de_conocimiento || '%')
            AND (p_fecha_ingreso IS NULL OR p.fecha_ingreso = p_fecha_ingreso)
            AND (p_genero IS NULL OR u.genero::VARCHAR = p_genero)
        ORDER BY 
            u.apellidos, u.nombres;
    END;
    $$;

    CREATE PROCEDURE public.registrar_profesor(IN p_id_cedula bigint, IN p_nombre_categoria character varying, IN p_nombre_dedicacion character varying, IN p_nombre_ubicacion character varying, IN p_pre_grado character varying, IN p_pos_grado character varying, IN p_area_de_conocimiento character varying, IN p_fecha_ingreso date, OUT p_resultado json)
    LANGUAGE plpgsql
    AS $$
    DECLARE
        v_id_profesor BIGINT;
        v_user_exists BOOLEAN;
        v_es_profesor BOOLEAN;
        v_id_categoria BIGINT;
        v_id_dedicacion BIGINT;
        v_id_ubicacion BIGINT;
    BEGIN
        -- Validar existencia del usuario
        SELECT EXISTS(SELECT 1 FROM users WHERE id = p_id_cedula) INTO v_user_exists;
        IF NOT v_user_exists THEN
            p_resultado := json_build_object('status', 'error', 'message', 'El usuario con ID ' || p_id_cedula || ' no existe');
            RETURN;
        END IF;

        -- Verificar si el usuario ya es profesor
        SELECT EXISTS(SELECT 1 FROM profesores WHERE id_cedula = p_id_cedula) INTO v_es_profesor;
        IF v_es_profesor THEN
            p_resultado := json_build_object('status', 'error', 'message', 'El usuario ya está registrado como profesor');
            RETURN;
        END IF;

        -- Obtener IDs basados en los nombres proporcionados
        SELECT id INTO v_id_categoria FROM categoria WHERE nombre_categoria = p_nombre_categoria;
        IF v_id_categoria IS NULL THEN
            p_resultado := json_build_object('status', 'error', 'message', 'La categoría especificada no existe');
            RETURN;
        END IF;

        SELECT id INTO v_id_dedicacion FROM dedicacion WHERE nombre_dedicacion = p_nombre_dedicacion;
        IF v_id_dedicacion IS NULL THEN
            p_resultado := json_build_object('status', 'error', 'message', 'La dedicación especificada no existe');
            RETURN;
        END IF;

        SELECT id INTO v_id_ubicacion FROM ubicacion WHERE nombre_ubicacion = p_nombre_ubicacion;
        IF v_id_ubicacion IS NULL THEN
            p_resultado := json_build_object('status', 'error', 'message', 'La ubicación especificada no existe');
            RETURN;
        END IF;

        -- Insertar profesor en la base de datos
        INSERT INTO profesores (
            id_categoria, id_cedula, id_dedicacion, id_ubicacion,
            pre_grado, pos_grado, area_de_conocimiento, fecha_ingreso,
            created_at, updated_at
        ) VALUES (
            v_id_categoria, p_id_cedula, v_id_dedicacion, v_id_ubicacion,
            p_pre_grado, p_pos_grado, p_area_de_conocimiento, p_fecha_ingreso,
            NOW(), NOW()
        ) RETURNING id INTO v_id_profesor;

        -- Respuesta de éxito
        p_resultado := json_build_object(
            'status', 'success',
            'message', 'Profesor registrado correctamente',
            'profesor_id', v_id_profesor
        );

    EXCEPTION
        WHEN unique_violation THEN
            p_resultado := json_build_object('status', 'error', 'message', 'Ya existe un profesor con esta cédula');
        WHEN foreign_key_violation THEN
            p_resultado := json_build_object('status', 'error', 'message', 'Error de clave foránea: Datos inválidos');
        WHEN OTHERS THEN
            p_resultado := json_build_object('status', 'error', 'message', 'Error inesperado: ' || SQLERRM);
    END;
    $$;

    `);

}

export async function down(knex) {
  // 1. Eliminar funciones primero
  await knex.raw("DROP FUNCTION IF EXISTS public.mostrar_profesor");
  await knex.raw("DROP FUNCTION IF EXISTS public.buscar_profesor");
  
  // 2. Eliminar procedimiento
  await knex.raw("DROP PROCEDURE IF EXISTS public.registrar_profesor");
  
  // 3. Finalmente eliminar la tabla
  await knex.schema.dropTableIfExists("profesores");
}