export async function up(knex) {
  await knex.schema.createTable('trayectos', function(table) {
    table.bigIncrements('id').primary();
    table.integer('poblacion_estudiantil');
    table.string('valor_trayecto',20).notNullable();
    table.bigInteger('id_pnf').notNullable().references('id').inTable('pnfs');
    table.timestamps(true, true);
    
    // Índice para mejorar rendimiento en búsquedas por PNF
    table.index('id_pnf');
  });

  await knex.raw(`
    CREATE FUNCTION public.crear_actualizar_secciones_trayecto(p_id_trayecto bigint, p_cantidad_secciones integer, p_total_estudiantes integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
    DECLARE
        v_estudiantes_por_seccion INTEGER;
        v_resto_estudiantes INTEGER;
        v_contador INTEGER;
        v_nombre_seccion VARCHAR(10);
        v_secciones_actuales INTEGER;
        v_diferencia INTEGER;
    BEGIN
        -- Calcular distribución de estudiantes
        v_estudiantes_por_seccion := p_total_estudiantes / p_cantidad_secciones;
        v_resto_estudiantes := p_total_estudiantes % p_cantidad_secciones;

        -- Obtener cantidad actual de secciones
        SELECT COUNT(*) INTO v_secciones_actuales 
        FROM secciones 
        WHERE id_trayecto = p_id_trayecto;
        
        -- Calcular diferencia
        v_diferencia := p_cantidad_secciones - v_secciones_actuales;
        
        -- Si necesitamos eliminar secciones (primero eliminamos)
        IF v_diferencia < 0 THEN
            DELETE FROM secciones
            WHERE id IN (
                SELECT id 
                FROM secciones 
                WHERE id_trayecto = p_id_trayecto
                ORDER BY id DESC
                LIMIT ABS(v_diferencia)
            );
        END IF;
        
        -- Actualizar todas las secciones existentes
        UPDATE secciones
        SET cupos_disponibles = v_estudiantes_por_seccion + 
                              CASE WHEN ROW_NUMBER() OVER (ORDER BY id) <= v_resto_estudiantes THEN 1 ELSE 0 END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id_trayecto = p_id_trayecto;
        
        -- Si necesitamos agregar secciones
        IF v_diferencia > 0 THEN
            FOR v_contador IN 1..v_diferencia LOOP
                v_nombre_seccion := 'Sección ' || (v_secciones_actuales + v_contador);
                
                INSERT INTO secciones (
                    nombre_seccion,
                    id_trayecto,
                    cupos_disponibles,
                    created_at,
                    updated_at
                ) VALUES (
                    v_nombre_seccion,
                    p_id_trayecto,
                    v_estudiantes_por_seccion + 
                    CASE WHEN v_contador <= v_resto_estudiantes THEN 1 ELSE 0 END,
                    CURRENT_TIMESTAMP,
                    CURRENT_TIMESTAMP
                );
            END LOOP;
        END IF;
    END;
    $$;

    CREATE FUNCTION public.crear_trayectos_para_pnf() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
        -- Insertar los 4 trayectos básicos asociados al nuevo PNF
        INSERT INTO trayectos (
            valor_trayecto, 
            id_pnf,  
            created_at, 
            updated_at
        ) VALUES 
            ('Trayecto I', NEW.id,  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
            ('Trayecto II', NEW.id,  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
            ('Trayecto III', NEW.id,  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
            ('Trayecto IV', NEW.id,  CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        
        RETURN NEW;
    END;
    $$;

    `)
  
}

export async function down(knex) {
  await knex.schema.dropTable('trayectos');
}