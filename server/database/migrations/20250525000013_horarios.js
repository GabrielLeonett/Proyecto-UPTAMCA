// migrations/YYYYMMDDHHMMSS_create_horario_table.js
export async function up(knex) {
  await knex.schema
    .createTable('horarios', (table) => {
      table.bigIncrements('id').primary();
      
      // Relaciones con otras tablas (CORRECCIÓN: cambiar 'id' a 'seccion_id')
      table.bigInteger('seccion_id').unsigned().notNullable()
        .references('id').inTable('secciones').onDelete('CASCADE');
      table.bigInteger('profesor_id').unsigned().notNullable()
        .references('id').inTable('profesores').onDelete('RESTRICT');
      table.bigInteger('unidad_curricular_id').unsigned().notNullable()
        .references('id').inTable('unidades_curriculares').onDelete('RESTRICT');
      
      // Día de la semana con ENUM
      table.enum('dia_semana', [
        'lunes',
        'martes',
        'miércoles',
        'jueves',
        'viernes',
        'sábado',
        'domingo'
      ]).notNullable();
      
      // Horarios
      table.time('hora_inicio').notNullable();
      table.time('hora_fin').notNullable();
      
      // Aula y estado
      table.string('aula', 50);
      table.boolean('activo').defaultTo(true);
      
      // Timestamps
      table.timestamp('creado_en').defaultTo(knex.fn.now());
      table.timestamp('actualizado_en').defaultTo(knex.fn.now());
      
      // Restricción para evitar horarios inválidos
      table.check('?? < ??', ['hora_inicio', 'hora_fin']);
      
      // Restricción de unicidad
      table.unique(['seccion_id', 'dia_semana', 'hora_inicio', 'hora_fin']);
    })
    
  await knex.raw(`
    CREATE FUNCTION public.insertar_horario(p_id_seccion bigint, p_id_profesor bigint, p_id_unidad_curricular bigint, p_dia_semana character varying, p_hora_inicio time without time zone, p_hora_fin time without time zone, p_aula character varying DEFAULT NULL::character varying, p_activo boolean DEFAULT true) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
    DECLARE
        v_id_horario BIGINT;
        v_resultado JSONB;
        v_conflictos INT;
    BEGIN
        -- Validación básica de datos de entrada
        IF p_hora_inicio >= p_hora_fin THEN
            RETURN jsonb_build_object(
                'estado', 'error',
                'mensaje', 'La hora de inicio debe ser anterior a la hora de fin'
            );
        END IF;

        -- Verificar que el día sea válido
        IF p_dia_semana NOT IN ('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo') THEN
            RETURN jsonb_build_object(
                'estado', 'error',
                'mensaje', 'Día de la semana no válido'
            );
        END IF;

        -- Verificar existencia de referencias
        IF NOT EXISTS (SELECT 1 FROM SECCION WHERE ID_SECCION = p_id_seccion) THEN
            RETURN jsonb_build_object(
                'estado', 'error',
                'mensaje', 'La sección especificada no existe'
            );
        END IF;

        IF NOT EXISTS (SELECT 1 FROM PROFESOR WHERE ID_PROFESOR = p_id_profesor) THEN
            RETURN jsonb_build_object(
                'estado', 'error',
                'mensaje', 'El profesor especificado no existe'
            );
        END IF;

        IF NOT EXISTS (SELECT 1 FROM UNIDAD_CURRICULAR WHERE ID_UNIDAD_CURRICULAR = p_id_unidad_curricular) THEN
            RETURN jsonb_build_object(
                'estado', 'error',
                'mensaje', 'La unidad curricular especificada no existe'
            );
        END IF;

        -- Verificar conflictos de horario para el profesor
        SELECT COUNT(*) INTO v_conflictos
        FROM HORARIO
        WHERE ID_PROFESOR = p_id_profesor
          AND DIA_SEMANA = p_dia_semana
          AND (
              (p_hora_inicio BETWEEN HORA_INICIO AND HORA_FIN) OR
              (p_hora_fin BETWEEN HORA_INICIO AND HORA_FIN) OR
              (HORA_INICIO BETWEEN p_hora_inicio AND p_hora_fin)
          );

        IF v_conflictos > 0 THEN
            RETURN jsonb_build_object(
                'estado', 'error',
                'mensaje', 'El profesor tiene un conflicto de horario en ese intervalo',
                'conflictos', v_conflictos
            );
        END IF;

        -- Verificar conflictos de horario para la sección
        SELECT COUNT(*) INTO v_conflictos
        FROM HORARIO
        WHERE ID_SECCION = p_id_seccion
          AND DIA_SEMANA = p_dia_semana
          AND (
              (p_hora_inicio BETWEEN HORA_INICIO AND HORA_FIN) OR
              (p_hora_fin BETWEEN HORA_INICIO AND HORA_FIN) OR
              (HORA_INICIO BETWEEN p_hora_inicio AND p_hora_fin)
          );

        IF v_conflictos > 0 THEN
            RETURN jsonb_build_object(
                'estado', 'error',
                'mensaje', 'La sección tiene un conflicto de horario en ese intervalo',
                'conflictos', v_conflictos
            );
        END IF;

        -- Insertar el registro
        INSERT INTO HORARIO (
            ID_SECCION,
            ID_PROFESOR,
            ID_UNIDAD_CURRICULAR,
            DIA_SEMANA,
            HORA_INICIO,
            HORA_FIN,
            AULA,
            ACTIVO
        ) VALUES (
            p_id_seccion,
            p_id_profesor,
            p_id_unidad_curricular,
            p_dia_semana,
            p_hora_inicio,
            p_hora_fin,
            p_aula,
            p_activo
        ) RETURNING ID_HORARIO INTO v_id_horario;

        -- Retornar resultado exitoso
        RETURN jsonb_build_object(
            'estado', 'éxito',
            'mensaje', 'Horario insertado correctamente',
            'id_horario', v_id_horario
        );

    EXCEPTION
        WHEN unique_violation THEN
            RETURN jsonb_build_object(
                'estado', 'error',
                'mensaje', 'Ya existe un horario idéntico para esta sección'
            );
        WHEN foreign_key_violation THEN
            RETURN jsonb_build_object(
                'estado', 'error',
                'mensaje', 'Violación de clave foránea - verifique las referencias'
            );
        WHEN OTHERS THEN
            RETURN jsonb_build_object(
                'estado', 'error',
                'mensaje', SQLERRM,
                'codigo_error', SQLSTATE
            );
    END;
    $$;

    `)
}

export async function down(knex) {
  await knex.schema
    .raw('DROP TRIGGER IF EXISTS actualizar_horarios_timestamp ON horarios')
    .then(() => knex.raw('DROP FUNCTION IF EXISTS actualizar_timestamp()'))
    .then(() => knex.raw('DROP FUNCTION IF EXISTS insertar_horario()'))
    .then(() => knex.schema.dropTable('horarios'));
}