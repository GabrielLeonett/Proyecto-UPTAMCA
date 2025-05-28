export async function up(knex) {
  // 1. Crear tabla secciones
  await knex.schema.createTable('secciones', (table) => {
    table.bigIncrements('id').primary();
    table.integer('valor_seccion').notNullable();
    table.bigInteger('id_trayecto').notNullable().references('id').inTable('trayectos').onDelete('CASCADE');
    table.integer('cupos_disponibles').notNullable();
    table.timestamps(true, true);
    
    // Índices para mejor rendimiento
    table.index('id_trayecto');
    table.index('valor_seccion');
    
    // Restricción para valores lógicos de cupos
    table.check('cupos_disponibles >= 8 AND cupos_disponibles <= 40', [], 'check_cupos_validos');
  });

  // 2. Crear función para gestión automática de secciones
  await knex.raw(`
    CREATE FUNCTION public.crear_secciones_automaticamente() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE
        secciones_necesarias INT;
        secciones_existentes INT;
        capacidad_maxima INT := 40; -- Máximo según CHECK constraint
        capacidad_minima INT := 8;  -- Mínimo según CHECK constraint
        capacidad_utilizada INT := 35; -- Valor recomendado entre min y max
        i INT;
        proximo_valor_seccion INT;
    BEGIN
        -- Verificar si la población estudiantil fue actualizada
        IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.poblacion_estudiantil IS DISTINCT FROM OLD.poblacion_estudiantil) THEN
            -- Calcular secciones necesarias (redondeo hacia arriba)
            IF NEW.poblacion_estudiantil > 0 THEN
                secciones_necesarias := CEIL(NEW.poblacion_estudiantil::FLOAT / capacidad_utilizada);
                
                -- Contar secciones existentes para este trayecto
                SELECT COUNT(*) INTO secciones_existentes 
                FROM secciones 
                WHERE id_trayecto = NEW.id;
                
                -- Obtener el próximo valor_seccion (máximo actual + 1)
                SELECT COALESCE(MAX(valor_seccion), 0) + 1 INTO proximo_valor_seccion
                FROM secciones 
                WHERE id_trayecto = NEW.id;
                
                -- Crear secciones faltantes
                IF secciones_necesarias > secciones_existentes THEN
                    FOR i IN 1..(secciones_necesarias - secciones_existentes) LOOP
                        INSERT INTO secciones (
                            valor_seccion, 
                            id_trayecto, 
                            cupos_disponibles, 
                            created_at, 
                            updated_at
                        ) VALUES (
                            proximo_valor_seccion + (i - 1),
                            NEW.id,
                            capacidad_maxima, -- Inicialmente con cupos máximos
                            NOW(),
                            NOW()
                        );
                    END LOOP;
                    
                    RAISE NOTICE 'Creadas % nuevas secciones para el trayecto % (ID: %)', 
                                (secciones_necesarias - secciones_existentes), 
                                NEW.valor_trayecto, 
                                NEW.id;
                END IF;
            END IF;
        END IF;
        
        RETURN NEW;
    END;
    $$;

    CREATE FUNCTION public.gestionar_secciones_automaticamente() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE
        secciones_necesarias INT;
        secciones_existentes INT;
        capacidad_maxima INT := 40;
        capacidad_minima INT := 8;
        capacidad_utilizada INT := 35;
        i INT;
        proximo_valor_seccion INT;
        secciones_a_eliminar INT;
        seccion_a_eliminar RECORD;
    BEGIN
        -- Verificar si la población estudiantil fue actualizada
        IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.poblacion_estudiantil IS DISTINCT FROM OLD.poblacion_estudiantil) THEN
            -- Calcular secciones necesarias (redondeo hacia arriba)
            IF NEW.poblacion_estudiantil > 0 THEN
                secciones_necesarias := CEIL(NEW.poblacion_estudiantil::FLOAT / capacidad_utilizada);
                
                -- Contar secciones existentes para este trayecto
                SELECT COUNT(*) INTO secciones_existentes 
                FROM secciones 
                WHERE id_trayecto = NEW.id;
                
                -- Manejar creación de nuevas secciones
                IF secciones_necesarias > secciones_existentes THEN
                    -- Obtener el próximo valor_seccion (máximo actual + 1)
                    SELECT COALESCE(MAX(valor_seccion), 0) + 1 INTO proximo_valor_seccion
                    FROM secciones 
                    WHERE id_trayecto = NEW.id;
                    
                    -- Crear las secciones faltantes
                    FOR i IN 1..(secciones_necesarias - secciones_existentes) LOOP
                        INSERT INTO secciones (
                            valor_seccion, 
                            id_trayecto, 
                            cupos_disponibles, 
                            created_at, 
                            updated_at
                        ) VALUES (
                            proximo_valor_seccion + (i - 1),
                            NEW.id,
                            capacidad_maxima,
                            NOW(),
                            NOW()
                        );
                    END LOOP;
                    
                    RAISE NOTICE 'Creadas % nuevas secciones para el trayecto % (ID: %)', 
                                (secciones_necesarias - secciones_existentes), 
                                NEW.valor_trayecto, 
                                NEW.id;
                
                -- Manejar eliminación de secciones excedentes
                ELSIF secciones_necesarias < secciones_existentes THEN
                    secciones_a_eliminar := secciones_existentes - secciones_necesarias;
                    
                    -- Eliminar las secciones más recientes primero (las de mayor valor_seccion)
                    FOR seccion_a_eliminar IN 
                        SELECT id FROM secciones 
                        WHERE id_trayecto = NEW.id
                        ORDER BY valor_seccion DESC
                        LIMIT secciones_a_eliminar
                    LOOP
                        -- Verificar si la sección está siendo referenciada
                        IF NOT EXISTS (
                            SELECT 1 FROM r_unidad_curricular_seccion 
                            WHERE id_seccion = seccion_a_eliminar.id
                        ) THEN
                            DELETE FROM secciones WHERE id = seccion_a_eliminar.id;
                            RAISE NOTICE 'Eliminada sección ID: % del trayecto %', 
                                        seccion_a_eliminar.id, NEW.id;
                        ELSE
                            RAISE WARNING 'No se pudo eliminar sección ID: % porque está siendo referenciada', 
                                        seccion_a_eliminar.id;
                        END IF;
                    END LOOP;
                END IF;
            ELSE
                -- Si la población es 0 o negativa, eliminar todas las secciones no referenciadas
                FOR seccion_a_eliminar IN 
                    SELECT id FROM secciones 
                    WHERE id_trayecto = NEW.id
                    AND NOT EXISTS (
                        SELECT 1 FROM r_unidad_curricular_seccion 
                        WHERE id_seccion = secciones.id
                    )
                LOOP
                    DELETE FROM secciones WHERE id = seccion_a_eliminar.id;
                    RAISE NOTICE 'Eliminada sección ID: % del trayecto % (población cero)', 
                                seccion_a_eliminar.id, NEW.id;
                END LOOP;
            END IF;
        END IF;
        
        RETURN NEW;
    END;
    $$;

  `);

 
}

export async function down(knex) {
  // 1. Eliminar trigger primero
  await knex.raw('DROP TRIGGER IF EXISTS trg_gestion_secciones ON trayectos');
  
  // 2. Eliminar función
  await knex.raw('DROP FUNCTION IF EXISTS gestionar_secciones_automaticamente()');
  
  // 3. Finalmente eliminar la tabla
  await knex.schema.dropTable('secciones');
}