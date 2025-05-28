export async function up(knex) {
  await knex.schema.createTable('pnfs', function(table) {
    table.bigIncrements('id').primary();
    table.string('nombre_pnf', 255).notNullable();
    table.string('descripcion_pnf', 400).notNullable();
    table.integer('poblacion_estudiantil').defaultTo(0);
    table.string('codigo_pnf', 20).unique().notNullable();
    table.timestamps(true, true);
    
    table.index(['codigo_pnf'], 'idx_pnfs_codigo');
    table.index(['nombre_pnf'], 'idx_pnfs_nombre');
  });

  await knex.raw(`
    CREATE FUNCTION public.actualizar_valor_estudiantil_pnf() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
        -- Tu nueva implementación aquí
        UPDATE pnfs
        SET poblacion_estudiantil = (
            SELECT COALESCE(SUM(poblacion_estudiantil), 0)
            FROM trayectos
            WHERE id_pnf = NEW.id_pnf
        ),
        updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.id_pnf;
        
        RETURN NEW;
    END;
    $$;

    CREATE FUNCTION public.registrar_pnf(p_nombre_pnf character varying, p_descripcion_pnf character varying, p_poblacion integer, p_codigo_pnf character varying) RETURNS json
    LANGUAGE plpgsql
    AS $$
    DECLARE
        v_existe_codigo BOOLEAN;
        v_existe_nombre BOOLEAN;
        v_resultado JSON;
    BEGIN
        -- Verificar si el código ya existe
        SELECT EXISTS(SELECT 1 FROM pnfs WHERE codigo_pnf = p_codigo_pnf) INTO v_existe_codigo;
        
        -- Verificar si el nombre ya existe
        SELECT EXISTS(SELECT 1 FROM pnfs WHERE nombre_pnf = p_nombre_pnf) INTO v_existe_nombre;
        
        -- Validaciones
        IF v_existe_codigo THEN
            RETURN json_build_object(
                'status', 'error',
                'message', 'El código PNF ya está registrado'        );
        ELSIF v_existe_nombre THEN
            RETURN json_build_object(
                'status', 'error',
                'message', 'El nombre PNF ya está registrado'        );
        END IF;
        
        -- Insertar el nuevo PNF (el ID se genera automáticamente por la secuencia pnfs_id_seq)
        BEGIN
            INSERT INTO pnfs (
                nombre_pnf,
                descripcion_pnf,
                poblacion_estudiantil,
                codigo_pnf
            ) VALUES (
                p_nombre_pnf,
                p_descripcion_pnf,
                p_poblacion,
                p_codigo_pnf
            );
            
            -- Respuesta exitosa
            v_resultado := json_build_object(
                'status', 'success',
                'message', 'PNF y trayectos registrados exitosamente'
            );
            
        EXCEPTION WHEN OTHERS THEN
            -- Error en la operación
            v_resultado := json_build_object(
                'status', 'error',
                'message', 'Error al registrar el PNF: ' || SQLERRM        );
        END;
        
        RETURN v_resultado;
    END;
    $$;
  `);
}

export async function down(knex) {
  await knex.raw(`
    DROP FUNCTION IF EXISTS actualizar_poblacion_pnf;
    DROP PROCEDURE IF EXISTS registrar_pnf;
  `);
  await knex.schema.dropTable('pnfs');
}