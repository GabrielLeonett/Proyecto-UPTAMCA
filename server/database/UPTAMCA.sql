--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2025-07-11 09:29:43

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5274 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'Esquema principal que contiene:
- Tablas base del sistema
- Procedimientos almacenados principales
- Vistas de la aplicación

Notas:
- Este esquema depende de validaciones y utils
- Las tablas siguen convención snake_case
- Las relaciones están documentadas con CONSTRAINTs
- Es el único esquema con permisos de escritura para la app';


--
-- TOC entry 6 (class 2615 OID 54732)
-- Name: respuestas; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA respuestas;


ALTER SCHEMA respuestas OWNER TO postgres;

--
-- TOC entry 5275 (class 0 OID 0)
-- Dependencies: 6
-- Name: SCHEMA respuestas; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA respuestas IS 'Esquema que centraliza la generación de respuestas estandarizadas en formato JSON.
Objetivos:
- Garantizar consistencia en las respuestas de la API
- Simplificar el formato de salida en procedimientos almacenados
- Facilitar el mantenimiento de la estructura de respuestas

Contenido:
- Funciones para respuestas exitosas, errores 
- Plantillas predefinidas para casos comunes

Principios:
- Todas las funciones retornan JSON/JSONB
- Soporte para metadatos adicionales';


--
-- TOC entry 7 (class 2615 OID 54736)
-- Name: utils; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA utils;


ALTER SCHEMA utils OWNER TO postgres;

--
-- TOC entry 5276 (class 0 OID 0)
-- Dependencies: 7
-- Name: SCHEMA utils; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA utils IS 'Esquema de utilidades generales para operaciones transversales.
Contiene:
- Funciones de formato (texto, fechas, JSON)
- Helpers para operaciones comunes
- Cálculos matemáticos o lógicos reutilizables
- Conversiones de tipos de datos

Principios:
- Funciones puras (sin estado)
- Independientes del dominio de negocio
- Alta reusabilidad';


--
-- TOC entry 8 (class 2615 OID 55478)
-- Name: validaciones; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA validaciones;


ALTER SCHEMA validaciones OWNER TO postgres;

--
-- TOC entry 300 (class 1255 OID 54435)
-- Name: actualizar_poblacion_pnf(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.actualizar_poblacion_pnf() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE 
    v_total_estudiantes INTEGER;
    v_error_message TEXT;
    v_error_context TEXT;
BEGIN
    -- Only execute if poblacion_estudiantil changed and id_pnf exists
    IF NEW.poblacion_estudiantil IS DISTINCT FROM OLD.poblacion_estudiantil 
       AND NEW.id_pnf IS NOT NULL THEN
        
        BEGIN
            -- Calculate total students for this PNF
            SELECT COALESCE(SUM(poblacion_estudiantil), 0) INTO v_total_estudiantes
            FROM trayectos
            WHERE id_pnf = NEW.id_pnf;
            
            -- Update PNF's student population
            UPDATE pnfs 
            SET poblacion_estudiantil_pnf = v_total_estudiantes,
                updated_at = CURRENT_TIMESTAMP
            WHERE id_pnf = NEW.id_pnf;
            
            -- Log successful update
            PERFORM utils.registrar_log(
                'UPDATE_POBLACION_PNF',
                'Población actualizada para PNF',
                jsonb_build_object(
                    'id_pnf', NEW.id_pnf,
                    'nueva_poblacion', v_total_estudiantes,
                    'trayecto_trigger', NEW.id_trayecto
                ),
                NULL,
                'trigger'
            );
            
        EXCEPTION WHEN OTHERS THEN
            GET STACKED DIAGNOSTICS 
                v_error_message = MESSAGE_TEXT,
                v_error_context = PG_EXCEPTION_CONTEXT;
                
            PERFORM utils.registrar_log(
                'ERROR_POBLACION_PNF',
                'Error actualizando población PNF',
                jsonb_build_object(
                    'error', v_error_message,
                    'context', v_error_context,
                    'id_pnf', NEW.id_pnf
                ),
                NULL,
                'trigger'
            );
        END;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.actualizar_poblacion_pnf() OWNER TO postgres;

--
-- TOC entry 301 (class 1255 OID 54436)
-- Name: actualizar_secciones_por_poblacion(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.actualizar_secciones_por_poblacion() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_resultado JSONB;
    v_error_message TEXT;
    v_error_context TEXT;
BEGIN
    -- Only execute if poblacion changed and id_trayecto exists
    IF NEW.poblacion_estudiantil IS DISTINCT FROM OLD.poblacion_estudiantil 
       AND NEW.id_trayecto IS NOT NULL THEN
        
        BEGIN
            -- Call section distribution procedure
            CALL public.distribuir_estudiantes_secciones(
                p_id_trayecto := NEW.id_trayecto,
                p_total_estudiantes := NEW.poblacion_estudiantil,
                p_resultado := v_resultado
            );
            
            -- Log successful distribution
            PERFORM utils.registrar_log(
                'UPDATE_SECCIONES',
                'Distribución de secciones actualizada',
                jsonb_build_object(
                    'id_trayecto', NEW.id_trayecto,
                    'poblacion', NEW.poblacion_estudiantil,
                    'resultado', v_resultado
                ),
                NULL,
                'trigger'
            );
            
        EXCEPTION WHEN OTHERS THEN
            GET STACKED DIAGNOSTICS 
                v_error_message = MESSAGE_TEXT,
                v_error_context = PG_EXCEPTION_CONTEXT;
                
            PERFORM utils.registrar_log(
                'ERROR_SECCIONES',
                'Error distribuyendo estudiantes',
                jsonb_build_object(
                    'error', v_error_message,
                    'context', v_error_context,
                    'id_trayecto', NEW.id_trayecto
                ),
                NULL,
                'trigger'
            );
        END;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.actualizar_secciones_por_poblacion() OWNER TO postgres;

--
-- TOC entry 303 (class 1255 OID 93248)
-- Name: buscar_profesor(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

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
            users u ON p.id_cedula = u.cedula
        LEFT JOIN 
            dedicaciones d ON p.id_dedicacion = d.id_dedicacion  -- JOIN para obtener nombre
        LEFT JOIN 
            categorias c ON p.id_categoria = c.id_categoria     -- JOIN para obtener nombre
        LEFT JOIN 
            ubicaciones ub ON p.id_ubicacion = ub.id_ubicacion  -- JOIN para obtener nombre
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


ALTER FUNCTION public.buscar_profesor(p_busqueda character varying) OWNER TO postgres;

--
-- TOC entry 307 (class 1255 OID 102733)
-- Name: crear_notificacion_masiva(character varying, character varying, text, bigint[], jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.crear_notificacion_masiva(p_type character varying, p_title character varying, p_body text, p_user_ids bigint[], p_metadata jsonb DEFAULT NULL::jsonb) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
    nueva_notificacion_id BIGINT;
    user_id BIGINT;
    response_data jsonb;
BEGIN
    -- Verificar parámetros obligatorios
    IF p_title IS NULL OR p_type IS NULL OR p_body IS NULL THEN
        RETURN respuestas.error_generico('Título, tipo y cuerpo son campos obligatorios', 400);
    END IF;
    
    -- Verificar si hay usuarios destinatarios
    IF p_user_ids IS NULL OR array_length(p_user_ids, 1) = 0 THEN
        RETURN respuestas.error_generico('Debe especificar al menos un usuario destinatario', 400);
    END IF;
    
    -- Verificar que todos los usuarios existan
    FOREACH user_id IN ARRAY p_user_ids LOOP
        IF NOT EXISTS(SELECT 1 FROM users WHERE cedula = user_id) THEN
            RETURN respuestas.error_generico(format('Usuario no encontrado: %s', user_id), 404);
        END IF;
    END LOOP;
    
    -- Insertar la notificación principal
    INSERT INTO notifications (
        type,
        title,
        body,
        metadata,
        is_mass,
        is_read,
        created_at
    ) VALUES (
        p_type,
        p_title,
        p_body,
        p_metadata,
        TRUE,    -- is_mass = true
        FALSE,   -- is_read = false por defecto
        NOW()    -- created_at = ahora
    ) RETURNING id INTO nueva_notificacion_id;
    
    -- Registrar cada usuario destinatario
    FOREACH user_id IN ARRAY p_user_ids LOOP
        INSERT INTO notification_recipients (
            notification_id,
            user_id,
            is_read
        ) VALUES (
            nueva_notificacion_id,
            user_id,
            FALSE  -- is_read = false por defecto
        );
    END LOOP;
    
    -- Construir respuesta exitosa
    response_data := jsonb_build_object(
        'id', nueva_notificacion_id,
        'type', p_type,
        'title', p_title,
        'recipient_count', array_length(p_user_ids, 1)
    );
    
    RETURN respuestas.respuesta_con_datos(
        'Notificación creada con éxito',
        response_data,
        jsonb_build_object(
			'status', 400,
            'timestamp', NOW(),
            'is_mass', TRUE
        )
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN respuestas.error_generico('Error al crear la notificación: ' || SQLERRM, 500);
END;
$$;


ALTER FUNCTION public.crear_notificacion_masiva(p_type character varying, p_title character varying, p_body text, p_user_ids bigint[], p_metadata jsonb) OWNER TO postgres;

--
-- TOC entry 291 (class 1255 OID 68990)
-- Name: distribuir_estudiantes_secciones(integer, integer); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.distribuir_estudiantes_secciones(IN p_id_trayecto integer, IN p_total_estudiantes integer, OUT p_resultado jsonb)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_estudiantes_por_seccion INTEGER;
    v_resto_estudiantes INTEGER;
    v_contador INTEGER;
    v_valor_seccion VARCHAR(10);
    v_secciones_actuales INTEGER;
    v_cantidad_secciones INTEGER;
    v_mejor_distribucion INTEGER;
    v_minimo_estudiantes CONSTANT INTEGER := 8;
    v_maximo_estudiantes CONSTANT INTEGER := 40;
    v_log_id BIGINT;
    v_error_message TEXT;
    v_error_context TEXT;
    v_error_detail TEXT;
	v_status_code INTEGER := 400;
BEGIN
    -- Validación de parámetros
    IF p_total_estudiantes <= 0 THEN
        p_resultado := respuestas.error_generico('El total de estudiantes debe ser mayor a cero', v_status_code);
        
        -- Registrar log de error
        PERFORM utils.registrar_log(
            'VALIDACION_FALLIDA',
            'Total de estudiantes inválido',
            jsonb_build_object(
                'id_trayecto', p_id_trayecto,
                'total_estudiantes', p_total_estudiantes
            ),
            NULL,
            'distribucion_secciones'
        );
        RETURN;
    END IF;

    -- Verificar existencia del trayecto
    IF NOT EXISTS (SELECT 1 FROM trayectos WHERE id_trayecto = p_id_trayecto) THEN
        p_resultado := respuestas.error_generico('El trayecto especificado no existe',v_status_code);
        
        PERFORM utils.registrar_log(
            'VALIDACION_FALLIDA',
            'Trayecto no encontrado',
            jsonb_build_object('id_trayecto', p_id_trayecto),
            NULL,
            'distribucion_secciones'
        );
        RETURN;
    END IF;

    -- Calcular distribución óptima
    BEGIN
        -- Calcular la mejor cantidad de secciones automáticamente
        v_cantidad_secciones := CEIL(p_total_estudiantes::numeric / v_maximo_estudiantes);
        
        -- Buscar la distribución óptima
        FOR i IN REVERSE v_maximo_estudiantes..v_minimo_estudiantes LOOP
            IF p_total_estudiantes % i = 0 THEN
                v_mejor_distribucion := i;
                EXIT;
            ELSIF p_total_estudiantes % i >= v_minimo_estudiantes THEN
                v_mejor_distribucion := i;
                EXIT;
            END IF;
        END LOOP;
        
        -- Si no encontramos distribución perfecta, usar la inicial
        IF v_mejor_distribucion IS NULL THEN
            v_mejor_distribucion := v_maximo_estudiantes;
        END IF;
        
        -- Recalcular cantidad de secciones
        v_cantidad_secciones := CEIL(p_total_estudiantes::numeric / v_mejor_distribucion);
        v_estudiantes_por_seccion := p_total_estudiantes / v_cantidad_secciones;
        v_resto_estudiantes := p_total_estudiantes % v_cantidad_secciones;

        -- Obtener cantidad actual de secciones
        SELECT COUNT(*) INTO v_secciones_actuales 
        FROM secciones 
        WHERE id_trayecto = p_id_trayecto;
        
        -- Iniciar transacción para operaciones atómicas
        BEGIN
            -- Eliminar secciones sobrantes (si existen)
            IF v_secciones_actuales > v_cantidad_secciones THEN
                DELETE FROM secciones
                WHERE id_seccion IN (
                    SELECT id_seccion FROM secciones 
                    WHERE id_trayecto = p_id_trayecto
                    ORDER BY id_seccion DESC 
                    LIMIT (v_secciones_actuales - v_cantidad_secciones)
                );
                
                PERFORM utils.registrar_log(
                    'SECCIONES_ELIMINADAS',
                    'Secciones eliminadas por exceso',
                    jsonb_build_object(
                        'id_trayecto', p_id_trayecto,
                        'secciones_eliminadas', v_secciones_actuales - v_cantidad_secciones
                    ),
                    NULL,
                    'distribucion_secciones'
                );
                
                v_secciones_actuales := v_cantidad_secciones;
            END IF;
            
            -- Actualizar secciones existentes
            WITH secciones_numeradas AS (
                SELECT 
                    id_seccion, 
                    ROW_NUMBER() OVER (ORDER BY id_seccion) AS row_num
                FROM secciones 
                WHERE id_trayecto = p_id_trayecto
            )
            UPDATE secciones s
            SET 
                cupos_disponibles = v_estudiantes_por_seccion + 
                                  CASE WHEN sn.row_num <= v_resto_estudiantes THEN 1 ELSE 0 END,
                updated_at = CURRENT_TIMESTAMP
            FROM secciones_numeradas sn
            WHERE s.id_seccion = sn.id_seccion;
            
            -- Registrar actualización de secciones
            PERFORM utils.registrar_log(
                'SECCIONES_ACTUALIZADAS',
                'Cupos de secciones actualizados',
                jsonb_build_object(
                    'id_trayecto', p_id_trayecto,
                    'secciones_actualizadas', v_secciones_actuales,
                    'estudiantes_por_seccion', v_estudiantes_por_seccion,
                    'secciones_con_extra', v_resto_estudiantes
                ),
                NULL,
                'distribucion_secciones'
            );
            
            -- Crear nuevas secciones si faltan
            IF v_secciones_actuales < v_cantidad_secciones THEN
                FOR v_contador IN 1..(v_cantidad_secciones - v_secciones_actuales) LOOP
                    v_valor_seccion := (v_secciones_actuales + v_contador);
                    
                    INSERT INTO secciones (
                        valor_seccion, 
                        id_trayecto, 
                        cupos_disponibles, 
                        created_at, 
                        updated_at
                    ) VALUES (
                        v_valor_seccion, 
                        p_id_trayecto,
                        v_estudiantes_por_seccion + 
                        CASE WHEN v_contador <= v_resto_estudiantes THEN 1 ELSE 0 END,
                        CURRENT_TIMESTAMP, 
                        CURRENT_TIMESTAMP
                    );
                END LOOP;
                
                -- Registrar creación de nuevas secciones
                PERFORM utils.registrar_log(
                    'SECCIONES_CREADAS',
                    'Nuevas secciones creadas',
                    jsonb_build_object(
                        'id_trayecto', p_id_trayecto,
                        'secciones_creadas', v_cantidad_secciones - v_secciones_actuales,
                        'estudiantes_por_seccion', v_estudiantes_por_seccion
                    ),
                    NULL,
                    'distribucion_secciones'
                );
            END IF;
            
            -- Retornar resultado con detalles de la distribución
            p_resultado := respuestas.respuesta_con_datos(
                'Distribución de estudiantes completada exitosamente',
                jsonb_build_object(
                    'total_estudiantes', p_total_estudiantes,
                    'secciones_creadas', v_cantidad_secciones - v_secciones_actuales,
                    'secciones_actualizadas', LEAST(v_secciones_actuales, v_cantidad_secciones),
                    'estudiantes_por_seccion', v_estudiantes_por_seccion,
                    'secciones_con_extra', v_resto_estudiantes,
                    'rango_aceptable', format('%s-%s estudiantes', v_minimo_estudiantes, v_maximo_estudiantes)
                ),
                  jsonb_build_object(
                    'status', 200 
					)
            );
            
        EXCEPTION
            WHEN OTHERS THEN
                GET STACKED DIAGNOSTICS 
                    v_error_message = MESSAGE_TEXT,
                    v_error_context = PG_EXCEPTION_CONTEXT,
                    v_error_detail = PG_EXCEPTION_DETAIL;
                
                PERFORM utils.registrar_log(
                    'ERROR_OPERACION',
                    'Error durante la distribución de estudiantes',
                    jsonb_build_object(
                        'error', v_error_message,
                        'contexto', v_error_context,
                        'detalle', v_error_detail,
                        'id_trayecto', p_id_trayecto
                    ),
                    NULL,
                    'distribucion_secciones'
                );
                
                p_resultado := respuestas.error_generico('Error durante la distribución: ' || v_error_message, v_status_code);
                RETURN;
        END;
        
    EXCEPTION
        WHEN OTHERS THEN
            GET STACKED DIAGNOSTICS 
                v_error_message = MESSAGE_TEXT,
                v_error_context = PG_EXCEPTION_CONTEXT;
                
            PERFORM utils.registrar_log(
                'ERROR_CALCULO',
                'Error calculando distribución óptima',
                jsonb_build_object(
                    'error', v_error_message,
                    'contexto', v_error_context,
                    'id_trayecto', p_id_trayecto
                ),
                NULL,
                'distribucion_secciones'
            );
            
            p_resultado := respuestas.error_generico('Error calculando distribución: ' || v_error_message, v_status_code);
            RETURN;
    END;
END;
$$;


ALTER PROCEDURE public.distribuir_estudiantes_secciones(IN p_id_trayecto integer, IN p_total_estudiantes integer, OUT p_resultado jsonb) OWNER TO postgres;

--
-- TOC entry 306 (class 1255 OID 102731)
-- Name: guardar_notificacion_roles(bigint[], character varying, character varying, text, jsonb, boolean); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.guardar_notificacion_roles(p_roles_ids bigint[], p_type character varying, p_title character varying, p_body text, p_metadata jsonb DEFAULT NULL::jsonb, p_is_mass boolean DEFAULT true) RETURNS bigint
    LANGUAGE plpgsql
    AS $$
DECLARE
    nueva_notificacion_id BIGINT;
    rol_id BIGINT;
BEGIN
    -- Insertar la notificación principal (sin user_id ya que es masiva)
    INSERT INTO notifications (
        type,
        title,
        body,
        metadata,
        is_read,
        created_at,
        is_mass
    ) VALUES (
        p_type,
        p_title,
        p_body,
        p_metadata,
        FALSE,  -- Por defecto no leída
        NOW(),  -- Fecha actual
        p_is_mass
    ) RETURNING id INTO nueva_notificacion_id;
    
    -- Registrar la relación con cada rol
    FOREACH rol_id IN ARRAY p_roles_ids LOOP
        INSERT INTO notification_roles (
            notification_id,
            role_id
        ) VALUES (
            nueva_notificacion_id,
            rol_id
        );
    END LOOP;
    
    RETURN nueva_notificacion_id;
END;
$$;


ALTER FUNCTION public.guardar_notificacion_roles(p_roles_ids bigint[], p_type character varying, p_title character varying, p_body text, p_metadata jsonb, p_is_mass boolean) OWNER TO postgres;

--
-- TOC entry 305 (class 1255 OID 102730)
-- Name: guardar_notificacion_usuario(bigint, character varying, character varying, text, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.guardar_notificacion_usuario(p_user_id bigint, p_type character varying, p_title character varying, p_body text, p_metadata jsonb DEFAULT NULL::jsonb) RETURNS bigint
    LANGUAGE plpgsql
    AS $$
DECLARE
    nueva_notificacion_id BIGINT;
BEGIN
    -- Insertar la notificación principal
    INSERT INTO notifications (
        user_id,
        type,
        title,
        body,
        metadata,
        is_read,
        created_at
    ) VALUES (
        p_user_id,
        p_type,
        p_title,
        p_body,
        p_metadata,
        FALSE,  -- Por defecto no leída
        NOW()   -- Fecha actual
    ) RETURNING id INTO nueva_notificacion_id;
    
    -- Registrar al usuario destinatario en la tabla de recipients
    -- Esto es redundante para notificaciones individuales pero mantiene consistencia
    INSERT INTO notification_recipients (
        notification_id,
        user_id,
        is_read
    ) VALUES (
        nueva_notificacion_id,
        p_user_id,
        FALSE
    );
    
    RETURN nueva_notificacion_id;
END;
$$;


ALTER FUNCTION public.guardar_notificacion_usuario(p_user_id bigint, p_type character varying, p_title character varying, p_body text, p_metadata jsonb) OWNER TO postgres;

--
-- TOC entry 309 (class 1255 OID 101468)
-- Name: mostrar_usuario(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.mostrar_usuario(p_email character varying) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE 
    existe_usuario BOOLEAN;
    usuario_info JSONB;
    roles_array VARCHAR[];
    p_resultado json;
    v_status integer := 200; -- Added status variable
BEGIN
    -- Verificar si el usuario existe
    SELECT EXISTS(SELECT 1 FROM users WHERE email = p_email) INTO existe_usuario;

    IF NOT existe_usuario THEN
        -- Using standard JSONB build instead of respuestas.error_generico
        p_resultado := respuestas.error_generico('Usuario no encontrado',404);
        RETURN p_resultado;
    END IF;
    
    -- Obtener roles del usuario
    SELECT array_agg(r.nombre_rol) 
    INTO roles_array
    FROM users u
    JOIN usuario_rol ur ON u.cedula = ur.usuario_id
    JOIN roles r ON r.id_rol = ur.rol_id
    WHERE u.email = p_email;
    
    -- Construir información del usuario
    SELECT jsonb_build_object(
        'id', u.cedula,
        'nombres', u.nombres,
        'apellidos', u.apellidos,
        'password', u.password,
        'roles', COALESCE(roles_array, ARRAY[]::VARCHAR[])
    )
    INTO usuario_info
    FROM users u
    WHERE u.email = p_email;
    
    -- Construir respuesta final
	p_resultado := respuestas.respuesta_con_datos(
           	'Usuario Encontrado'::TEXT,
          	usuario_info,
			jsonb_build_object('status_code' ,v_status)
    );
    
    RETURN p_resultado;
END;
$$;


ALTER FUNCTION public.mostrar_usuario(p_email character varying) OWNER TO postgres;

--
-- TOC entry 286 (class 1255 OID 56086)
-- Name: notificar_nueva_notificacion(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.notificar_nueva_notificacion() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM pg_notify(
        'notificaciones_' || NEW.user_id, 
        json_build_object(
            'id', NEW.id,
            'type', NEW.type,
            'title', NEW.title,
            'user_id', NEW.user_id,
            'reference_id', NEW.reference_id,
            'action', 'insert' -- Puedes añadir más acciones como 'update' o 'delete'
        )::text
    );
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.notificar_nueva_notificacion() OWNER TO postgres;

--
-- TOC entry 285 (class 1255 OID 68986)
-- Name: registrar_administrador_completo(integer, integer, character varying, character varying, character varying, character varying, character varying, character varying, character varying, date, character varying, smallint); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.registrar_administrador_completo(IN p_usuario_accion integer, IN p_id integer, IN p_nombres character varying, IN p_apellidos character varying, IN p_email character varying, IN p_direccion character varying, IN p_password character varying, IN p_telefono_movil character varying, IN p_telefono_local character varying, IN p_fecha_nacimiento date, IN p_genero character varying, IN p_id_rol smallint, OUT p_resultado json)
    LANGUAGE plpgsql
    AS $$

DECLARE
    v_valido boolean;
    v_mensaje text;
    v_codigo_error text;
    v_id_rol_validado bigint;
    v_log_id bigint;
    v_error_message TEXT;
    v_error_context TEXT;
    v_error_detail TEXT;
	v_usuario_existe BOOLEAN;
BEGIN
	-- .1 Validación Usuario que ejecuta el procedimiento
	SELECT validaciones.validar_existencia_usuario(p_usuario_accion) INTO v_usuario_existe;

	IF NOT v_usuario_existe THEN
        p_resultado := respuestas.error_generico('Usuario que ejecutar el procedimiento no existe');
		RETURN;
	END IF;
	
    -- 2. VALIDACIÓN DE DATOS
    SELECT es_valido, mensaje, codigo_error, id_rol_validado
    FROM validaciones.validar_datos_registro_administrador_completo(
        p_usuario_accion, p_id, p_genero, p_email, p_id_rol
    ) INTO v_valido, v_mensaje, v_codigo_error, v_id_rol_validado;

    IF NOT v_valido THEN
        p_resultado := json_build_object(
            'status', 'error',
            'message', v_mensaje,
            'error_code', v_codigo_error
        );
        RETURN;
    END IF;

    -- 2. REGISTRO DE USUARIO Y ADMINISTRADOR
    BEGIN
        -- Registrar usuario
        INSERT INTO users (
            cedula, nombres, apellidos, email, direccion, 
            password, telefono_movil, telefono_local, 
            fecha_nacimiento, genero, created_at, updated_at
        ) VALUES (
            p_id, p_nombres, p_apellidos, p_email, p_direccion, 
            p_password, p_telefono_movil, p_telefono_local, 
            p_fecha_nacimiento, p_genero, NOW(), NOW()
        );

        -- Asignar rol al usuario
        INSERT INTO usuario_rol (rol_id, usuario_id)
        VALUES (p_id_rol, p_id);

        -- Registrar log de éxito
        SELECT utils.registrar_log(
            'REGISTRO_EXITOSO',
            'Administrador registrado correctamente',
            jsonb_build_object(
                'id_rol', p_id_rol,
                'id_usuario', p_id,
                'email', p_email
            ),
            p_usuario_accion,
            FORMAT('{id_usuario:%s, id_rol:%s}', p_id, p_id_rol)
        ) INTO v_log_id;

        -- Respuesta de éxito
        p_resultado := json_build_object(
            'status', 'success',
            'message', 'Administrador registrado exitosamente',
            'data', json_build_object(
                'id_rol', p_id_rol,
                'id_usuario', p_id,
                'nombres', p_nombres,
                'apellidos', p_apellidos,
                'email', p_email,
                'rol_id', p_id_rol
            )
        );

    EXCEPTION
        WHEN unique_violation THEN
            GET STACKED DIAGNOSTICS v_error_context = PG_EXCEPTION_CONTEXT;
            SELECT utils.registrar_log(
                'REGISTRO_FALLIDO',
                'Intento de registro duplicado: ' || SQLERRM,
                jsonb_build_object(
                    'error_context', v_error_context,
                    'tipo_error', 'UNIQUE_VIOLATION'
                ),
                p_usuario_accion,
                'administrador'
            ) INTO v_log_id;
            
            p_resultado := json_build_object(
                'status', 'error',
                'message', 'Registro duplicado: ' || SQLERRM
            );
            
        WHEN check_violation THEN
            GET STACKED DIAGNOSTICS v_error_context = PG_EXCEPTION_CONTEXT;
            SELECT utils.registrar_log(
                'REGISTRO_FALLIDO',
                'Datos inválidos en registro: ' || SQLERRM,
                jsonb_build_object(
                    'error_context', v_error_context,
                    'tipo_error', 'CHECK_VIOLATION'
                ),
                p_usuario_accion
                'administrador'
            ) INTO v_log_id;
            
            p_resultado := json_build_object(
                'status', 'error',
                'message', 'Datos inválidos: ' || SQLERRM
            );
            
        WHEN OTHERS THEN
            GET STACKED DIAGNOSTICS 
                v_error_message = MESSAGE_TEXT,
                v_error_context = PG_EXCEPTION_CONTEXT,
                v_error_detail = PG_EXCEPTION_DETAIL;
                
            SELECT utils.registrar_log(
                'ERROR_NO_CONTROLADO',
                'Error inesperado en registro: ' || v_error_message,
                jsonb_build_object(
                    'error_context', v_error_context,
                    'error_detail', v_error_detail,
                    'tipo_error', 'OTRO_ERROR'
                ),
                p_usuario_accion,
                'administrador'
            ) INTO v_log_id;
            
            p_resultado := json_build_object(
                'status', 'error',
                'message', 'Error en el registro: ' || v_error_message
            );
    END;
END;
$$;


ALTER PROCEDURE public.registrar_administrador_completo(IN p_usuario_accion integer, IN p_id integer, IN p_nombres character varying, IN p_apellidos character varying, IN p_email character varying, IN p_direccion character varying, IN p_password character varying, IN p_telefono_movil character varying, IN p_telefono_local character varying, IN p_fecha_nacimiento date, IN p_genero character varying, IN p_id_rol smallint, OUT p_resultado json) OWNER TO postgres;

--
-- TOC entry 284 (class 1255 OID 68984)
-- Name: registrar_coordinador_completo(integer, bigint, character varying, character varying, character varying, character varying, character varying, character varying, character varying, date, character varying, bigint, bigint); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.registrar_coordinador_completo(IN p_usuario_accion integer, IN p_id_cedula bigint, IN p_nombres character varying, IN p_apellidos character varying, IN p_email character varying, IN p_direccion character varying, IN p_password character varying, IN p_telefono_movil character varying, IN p_telefono_local character varying, IN p_fecha_nacimiento date, IN p_genero character varying, IN p_id_pnf bigint, IN p_id_ubicacion bigint, OUT p_resultado json)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_valido BOOLEAN;
    v_mensaje TEXT;
    v_codigo_error TEXT;
    v_id_rol_validado BIGINT;
    v_id_pnf_validado BIGINT;
    v_id_ubicacion_validado BIGINT;
    v_id_coordinador BIGINT;
    v_error_context TEXT;
    v_log_id BIGINT;
    v_id_rol_coordinador BIGINT := 3;
	v_usuario_existe BOOLEAN;
BEGIN
	-- .1 Validación Usuario que ejecuta el procedimiento
	SELECT validaciones.validar_existencia_usuario(p_usuario_accion) INTO v_usuario_existe;

	IF NOT v_usuario_existe THEN
        p_resultado := respuestas.error_generico('Usuario que ejecutar el procedimiento no existe');
		RETURN;
	END IF;
	
    -- 1. VALIDACIÓN COMPLETA DE DATOS (fuera de la transacción)
    SELECT es_valido, mensaje, codigo_error, id_rol_validado, id_pnf_validado, id_ubicacion_validado
    FROM validaciones.validar_datos_registro_coordinador_completo(
	p_usuario_accion,
        p_id_cedula, 
        p_genero, 
        p_email, 
        v_id_rol_coordinador,
        p_id_pnf,
        p_id_ubicacion
    ) INTO v_valido, v_mensaje, v_codigo_error, v_id_rol_validado, v_id_pnf_validado, v_id_ubicacion_validado;

    IF NOT v_valido THEN
        p_resultado := respuestas.error_generico(v_mensaje);
        RETURN;
    END IF;
    
    -- Iniciar transacción (solo para operaciones de escritura)
    BEGIN
        -- 2. REGISTRO DE USUARIO
        INSERT INTO users (
            cedula, nombres, apellidos, email, direccion, 
            password, telefono_movil, telefono_local, 
            fecha_nacimiento, genero, created_at, updated_at
        ) VALUES (
            p_id_cedula, p_nombres, p_apellidos, p_email, p_direccion, 
            p_password, p_telefono_movil, p_telefono_local, 
            p_fecha_nacimiento, p_genero, NOW(), NOW()
        );

        -- 3. ASIGNACIÓN DE ROL DE COORDINADOR
        INSERT INTO usuario_rol (
            rol_id,
            usuario_id
        ) VALUES (
            v_id_rol_coordinador,
            p_id_cedula
        );
        
        -- 4. REGISTRO DE COORDINADOR
        INSERT INTO coordinadores (
            id_cedula, 
            id_pnf, 
            id_ubicacion,
            created_at, 
            updated_at
        ) VALUES (
            p_id_cedula, 
            v_id_pnf_validado, 
            v_id_ubicacion_validado,
            NOW(), 
            NOW()
        ) RETURNING id_coordinador INTO v_id_coordinador;
        
        -- Respuesta de éxito
        p_resultado := respuestas.respuesta_con_datos(
            'Coordinador registrado exitosamente',
            jsonb_build_object(
                'coordinador', jsonb_build_object(
                    'id', v_id_coordinador,
                    'nombres', p_nombres,
                    'apellidos', p_apellidos,
                    'email', p_email,
                    'pnf', v_id_pnf_validado,
                    'ubicacion', v_id_ubicacion_validado
                ),
                'metadata', jsonb_build_object(
                    'fecha_registro', NOW()::text,
                    'nota', 'Registro completado correctamente'
                )
            )
        );

        SELECT utils.registrar_log(
            'REGISTRO_EXITOSO',
            'Coordinador y usuario registrados correctamente',
            jsonb_build_object(
                'id_coordinador', v_id_coordinador,
                'email', p_email,
                'pnf_id', v_id_pnf_validado
            ),
            p_usuario_accion,
            FORMAT('{id_coordinador:%s}', v_id_coordinador)
        ) INTO v_log_id;
        
    EXCEPTION
        WHEN unique_violation THEN
            GET STACKED DIAGNOSTICS v_error_context = PG_EXCEPTION_CONTEXT;
            SELECT utils.registrar_log(
                'REGISTRO_FALLIDO',
                'Intento de registro duplicado: ' || SQLERRM,
                jsonb_build_object(
                    'error_context', v_error_context,
                    'tipo_error', 'UNIQUE_VIOLATION'
                ),
                p_usuario_accion,
                'coordinador'
            ) INTO v_log_id;
            
            p_resultado := respuestas.error_generico('Usuario o Coordinador ya existente');
            
        WHEN check_violation THEN
            GET STACKED DIAGNOSTICS v_error_context = PG_EXCEPTION_CONTEXT;
            SELECT utils.registrar_log(
                'REGISTRO_FALLIDO',
                'Datos inválidos en registro: ' || SQLERRM,
                jsonb_build_object(
                    'error_context', v_error_context,
                    'tipo_error', 'CHECK_VIOLATION'
                ),
                p_usuario_accion,
                'coordinador'
            ) INTO v_log_id;
            
            p_resultado := respuestas.error_generico('Datos inválidos: ' || SQLERRM);
            
        WHEN OTHERS THEN
            GET STACKED DIAGNOSTICS v_error_context = PG_EXCEPTION_CONTEXT;
            SELECT utils.registrar_log(
                'ERROR_NO_CONTROLADO',
                'Error inesperado en registro: ' || SQLERRM,
                jsonb_build_object(
                    'error_context', v_error_context,
                    'tipo_error', 'OTRO_ERROR'
                ),
                p_usuario_accion,
                'coordinador'
            ) INTO v_log_id;
            
            p_resultado := respuestas.error_generico('Error en el registro: ' || SQLERRM);
    END;
END;
$$;


ALTER PROCEDURE public.registrar_coordinador_completo(IN p_usuario_accion integer, IN p_id_cedula bigint, IN p_nombres character varying, IN p_apellidos character varying, IN p_email character varying, IN p_direccion character varying, IN p_password character varying, IN p_telefono_movil character varying, IN p_telefono_local character varying, IN p_fecha_nacimiento date, IN p_genero character varying, IN p_id_pnf bigint, IN p_id_ubicacion bigint, OUT p_resultado json) OWNER TO postgres;

--
-- TOC entry 293 (class 1255 OID 69868)
-- Name: registrar_horario_completo(integer, bigint, bigint, bigint, character varying, time without time zone, character varying, boolean, jsonb); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.registrar_horario_completo(IN p_usuario_accion integer, IN p_id_seccion bigint, IN p_id_profesor bigint, IN p_unidad_curricular_id bigint, IN p_dia_semana character varying, IN p_hora_inicio time without time zone, IN p_aula character varying, IN p_activo boolean, INOUT p_resultado jsonb)
    LANGUAGE plpgsql
    AS $$
DECLARE 
    v_id_horario BIGINT;
    v_validacion RECORD;
    v_error_context TEXT;
    v_log_id BIGINT;
	v_usuario_existe BOOLEAN;
	v_hora_fin time without time zone;
BEGIN
	-- .1 Validación Usuario que ejecuta el procedimiento
	SELECT validaciones.validar_existencia_usuario(p_usuario_accion) INTO v_usuario_existe;

	IF NOT v_usuario_existe THEN
        p_resultado := respuestas.error_generico('Usuario que ejecutar el procedimiento no existe', 401);
		RETURN;
	END IF;
	
    -- 2. Validación completa de datos
    SELECT es_valido, mensaje, codigo_error, carga_horas_validada, hora_fin_validada
    FROM validaciones.validar_datos_horario_completo(
        p_usuario_accion,
        p_dia_semana,
        p_hora_inicio,
        p_unidad_curricular_id,
        p_id_seccion,
        p_id_profesor
    ) INTO v_validacion;

    -- Si la validación falla
    IF NOT v_validacion.es_valido THEN
        -- Registrar log de validación fallida
        SELECT utils.registrar_log(
            'VALIDACION_FALLIDA',
            v_validacion.mensaje,
            jsonb_build_object(
                'codigo_error', v_validacion.codigo_error,
                'seccion_id', p_id_seccion,
                'profesor_id', p_id_profesor,
                'unidad_curricular_id', p_unidad_curricular_id,
                'dia_semana', p_dia_semana,
                'hora_inicio', p_hora_inicio
            ),
            p_usuario_accion,
            'horario'
        ) INTO v_log_id;
        
        -- Retornar respuesta de error
        p_resultado := respuestas.error_generico(v_validacion.mensaje, 400);
        RETURN;
    END IF;

    -- Iniciar transacción para operaciones de escritura
    BEGIN
        -- 2. Registro del horario
        INSERT INTO horarios (
            seccion_id,
            profesor_id,
            unidad_curricular_id,
            dia_semana,
            hora_inicio,
            hora_fin,
            aula,
            activo
        ) VALUES (
            p_id_seccion,
            p_id_profesor,
            p_unidad_curricular_id,
            p_dia_semana,
            p_hora_inicio,
           	v_validacion.hora_fin_validada,
            p_aula,
            p_activo
        ) RETURNING id_horario INTO v_id_horario;

        -- 3. Respuesta de éxito con datos
        p_resultado := respuestas.respuesta_con_datos(
            'Horario registrado exitosamente',
            jsonb_build_object(
                'horario', jsonb_build_object(
                    'id', v_id_horario,
                    'seccion_id', p_id_seccion,
                    'profesor_id', p_id_profesor,
                    'unidad_curricular_id', p_unidad_curricular_id,
                    'dia_semana', p_dia_semana,
                    'hora_inicio', p_hora_inicio,
                    'hora_fin', v_validacion.hora_fin_validada,
                    'aula', p_aula
                )
            ),jsonb_build_object(
					'status', 200
            )
        );

        -- Registrar log de éxito
        SELECT utils.registrar_log(
            'REGISTRO_EXITOSO',
            'Horario registrado correctamente',
            jsonb_build_object(
                'id_horario', v_id_horario,
                'seccion_id', p_id_seccion,
                'profesor_id', p_id_profesor,
                'unidad_curricular_id', p_unidad_curricular_id
            ),
            p_usuario_accion,
            FORMAT('{id_horario:%s}', v_id_horario)
        ) INTO v_log_id;
        
    EXCEPTION
        WHEN unique_violation THEN
            GET STACKED DIAGNOSTICS v_error_context = PG_EXCEPTION_CONTEXT;
            SELECT utils.registrar_log(
                'REGISTRO_FALLIDO',
                'Intento de registro duplicado: ' || SQLERRM,
                jsonb_build_object(
                    'error_context', v_error_context,
                    'tipo_error', 'UNIQUE_VIOLATION',
                    'datos_solicitud', jsonb_build_object(
                        'seccion_id', p_id_seccion,
                        'profesor_id', p_id_profesor,
                        'unidad_curricular_id', p_unidad_curricular_id,
                        'dia_semana', p_dia_semana,
                        'hora_inicio', p_hora_inicio
                    )
                ),
                p_usuario_accion,
                'horario'
            ) INTO v_log_id;
            
            p_resultado := respuestas.error_generico('Ya existe un horario idéntico para esta sección', 400);
            
        WHEN foreign_key_violation THEN
            GET STACKED DIAGNOSTICS v_error_context = PG_EXCEPTION_CONTEXT;
            SELECT utils.registrar_log(
                'REGISTRO_FALLIDO',
                'Violación de clave foránea: ' || SQLERRM,
                jsonb_build_object(
                    'error_context', v_error_context,
                    'tipo_error', 'FOREIGN_KEY_VIOLATION',
                    'datos_solicitud', jsonb_build_object(
                        'seccion_id', p_id_seccion,
                        'profesor_id', p_id_profesor,
                        'unidad_curricular_id', p_unidad_curricular_id
                    )
                ),
                p_usuario_accion,
                'horario'
            ) INTO v_log_id;
            
            p_resultado := respuestas.error_generico('Violación de clave foránea - verifique las referencias', 400);
            
        WHEN OTHERS THEN
            GET STACKED DIAGNOSTICS v_error_context = PG_EXCEPTION_CONTEXT;
            SELECT utils.registrar_log(
                'ERROR_NO_CONTROLADO',
                'Error inesperado en registro: ' || SQLERRM,
                jsonb_build_object(
                    'error_context', v_error_context,
                    'tipo_error', 'OTRO_ERROR',
                    'datos_solicitud', jsonb_build_object(
                        'seccion_id', p_id_seccion,
                        'profesor_id', p_id_profesor,
                        'unidad_curricular_id', p_unidad_curricular_id
                    )
                ),
                p_usuario_accion,
                'horario'
            ) INTO v_log_id;
            
            p_resultado := respuestas.error_generico('Error en el registro: ' || SQLERRM, 400);
    END;
END;
$$;


ALTER PROCEDURE public.registrar_horario_completo(IN p_usuario_accion integer, IN p_id_seccion bigint, IN p_id_profesor bigint, IN p_unidad_curricular_id bigint, IN p_dia_semana character varying, IN p_hora_inicio time without time zone, IN p_aula character varying, IN p_activo boolean, INOUT p_resultado jsonb) OWNER TO postgres;

--
-- TOC entry 308 (class 1255 OID 60507)
-- Name: registrar_pnf_completo(integer, character varying, character varying, character varying, bigint); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.registrar_pnf_completo(IN p_usuario_accion integer, IN p_nombre_pnf character varying, IN p_descripcion_pnf character varying, IN p_codigo_pnf character varying, IN p_id_ubicacion bigint, OUT p_resultado json)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_valido BOOLEAN;
    v_mensaje TEXT;
    v_codigo_error TEXT;
    v_id_pnf BIGINT;
    v_error_context TEXT;
    v_log_id BIGINT;
    v_poblacion INTEGER := 0;
	v_usuario_existe BOOLEAN;
	v_status_code INTEGER := 200;
BEGIN

	-- .1 Validación Usuario que ejecuta el procedimiento
	SELECT validaciones.validar_existencia_usuario(p_usuario_accion) INTO v_usuario_existe;

	IF NOT v_usuario_existe THEN
        p_resultado := respuestas.error_generico('Usuario que ejecutar el procedimiento no existe', 400);
		RETURN;
	END IF;
	
    -- 2. VALIDACIÓN COMPLETA DE DATOS (fuera de la transacción)
    SELECT es_valido, mensaje, codigo_error, status_code
    FROM validaciones.validar_datos_registro_pnf(
        p_usuario_accion,
		p_codigo_pnf, 
        p_nombre_pnf
    ) INTO v_valido, v_mensaje, v_codigo_error, v_status_code;

    IF NOT v_valido THEN
        p_resultado := respuestas.error_generico(v_mensaje, 400);
        RETURN;
    END IF;
    
    -- Iniciar transacción (solo para operaciones de escritura)
    BEGIN
        -- 2. REGISTRO DE PNF
        INSERT INTO pnfs ( 
            nombre_pnf, 
            descripcion_pnf,
            codigo_pnf,
            poblacion_estudiantil_pnf,
            created_at, 
            updated_at
        ) VALUES (
            p_nombre_pnf,
            p_descripcion_pnf,
            p_codigo_pnf,
            v_poblacion,
            NOW(),
            NOW()
        ) RETURNING id_pnf INTO v_id_pnf;
		
		-- 3. REGISTRO DE TRAYECTOS ASOCIADOS A EL PNF 
        INSERT INTO trayectos ( 
    poblacion_estudiantil, 
    valor_trayecto,
    id_pnf,
    created_at, 
    updated_at
	) VALUES 
	    (0, 'I', v_id_pnf, NOW(), NOW()),
	    (0, 'II', v_id_pnf, NOW(), NOW()),
	    (0, 'III', v_id_pnf, NOW(), NOW()),
	    (0, 'IV', v_id_pnf, NOW(), NOW());
	        
        -- Respuesta de éxito
        p_resultado := respuestas.respuesta_con_datos(
            'PNF registrado exitosamente Y sus 4 trayectos asociados',
            jsonb_build_object(
                'pnf', jsonb_build_object(
                    'id', v_id_pnf,
                    'nombre', p_nombre_pnf,
                    'descripcion', p_descripcion_pnf,
                    'codigo', p_codigo_pnf,
                    'ubicacion_id', p_id_ubicacion
                )
            ),
			jsonb_build_object(
                    'status_code', v_status_code,
					'created_at', NOW()
                )
       
        );

        SELECT utils.registrar_log(
            'REGISTRO_EXITOSO',
            'PNF registrado correctamente',
            jsonb_build_object(
                'id_pnf', v_id_pnf,
                'nombre_pnf', p_nombre_pnf,
                'codigo_pnf', p_codigo_pnf
            ),
            p_usuario_accion, 
            FORMAT('{id_pnf:%s}', v_id_pnf)
        ) INTO v_log_id;
        
    EXCEPTION
        WHEN unique_violation THEN
            GET STACKED DIAGNOSTICS v_error_context = PG_EXCEPTION_CONTEXT;
            SELECT utils.registrar_log(
                'REGISTRO_FALLIDO',
                'Intento de registro duplicado: ' || SQLERRM,
                jsonb_build_object(
                    'error_context', v_error_context,
                    'tipo_error', 'UNIQUE_VIOLATION'
                ),
                p_usuario_accion,
                'pnf'
            ) INTO v_log_id;
            
            p_resultado := respuestas.error_generico('PNF ya existente', 400);
            
        WHEN check_violation THEN
            GET STACKED DIAGNOSTICS v_error_context = PG_EXCEPTION_CONTEXT;
            SELECT utils.registrar_log(
                'REGISTRO_FALLIDO',
                'Datos inválidos en registro: ' || SQLERRM,
                jsonb_build_object(
                    'error_context', v_error_context,
                    'tipo_error', 'CHECK_VIOLATION'
                ),
                p_usuario_accion,
                'pnf'
            ) INTO v_log_id;
            
            p_resultado := respuestas.error_generico('Datos inválidos: ' || SQLERRM, 400);
            
        WHEN OTHERS THEN
            GET STACKED DIAGNOSTICS v_error_context = PG_EXCEPTION_CONTEXT;
            SELECT utils.registrar_log(
                'ERROR_NO_CONTROLADO',
                'Error inesperado en registro: ' || SQLERRM,
                jsonb_build_object(
                    'error_context', v_error_context,
                    'tipo_error', 'OTRO_ERROR'
                ),
                p_usuario_accion,
                'pnf'
            ) INTO v_log_id;
            
            p_resultado := respuestas.error_generico('Error en el registro: ' || SQLERRM, 400);
    END;
END;
$$;


ALTER PROCEDURE public.registrar_pnf_completo(IN p_usuario_accion integer, IN p_nombre_pnf character varying, IN p_descripcion_pnf character varying, IN p_codigo_pnf character varying, IN p_id_ubicacion bigint, OUT p_resultado json) OWNER TO postgres;

--
-- TOC entry 298 (class 1255 OID 110491)
-- Name: registrar_profesor_completo(integer, integer, character varying, character varying, character varying, character varying, character varying, character varying, character varying, date, character varying, character varying, character varying, character varying, character varying, character varying, character varying, date); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.registrar_profesor_completo(IN p_usuario_accion integer, IN p_id integer, IN p_nombres character varying, IN p_apellidos character varying, IN p_email character varying, IN p_direccion character varying, IN p_password character varying, IN p_telefono_movil character varying, IN p_telefono_local character varying, IN p_fecha_nacimiento date, IN p_genero character varying, IN p_nombre_categoria character varying, IN p_nombre_dedicacion character varying, IN p_nombre_ubicacion character varying, IN p_pre_grado character varying, IN p_pos_grado character varying, IN p_area_de_conocimiento character varying, IN p_fecha_ingreso date, OUT p_resultado json)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_valido BOOLEAN;
	v_status INTEGER;
    v_mensaje TEXT;
    v_codigo_error TEXT;
    v_id_categoria SMALLINT;
    v_id_dedicacion SMALLINT;
    v_id_ubicacion SMALLINT;
    v_id_profesor BIGINT;
    v_error_context TEXT;
    v_log_id BIGINT;
	v_usuario_existe BOOLEAN;
BEGIN
	-- .1 Validación Usuario que ejecuta el procedimiento
	SELECT validaciones.validar_existencia_usuario(p_usuario_accion) INTO v_usuario_existe;

	IF NOT v_usuario_existe THEN
        p_resultado := respuestas.error_generico('Usuario que ejecutar el procedimiento no existe');
		RETURN;
	END IF;
	
    -- 2. VALIDACIÓN COMPLETA DE DATOS (fuera de la transacción)
    SELECT es_valido, mensaje, status, codigo_error, id_categoria, id_dedicacion, id_ubicacion
    FROM validaciones.validar_datos_registro_profesor_completo(
		p_usuario_accion,
        p_id, 
        p_genero, 
        p_email, 
        p_nombre_categoria, 
        p_nombre_dedicacion, 
        p_nombre_ubicacion
    ) INTO v_valido, v_mensaje, v_status, v_codigo_error, v_id_categoria, v_id_dedicacion, v_id_ubicacion;

    IF NOT v_valido THEN
        p_resultado := respuestas.error_generico(v_mensaje, v_status);
        RETURN;
    END IF;
    
    -- Iniciar transacción (solo para operaciones de escritura)
    BEGIN
        -- 3. REGISTRO DE USUARIO
        INSERT INTO users (
            cedula, nombres, apellidos, email, direccion, 
            password, telefono_movil, telefono_local, 
            fecha_nacimiento, genero, created_at, updated_at
        ) VALUES (
            p_id, p_nombres, p_apellidos, p_email, p_direccion, 
            p_password, p_telefono_movil, p_telefono_local, 
            p_fecha_nacimiento, p_genero, NOW(), NOW()
        );

        -- 4. REGISTRO DE PERFIL PROFESOR
        INSERT INTO usuario_rol (
			rol_id,
			usuario_id
        ) VALUES (
			3,
			p_id
        );
		
        -- 5. REGISTRO DE PROFESOR
        INSERT INTO profesores (
            id_categoria, id_cedula, id_dedicacion, id_ubicacion,
            pre_grado, post_grado, area_de_conocimiento, fecha_ingreso,
            created_at, updated_at
        ) VALUES (
            v_id_categoria, p_id, v_id_dedicacion, v_id_ubicacion,
            p_pre_grado, p_pos_grado, p_area_de_conocimiento, p_fecha_ingreso,
            NOW(), NOW()
        ) RETURNING id_profesor INTO v_id_profesor;
        
        -- Respuesta de éxito
        p_resultado := respuestas.respuesta_con_datos(
            'Profesor registrado exitosamente',
            jsonb_build_object(
                'profesor', jsonb_build_object(
                    'id', v_id_profesor,
                    'nombres', p_nombres,
                    'apellidos', p_apellidos,
                    'email', p_email
                )
            ),
			jsonb_build_object(
                'status', v_status
            )
        );

        SELECT utils.registrar_log(
            'REGISTRO_EXITOSO',
            'Profesor y usuario registrados correctamente',
            jsonb_build_object(
                'id_profesor', v_id_profesor,
                'email', p_email
            ),
            p_usuario_accion,
            FORMAT('{id_profesor:%s}', v_id_profesor)
        ) INTO v_log_id;
        
    EXCEPTION
        WHEN unique_violation THEN
            GET STACKED DIAGNOSTICS v_error_context = PG_EXCEPTION_CONTEXT;
            SELECT utils.registrar_log(
                'REGISTRO_FALLIDO',
                'Intento de registro duplicado: ' || SQLERRM,
                jsonb_build_object(
                    'error_context', v_error_context,
                    'tipo_error', 'UNIQUE_VIOLATION'
                ),
                p_usuario_accion,
                'profesor'
            ) INTO v_log_id;
            
            p_resultado := respuestas.error_generico('Usuario o Profesor ya existente');
            
        WHEN check_violation THEN
            GET STACKED DIAGNOSTICS v_error_context = PG_EXCEPTION_CONTEXT;
            SELECT utils.registrar_log(
                'REGISTRO_FALLIDO',
                'Datos inválidos en registro: ' || SQLERRM,
                jsonb_build_object(
                    'error_context', v_error_context,
                    'tipo_error', 'CHECK_VIOLATION'
                ),
                p_usuario_accion,
                'profesor'
            ) INTO v_log_id;
            
            p_resultado := respuestas.error_generico('Datos inválidos: ' || SQLERRM);
            
        WHEN OTHERS THEN
            GET STACKED DIAGNOSTICS v_error_context = PG_EXCEPTION_CONTEXT;
            SELECT utils.registrar_log(
                'ERROR_NO_CONTROLADO',
                'Error inesperado en registro: ' || SQLERRM,
                jsonb_build_object(
                    'error_context', v_error_context,
                    'tipo_error', 'OTRO_ERROR'
                ),
                p_usuario_accion,
                'profesor'
            ) INTO v_log_id;
            
            p_resultado := respuestas.error_generico('Error en el registro: ' || SQLERRM);
    END;
END;
$$;


ALTER PROCEDURE public.registrar_profesor_completo(IN p_usuario_accion integer, IN p_id integer, IN p_nombres character varying, IN p_apellidos character varying, IN p_email character varying, IN p_direccion character varying, IN p_password character varying, IN p_telefono_movil character varying, IN p_telefono_local character varying, IN p_fecha_nacimiento date, IN p_genero character varying, IN p_nombre_categoria character varying, IN p_nombre_dedicacion character varying, IN p_nombre_ubicacion character varying, IN p_pre_grado character varying, IN p_pos_grado character varying, IN p_area_de_conocimiento character varying, IN p_fecha_ingreso date, OUT p_resultado json) OWNER TO postgres;

--
-- TOC entry 304 (class 1255 OID 68669)
-- Name: registrar_unidad_curricular_completo(integer, bigint, character varying, text, integer, character varying); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.registrar_unidad_curricular_completo(IN p_usuario_accion integer, IN p_id_trayecto bigint, IN p_nombre_unidad_curricular character varying, IN p_descripcion_unidad_curricular text, IN p_carga_horas integer, IN p_codigo_unidad character varying, OUT p_resultado json)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_valido boolean;
    v_mensaje text;
    v_codigo_error text;
    v_id_pnf_validado bigint;
    v_id_nueva_unidad bigint;
    v_error_context text;
    v_log_id bigint;
	v_usuario_existe BOOLEAN;
BEGIN
	-- .1 Validación Usuario que ejecuta el procedimiento
	SELECT validaciones.validar_existencia_usuario(p_usuario_accion) INTO v_usuario_existe;

	IF NOT v_usuario_existe THEN
        p_resultado := respuestas.error_generico('Usuario que ejecutar el procedimiento no existe', 400 );
		RETURN;
	END IF;
	
    -- 1. VALIDACIÓN COMPLETA DE DATOS (fuera de la transacción)
    SELECT es_valido, mensaje, codigo_error
    FROM validaciones.validar_datos_unidad_curricular_completo(
		p_usuario_accion,
        p_id_trayecto, 
        p_nombre_unidad_curricular, 
        p_descripcion_unidad_curricular,
        p_carga_horas,
        p_codigo_unidad
    ) INTO v_valido, v_mensaje, v_codigo_error;

    IF NOT v_valido THEN
        p_resultado := respuestas.error_generico(v_mensaje, 400);
        RETURN;
    END IF;
    
    -- Iniciar transacción (solo para operaciones de escritura)
    BEGIN
        -- 2. REGISTRO DE UNIDAD CURRICULAR
        INSERT INTO unidades_curriculares (
            id_trayecto,
            nombre_unidad_curricular,
            descripcion_unidad_curricular,
            horas_clase,
            codigo_unidad,
            created_at, 
            updated_at
        ) VALUES (
            p_id_trayecto,
            p_nombre_unidad_curricular,
            p_descripcion_unidad_curricular,
            p_carga_horas,
            p_codigo_unidad,
            NOW(), 
            NOW()
        ) RETURNING id_unidad_curricular INTO v_id_nueva_unidad;
        
        -- Respuesta de éxito
        p_resultado := respuestas.respuesta_con_datos(
            'Unidad curricular registrada exitosamente',
            jsonb_build_object(
                'unidad_curricular', jsonb_build_object(
                    'id', v_id_nueva_unidad,
                    'nombre', p_nombre_unidad_curricular,
                    'codigo', p_codigo_unidad,
                    'id_trayecto', p_id_trayecto
                )
            ), jsonb_build_object(
                    'fecha_registro', NOW()::text,
                    'registrado_por', p_usuario_accion,
                    'nota', 'Registro completado correctamente'
                )
        );

        SELECT utils.registrar_log(
            'REGISTRO_EXITOSO',
            'Unidad curricular registrada correctamente',
            jsonb_build_object(
                'id_unidad', v_id_nueva_unidad,
                'nombre_unidad', p_nombre_unidad_curricular,
                'id_trayecto', p_id_trayecto
            ),
            p_usuario_accion,
            FORMAT('{id_unidad_curricular:%s}', v_id_nueva_unidad)
        ) INTO v_log_id;
        
    EXCEPTION
        WHEN unique_violation THEN
            GET STACKED DIAGNOSTICS v_error_context = PG_EXCEPTION_CONTEXT;
            SELECT utils.registrar_log(
                'REGISTRO_FALLIDO',
                'Intento de registro duplicado: ' || SQLERRM,
                jsonb_build_object(
                    'error_context', v_error_context,
                    'tipo_error', 'UNIQUE_VIOLATION',
                    'datos_intento', jsonb_build_object(
                        'id_trayecto', p_id_trayecto,
                        'nombre_unidad', p_nombre_unidad_curricular
                    )
                ),
                p_usuario_accion,
                'unidad_curricular'
            ) INTO v_log_id;
            
            p_resultado := respuestas.error_generico('Unidad curricular ya existente', 400);
            
        WHEN check_violation THEN
            GET STACKED DIAGNOSTICS v_error_context = PG_EXCEPTION_CONTEXT;
            SELECT utils.registrar_log(
                'REGISTRO_FALLIDO',
                'Datos inválidos en registro: ' || SQLERRM,
                jsonb_build_object(
                    'error_context', v_error_context,
                    'tipo_error', 'CHECK_VIOLATION',
                    'datos_intento', jsonb_build_object(
                        'id_trayecto', p_id_trayecto,
                        'nombre_unidad', p_nombre_unidad_curricular
                    )
                ),
                p_usuario_accion,
                'unidad_curricular'
            ) INTO v_log_id;
            
            p_resultado := respuestas.error_generico('Datos inválidos: ' || SQLERRM, 400);
            
        WHEN OTHERS THEN
            GET STACKED DIAGNOSTICS v_error_context = PG_EXCEPTION_CONTEXT;
            SELECT utils.registrar_log(
                'ERROR_NO_CONTROLADO',
                'Error inesperado en registro: ' || SQLERRM,
                jsonb_build_object(
                    'error_context', v_error_context,
                    'tipo_error', 'OTRO_ERROR',
                    'datos_intento', jsonb_build_object(
                        'id_trayecto', p_id_trayecto,
                        'nombre_unidad', p_nombre_unidad_curricular
                    )
                ),
                p_usuario_accion,
                'unidad_curricular'
            ) INTO v_log_id;
            
            p_resultado := respuestas.error_generico('Error en el registro: ' || SQLERRM, 400);
    END;
END;
$$;


ALTER PROCEDURE public.registrar_unidad_curricular_completo(IN p_usuario_accion integer, IN p_id_trayecto bigint, IN p_nombre_unidad_curricular character varying, IN p_descripcion_unidad_curricular text, IN p_carga_horas integer, IN p_codigo_unidad character varying, OUT p_resultado json) OWNER TO postgres;

--
-- TOC entry 292 (class 1255 OID 93241)
-- Name: error_generico(text, integer); Type: FUNCTION; Schema: respuestas; Owner: postgres
--

CREATE FUNCTION respuestas.error_generico(p_mensaje text, p_status integer) RETURNS json
    LANGUAGE plpgsql
    AS $$
BEGIN

    RETURN json_build_object(
        'status', 'error',
        'message', p_mensaje,
		'status_code', p_status,
        'timestamp', CURRENT_TIMESTAMP
    );
END;
$$;


ALTER FUNCTION respuestas.error_generico(p_mensaje text, p_status integer) OWNER TO postgres;

--
-- TOC entry 294 (class 1255 OID 93242)
-- Name: respuesta_con_datos(text, jsonb, jsonb); Type: FUNCTION; Schema: respuestas; Owner: postgres
--

CREATE FUNCTION respuestas.respuesta_con_datos(p_mensaje text, p_datos jsonb, p_metadata jsonb) RETURNS json
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN json_build_object(
        'status', 'success',
        'message', p_mensaje,
        'data', p_datos,
		'metadata', p_metadata
    );
END;
$$;


ALTER FUNCTION respuestas.respuesta_con_datos(p_mensaje text, p_datos jsonb, p_metadata jsonb) OWNER TO postgres;

--
-- TOC entry 295 (class 1255 OID 55629)
-- Name: registrar_log(character varying, text, jsonb, bigint, character varying); Type: FUNCTION; Schema: utils; Owner: postgres
--

CREATE FUNCTION utils.registrar_log(p_event_type character varying, p_message text, p_metadata jsonb, p_user_id bigint DEFAULT 999999999, p_reference_type character varying DEFAULT NULL::character varying) RETURNS bigint
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_log_id bigint;
BEGIN
    INSERT INTO public.logs (
        event_type,
        message,
        metadata,
        user_id,
        reference_id
    ) VALUES (
        p_event_type,
        p_message,
        p_metadata,
        p_user_id,  -- Puede ser NULL
        p_reference_type
    ) RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$;


ALTER FUNCTION utils.registrar_log(p_event_type character varying, p_message text, p_metadata jsonb, p_user_id bigint, p_reference_type character varying) OWNER TO postgres;

--
-- TOC entry 287 (class 1255 OID 56085)
-- Name: registrar_notificacion(bigint, character varying, character varying, text, character varying, character varying, jsonb); Type: FUNCTION; Schema: utils; Owner: postgres
--

CREATE FUNCTION utils.registrar_notificacion(p_user_id bigint, p_type character varying, p_title character varying, p_body text DEFAULT NULL::text, p_reference_id character varying DEFAULT NULL::character varying, p_action_url character varying DEFAULT NULL::character varying, p_metadata jsonb DEFAULT NULL::jsonb) RETURNS bigint
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_notification_id BIGINT;
    v_error_message TEXT;
BEGIN
    -- Validación básica de parámetros obligatorios
    IF p_user_id IS NULL OR p_type IS NULL OR p_title IS NULL THEN
        RAISE EXCEPTION 'Parámetros obligatorios faltantes: user_id, type y title son requeridos';
    END IF;

    -- Insertar la notificación
    INSERT INTO notifications (
        user_id,
        type,
        title,
        body,
        reference_id,
        action_url,
        metadata,
        created_at,
        is_read
    ) VALUES (
        p_user_id,
        p_type,
        p_title,
        p_body,
        p_reference_id,
        p_action_url,
        p_metadata,
        NOW(),
        FALSE
    ) RETURNING id INTO v_notification_id;

    -- Retornar el ID de la notificación creada
    RETURN v_notification_id;

EXCEPTION
    WHEN foreign_key_violation THEN
        GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
        RAISE EXCEPTION 'Error de clave foránea: %', v_error_message;
    WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
        RAISE EXCEPTION 'Error al registrar notificación: %', v_error_message;
END;
$$;


ALTER FUNCTION utils.registrar_notificacion(p_user_id bigint, p_type character varying, p_title character varying, p_body text, p_reference_id character varying, p_action_url character varying, p_metadata jsonb) OWNER TO postgres;

--
-- TOC entry 296 (class 1255 OID 69871)
-- Name: validar_datos_horario_completo(integer, character varying, time without time zone, bigint, bigint, bigint); Type: FUNCTION; Schema: validaciones; Owner: postgres
--

CREATE FUNCTION validaciones.validar_datos_horario_completo(p_usuario_accion integer, p_dia_semana character varying, p_hora_inicio time without time zone, p_unidad_curricular_id bigint, p_id_seccion bigint, p_id_profesor bigint, OUT es_valido boolean, OUT mensaje text, OUT codigo_error text, OUT carga_horas_validada integer, OUT hora_fin_validada time without time zone) RETURNS record
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_dedicacion_id bigint;
    v_horas_disponibles_docencia interval;
    v_horas_asignadas interval;
    v_horas_nuevas interval;
    v_conflictos integer;
    v_turno_start_time time;
    v_turno_end_time time;
    v_id_turno bigint;
BEGIN
    -- Inicializar valores de retorno
    es_valido := true;
    mensaje := 'Datos de horario válidos';
    codigo_error := NULL;
    carga_horas_validada := NULL;
    hora_fin_validada := NULL;

    -- 1. Validación básica de datos de entrada
    IF p_dia_semana NOT IN ('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado') THEN
        PERFORM utils.registrar_log(
            'VALIDATION_ERROR', 
            'Día de la semana no válido', 
            jsonb_build_object('dia_semana', p_dia_semana),
            p_usuario_accion
        );
        es_valido := false;
        mensaje := 'Día de la semana no válido';
        codigo_error := 'DIA_INVALIDO';
        RETURN;
    END IF;

    -- 2. Validación de la unidad curricular
    SELECT horas_clase INTO carga_horas_validada 
    FROM unidades_curriculares 
    WHERE id_unidad_curricular = p_unidad_curricular_id;
    
    IF carga_horas_validada IS NULL THEN
        PERFORM utils.registrar_log(
            'VALIDATION_ERROR', 
            'Unidad curricular no encontrada', 
            jsonb_build_object('unidad_curricular_id', p_unidad_curricular_id),
            p_usuario_accion
        );
        es_valido := false;
        mensaje := 'No se pudo determinar la carga horaria de la unidad curricular';
        codigo_error := 'UNIDAD_NO_EXISTE';
        RETURN;
    END IF;

    -- 3. Calcular hora de fin basada en la carga horaria
    hora_fin_validada := p_hora_inicio + (carga_horas_validada * INTERVAL '45 minutes');

    -- 4. Validar orden de horas
    IF p_hora_inicio >= hora_fin_validada THEN
        PERFORM utils.registrar_log(
            'VALIDATION_ERROR', 
            'Hora inicio mayor o igual a hora fin', 
            jsonb_build_object(
                'hora_inicio', p_hora_inicio,
                'hora_fin', hora_fin_validada
            ),
            p_usuario_accion
        );
        es_valido := false;
        mensaje := 'La hora de inicio debe ser anterior a la hora de fin';
        codigo_error := 'HORAS_INVERSAS';
        RETURN;
    END IF;

    -- 5. Verificar existencia de referencias
    IF NOT EXISTS (SELECT 1 FROM secciones WHERE id_seccion = p_id_seccion) THEN
        PERFORM utils.registrar_log(
            'VALIDATION_ERROR', 
            'Sección no existe', 
            jsonb_build_object('id_seccion', p_id_seccion),
            p_usuario_accion
        );
        es_valido := false;
        mensaje := 'La sección especificada no existe';
        codigo_error := 'SECCION_NO_EXISTE';
        RETURN;
    END IF;

    -- Obtener el turno de la sección
    SELECT id_turno INTO v_id_turno 
    FROM secciones 
    WHERE id_seccion = p_id_seccion;
    
    IF v_id_turno IS NULL THEN
        PERFORM utils.registrar_log(
            'VALIDATION_ERROR', 
            'Sección sin turno asignado', 
            jsonb_build_object('id_seccion', p_id_seccion),
            p_usuario_accion
        );
        es_valido := false;
        mensaje := 'La sección no tiene un turno asignado';
        codigo_error := 'SECCION_SIN_TURNO';
        RETURN;
    END IF;

    -- Validar horario contra el turno
    SELECT inicio_hora, fin_hora INTO v_turno_start_time, v_turno_end_time
    FROM turnos
    WHERE id_turno = v_id_turno;
    
    IF v_turno_start_time IS NULL OR v_turno_end_time IS NULL THEN
        PERFORM utils.registrar_log(
            'VALIDATION_ERROR', 
            'Turno no encontrado', 
            jsonb_build_object('id_turno', v_id_turno),
            p_usuario_accion
        );
        es_valido := false;
        mensaje := 'El turno asignado a la sección no existe';
        codigo_error := 'TURNO_NO_EXISTE';
        RETURN;
    END IF;
    
    -- Validaciones específicas del turno
    IF p_hora_inicio < v_turno_start_time THEN
        PERFORM utils.registrar_log(
            'VALIDATION_ERROR', 
            'Hora inicio antes del turno', 
            jsonb_build_object(
                'hora_inicio', p_hora_inicio,
                'turno_inicio', v_turno_start_time
            ),
            p_usuario_accion
        );
        es_valido := false;
        mensaje := 'La hora de inicio es anterior al inicio del turno';
        codigo_error := 'HORA_INICIO_TURNO';
        RETURN;
    END IF;
    
    IF hora_fin_validada > v_turno_end_time THEN
        PERFORM utils.registrar_log(
            'VALIDATION_ERROR', 
            'Hora fin después del turno', 
            jsonb_build_object(
                'hora_fin', hora_fin_validada,
                'turno_fin', v_turno_end_time
            ),
            p_usuario_accion
        );
        es_valido := false;
        mensaje := 'La hora de fin es posterior al fin del turno';
        codigo_error := 'HORA_FIN_TURNO';
        RETURN;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM profesores WHERE id_profesor = p_id_profesor) THEN
        PERFORM utils.registrar_log(
            'VALIDATION_ERROR', 
            'Profesor no existe', 
            jsonb_build_object('id_profesor', p_id_profesor),
            p_usuario_accion
        );
        es_valido := false;
        mensaje := 'El profesor especificado no existe';
        codigo_error := 'PROFESOR_NO_EXISTE';
        RETURN;
    END IF;

    -- 6. Validar dedicación del profesor
    SELECT id_dedicacion INTO v_dedicacion_id 
    FROM profesores 
    WHERE id_profesor = p_id_profesor;
    
    IF v_dedicacion_id IS NULL THEN
        PERFORM utils.registrar_log(
            'VALIDATION_ERROR', 
            'Profesor sin dedicación asignada', 
            jsonb_build_object('id_profesor', p_id_profesor),
            p_usuario_accion
        );
        es_valido := false;
        mensaje := 'El profesor no tiene una dedicación asignada';
        codigo_error := 'SIN_DEDICACION';
        RETURN;
    END IF;

    -- 7. Validar horas disponibles según dedicación
    SELECT horas_docencia_semanales INTO v_horas_disponibles_docencia
    FROM dedicaciones
    WHERE id_dedicacion = v_dedicacion_id;

    SELECT COALESCE(SUM(hora_fin - hora_inicio), INTERVAL '0 hours') 
    INTO v_horas_asignadas
    FROM horarios
    WHERE profesor_id = p_id_profesor
    AND activo = TRUE;

    v_horas_nuevas := (hora_fin_validada - p_hora_inicio);

    IF (v_horas_asignadas + v_horas_nuevas) > v_horas_disponibles_docencia THEN
        PERFORM utils.registrar_log(
            'VALIDATION_ERROR', 
            'Horas exceden dedicación', 
            jsonb_build_object(
                'horas_disponibles', v_horas_disponibles_docencia,
                'horas_asignadas', v_horas_asignadas,
                'horas_nuevas', v_horas_nuevas
            ),
            p_usuario_accion
        );
        es_valido := false;
        mensaje := 'El profesor no tiene horas disponibles en su dedicación para asumir este horario';
        codigo_error := 'EXCEDE_DEDICACION';
        RETURN;
    END IF;

    -- 8. Validar conflictos de horario para la sección
    SELECT COUNT(*) INTO v_conflictos
    FROM horarios
    WHERE seccion_id = p_id_seccion 
      AND dia_semana = p_dia_semana 
      AND (
          (p_hora_inicio BETWEEN hora_inicio AND hora_fin) OR
          (hora_fin_validada BETWEEN hora_inicio AND hora_fin) OR
          (hora_inicio BETWEEN p_hora_inicio AND hora_fin_validada)
      )
      AND activo = TRUE;

    IF v_conflictos > 0 THEN
        PERFORM utils.registrar_log(
            'VALIDATION_ERROR', 
            'Conflicto de horario para sección', 
            jsonb_build_object(
                'dia_semana', p_dia_semana,
                'hora_inicio', p_hora_inicio,
                'hora_fin', hora_fin_validada,
                'conflictos', v_conflictos
            ),
            p_usuario_accion
        );
        es_valido := false;
        mensaje := 'La sección tiene un conflicto de horario en ese intervalo';
        codigo_error := 'CONFLICTO_SECCION';
        RETURN;
    END IF;
END;
$$;


ALTER FUNCTION validaciones.validar_datos_horario_completo(p_usuario_accion integer, p_dia_semana character varying, p_hora_inicio time without time zone, p_unidad_curricular_id bigint, p_id_seccion bigint, p_id_profesor bigint, OUT es_valido boolean, OUT mensaje text, OUT codigo_error text, OUT carga_horas_validada integer, OUT hora_fin_validada time without time zone) OWNER TO postgres;

--
-- TOC entry 289 (class 1255 OID 68676)
-- Name: validar_datos_registro_administrador_completo(integer, bigint, character varying, character varying, bigint); Type: FUNCTION; Schema: validaciones; Owner: postgres
--

CREATE FUNCTION validaciones.validar_datos_registro_administrador_completo(p_usuario_accion integer, p_id_cedula bigint, p_genero character varying, p_email character varying, p_id_rol bigint, OUT es_valido boolean, OUT mensaje text, OUT codigo_error text, OUT id_rol_validado bigint) RETURNS record
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Inicializar valores de retorno
    es_valido := true;
    mensaje := 'Datos de administrador válidos';
    codigo_error := NULL;
    id_rol_validado := NULL;

    -- 1. Validación de datos básicos del usuario
    
    -- Validación del género
    IF p_genero NOT IN ('masculino', 'femenino') THEN
        PERFORM utils.registrar_log(
            'VALIDATION_ERROR', 
            'Género no válido al registrar usuario', 
            jsonb_build_object('genero', p_genero),
            p_usuario_accion
        );
        es_valido := false;
        mensaje := 'Género no válido. Debe ser "masculino" o "femenino"';
        codigo_error := 'GENERO_INVALIDO';
        RETURN;
    END IF;

    -- Verificación de usuario existente por email
    IF EXISTS(SELECT 1 FROM users WHERE email = p_email) THEN
        PERFORM utils.registrar_log(
            'DUPLICATE_ENTRY', 
            'Intento de registrar usuario con email existente', 
            jsonb_build_object('email', p_email),
            p_usuario_accion
        );
        es_valido := false;
        mensaje := 'El usuario ya está registrado';
        codigo_error := 'EMAIL_DUPLICADO';
        RETURN;
    END IF;

    -- 2. Validación de datos específicos del administrador

    -- Validar si el usuario ya tiene asignado el rol en usuario_rol
    IF EXISTS(SELECT 1 FROM usuario_rol WHERE usuario_id = p_id_cedula AND rol_id = p_id_rol) THEN
        PERFORM utils.registrar_log(
            'DUPLICATE_ROL', 
            'El usuario ya tiene asignado este rol', 
            jsonb_build_object('id_cedula', p_id_cedula, 'id_rol', p_id_rol),
            p_usuario_accion
        );
        es_valido := false;
        mensaje := 'El usuario ya tiene asignado este rol';
        codigo_error := 'ROL_DUPLICADO';
        RETURN;
    END IF;

    -- Validar que el rol existe y es un rol de administrador (1 o 2)
SELECT id_rol INTO id_rol_validado 
FROM roles 
WHERE id_rol = p_id_rol;

IF id_rol_validado IS NULL THEN
    -- Registrar log de error
    PERFORM utils.registrar_log(
        'VALIDATION_ERROR', 
        'Rol no encontrado al registrar administrador', 
        jsonb_build_object(
            'id_rol_solicitado', p_id_rol,
            'roles_permitidos', '[1, 2]'
        ),
        p_usuario_accion,
        'administrador'
    );
    
    -- Establecer valores de retorno
    es_valido := false;
    mensaje := 'El rol especificado no existe o no es un rol de administrador';
    codigo_error := 'ROL_INVALIDO';
    RETURN;
END IF;

-- Verificar que el rol sea de administrador (1 o 2)
	IF id_rol_validado NOT IN (1, 2) THEN
    PERFORM utils.registrar_log(
        'VALIDATION_ERROR', 
        'Rol no es de administrador', 
        jsonb_build_object(
            'id_rol_proporcionado', p_id_rol,
            'roles_esperados', '[1, 2]'
        ),
        p_usuario_accion,
        'administrador'
    );
    
    es_valido := false;
    mensaje := 'El rol especificado no es un rol de administrador válido';
    codigo_error := 'ROL_NO_ADMIN';
    RETURN;
END IF;
END;
$$;


ALTER FUNCTION validaciones.validar_datos_registro_administrador_completo(p_usuario_accion integer, p_id_cedula bigint, p_genero character varying, p_email character varying, p_id_rol bigint, OUT es_valido boolean, OUT mensaje text, OUT codigo_error text, OUT id_rol_validado bigint) OWNER TO postgres;

--
-- TOC entry 290 (class 1255 OID 68677)
-- Name: validar_datos_registro_coordinador_completo(integer, bigint, character varying, character varying, bigint, bigint, bigint); Type: FUNCTION; Schema: validaciones; Owner: postgres
--

CREATE FUNCTION validaciones.validar_datos_registro_coordinador_completo(p_usuario_accion integer, p_id_cedula bigint, p_genero character varying, p_email character varying, p_id_rol bigint, p_id_pnf bigint, p_id_ubicacion bigint, OUT es_valido boolean, OUT mensaje text, OUT codigo_error text, OUT id_rol_validado bigint, OUT id_pnf_validado bigint, OUT id_ubicacion_validado bigint) RETURNS record
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_coordinador_existente boolean;
    v_existe_persona boolean;
BEGIN
    -- Inicializar valores de retorno
    es_valido := true;
    mensaje := 'Datos de coordinador válidos';
    codigo_error := NULL;
    id_rol_validado := NULL;
    id_pnf_validado := NULL;
    id_ubicacion_validado := NULL;

    -- 1. Validación de datos básicos del usuario
    
    -- Validación del género
    IF p_genero NOT IN ('masculino', 'femenino') THEN
        PERFORM utils.registrar_log(
            'VALIDATION_ERROR', 
            'Género no válido al registrar coordinador', 
            jsonb_build_object('genero', p_genero),
            p_usuario_accion
        );
        es_valido := false;
        mensaje := 'Género no válido. Debe ser "masculino" o "femenino"';
        codigo_error := 'GENERO_INVALIDO';
        RETURN;
    END IF;

    -- Verificación de usuario existente por email
    IF EXISTS(SELECT 1 FROM users WHERE email = p_email) THEN
        PERFORM utils.registrar_log(
            'DUPLICATE_ENTRY', 
            'Intento de registrar coordinador con email existente', 
            jsonb_build_object('email', p_email),
            p_usuario_accion
        );
        es_valido := false;
        mensaje := 'El usuario ya está registrado';
        codigo_error := 'EMAIL_DUPLICADO';
        RETURN;
    END IF;

    -- 2. Validación de datos específicos del coordinador

    -- Validar si el usuario ya tiene asignado el rol en usuario_rol
    IF EXISTS(SELECT 1 FROM users WHERE cedula = p_id_cedula) THEN
        PERFORM utils.registrar_log(
            'DUPLICATE_USER', 
            'El usuario ya existe', 
            jsonb_build_object('id_cedula', p_id_cedula, 'id_rol', p_id_rol),
            p_usuario_accion
        );
        es_valido := false;
        mensaje := 'El usuario ya existe';
        codigo_error := 'DUPLICATE_USER';
        RETURN;
    END IF;
	
    IF EXISTS(SELECT 1 FROM usuario_rol WHERE usuario_id = p_id_cedula AND rol_id = p_id_rol) THEN
        PERFORM utils.registrar_log(
            'DUPLICATE_ROL', 
            'El usuario ya tiene asignado este rol', 
            jsonb_build_object('id_cedula', p_id_cedula, 'id_rol', p_id_rol),
            p_usuario_accion
        );
        es_valido := false;
        mensaje := 'El usuario ya tiene asignado este rol';
        codigo_error := 'ROL_DUPLICADO';
        RETURN;
    END IF;

    -- Validar que el rol existe
    SELECT id_rol INTO id_rol_validado 
    FROM roles 
    WHERE id_rol = p_id_rol;
    
    IF id_rol_validado IS NULL THEN
        PERFORM utils.registrar_log(
            'VALIDATION_ERROR', 
            'Rol no encontrado al registrar coordinador', 
            jsonb_build_object('id_rol', p_id_rol),
            p_usuario_accion
        );
        es_valido := false;
        mensaje := 'El rol especificado no existe';
        codigo_error := 'ROL_INVALIDO';
        RETURN;
    END IF;

    -- Validar que el PNF existe
    SELECT id_pnf INTO id_pnf_validado 
    FROM pnfs 
    WHERE id_pnf = p_id_pnf;
    
    IF id_pnf_validado IS NULL THEN
        PERFORM utils.registrar_log(
            'VALIDATION_ERROR', 
            'PNF no encontrado al registrar coordinador', 
            jsonb_build_object('id_pnf', p_id_pnf),
            p_usuario_accion
        );
        es_valido := false;
        mensaje := 'El PNF especificado no existe';
        codigo_error := 'PNF_INVALIDO';
        RETURN;
    END IF;

    -- Validar que la ubicación existe
    SELECT id_ubicacion INTO id_ubicacion_validado 
    FROM ubicaciones 
    WHERE id_ubicacion = p_id_ubicacion;
    
    IF id_ubicacion_validado IS NULL THEN
        PERFORM utils.registrar_log(
            'VALIDATION_ERROR', 
            'Ubicación no encontrada al registrar coordinador', 
            jsonb_build_object('id_ubicacion', p_id_ubicacion),
            p_usuario_accion
        );
        es_valido := false;
        mensaje := 'La ubicación especificada no existe';
        codigo_error := 'UBICACION_INVALIDA';
        RETURN;
    END IF;
END;
$$;


ALTER FUNCTION validaciones.validar_datos_registro_coordinador_completo(p_usuario_accion integer, p_id_cedula bigint, p_genero character varying, p_email character varying, p_id_rol bigint, p_id_pnf bigint, p_id_ubicacion bigint, OUT es_valido boolean, OUT mensaje text, OUT codigo_error text, OUT id_rol_validado bigint, OUT id_pnf_validado bigint, OUT id_ubicacion_validado bigint) OWNER TO postgres;

--
-- TOC entry 297 (class 1255 OID 93254)
-- Name: validar_datos_registro_pnf(integer, character varying, character varying); Type: FUNCTION; Schema: validaciones; Owner: postgres
--

CREATE FUNCTION validaciones.validar_datos_registro_pnf(p_usuario_accion integer, p_codigo_pnf character varying, p_nombre_pnf character varying, OUT es_valido boolean, OUT mensaje text, OUT codigo_error text, OUT status_code integer) RETURNS record
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_existe_codigo BOOLEAN;
    v_existe_nombre BOOLEAN;
BEGIN
    -- Inicializar valores de retorno
    es_valido := TRUE;
    mensaje := 'Datos de PNF válidos';
    codigo_error := NULL;
	status_code := 200;

    -- Verificar si el código ya existe (case-insensitive)
    SELECT EXISTS(SELECT 1 FROM pnfs WHERE LOWER(TRIM(codigo_pnf)) = LOWER(TRIM(p_codigo_pnf))) 
    INTO v_existe_codigo;
    
    -- Verificar si el nombre ya existe (case-insensitive)
    SELECT EXISTS(SELECT 1 FROM pnfs WHERE LOWER(TRIM(nombre_pnf)) = LOWER(TRIM(p_nombre_pnf))) 
    INTO v_existe_nombre;
    
    -- Validaciones
    IF p_codigo_pnf IS NULL OR p_codigo_pnf = '' THEN
        es_valido := FALSE;
        mensaje := 'El código PNF no puede estar vacío';
        codigo_error := 'CODIGO_VACIO';
        status_code := 400;
        PERFORM utils.registrar_log(
            'VALIDATION_ERROR', 
            'Intento de registrar PNF con código vacío', 
            jsonb_build_object('codigo_pnf', p_codigo_pnf),
            p_usuario_accion
        );
        
    ELSIF p_nombre_pnf IS NULL OR p_nombre_pnf = '' THEN
        es_valido := FALSE;
        mensaje := 'El nombre PNF no puede estar vacío';
        codigo_error := 'NOMBRE_VACIO';
		status_code := 400;
        PERFORM utils.registrar_log(
            'VALIDATION_ERROR', 
            'Intento de registrar PNF con nombre vacío', 
            jsonb_build_object('nombre_pnf', p_nombre_pnf),
            p_usuario_accion
        );
        
    ELSIF v_existe_codigo THEN
        es_valido := FALSE;
        mensaje := 'El código PNF ya está registrado';
        codigo_error := 'CODIGO_DUPLICADO';
		status_code := 400;
        PERFORM utils.registrar_log(
            'DUPLICATE_ENTRY', 
			
            'Intento de registrar PNF con código existente', 
            jsonb_build_object('codigo_pnf', p_codigo_pnf),
            p_usuario_accion
        );
        
    ELSIF v_existe_nombre THEN
        es_valido := FALSE;
        mensaje := 'El nombre PNF ya está registrado';
        codigo_error := 'NOMBRE_DUPLICADO';
        status_code := 400;
        PERFORM utils.registrar_log(
            'DUPLICATE_ENTRY', 
            'Intento de registrar PNF con nombre existente', 
            jsonb_build_object('nombre_pnf', p_nombre_pnf),
            p_usuario_accion
        );
    END IF;
END;
$$;


ALTER FUNCTION validaciones.validar_datos_registro_pnf(p_usuario_accion integer, p_codigo_pnf character varying, p_nombre_pnf character varying, OUT es_valido boolean, OUT mensaje text, OUT codigo_error text, OUT status_code integer) OWNER TO postgres;

--
-- TOC entry 302 (class 1255 OID 93246)
-- Name: validar_datos_registro_profesor_completo(integer, integer, character varying, character varying, character varying, character varying, character varying); Type: FUNCTION; Schema: validaciones; Owner: postgres
--

CREATE FUNCTION validaciones.validar_datos_registro_profesor_completo(p_usuario_accion integer, p_id integer, p_genero character varying, p_email character varying, p_nombre_categoria character varying, p_nombre_dedicacion character varying, p_nombre_ubicacion character varying, OUT es_valido boolean, OUT mensaje text, OUT status integer, OUT codigo_error text, OUT id_categoria bigint, OUT id_dedicacion bigint, OUT id_ubicacion bigint) RETURNS record
    LANGUAGE plpgsql
    AS $$
BEGIN

    -- Inicializar valores de retorno
    es_valido := true;
    mensaje := 'Datos de profesor válidos';
    codigo_error := NULL;
    id_categoria := NULL;
    id_dedicacion := NULL;
    id_ubicacion := NULL;
	status := 200;

    -- 1. Validación de datos básicos del usuario
    
    -- Validación del género
    IF p_genero NOT IN ('masculino', 'femenino') THEN
        PERFORM utils.registrar_log(
            'VALIDATION_ERROR', 
            'Género no válido al registrar usuario', 
            jsonb_build_object('genero', p_genero),
            p_usuario_accion
        );
        es_valido := false;
        mensaje := 'Género no válido. Debe ser "masculino" o "femenino"';
		status := 400;
        codigo_error := 'GENERO_INVALIDO';
        RETURN;
    END IF;

    -- Verificación de usuario existente por email
    IF EXISTS(SELECT 1 FROM users WHERE email = p_email) THEN
        PERFORM utils.registrar_log(
            'DUPLICATE_ENTRY', 
            'Intento de registrar usuario con email existente', 
            jsonb_build_object('email', p_email),
            p_usuario_accion
        );
        es_valido := false;
        mensaje := 'El usuario ya está registrado';
		status := 400;
        codigo_error := 'EMAIL_DUPLICADO';
        RETURN;
    END IF;

    -- 2. Validación de datos específicos del profesor
    
    -- Verificar si el usuario ya es profesor
    IF EXISTS(SELECT 1 FROM profesores WHERE id_cedula = p_id) THEN
        PERFORM utils.registrar_log(
            'DUPLICATE_PROFESOR', 
            'Intento de registrar profesor existente', 
            NULL,
            p_usuario_accion
        );
        es_valido := false;
        mensaje := 'El usuario ya está registrado como profesor';
		status := 400;
        codigo_error := 'PROFESOR_DUPLICADO';
        RETURN;
    END IF;

    -- Validar categoría
    SELECT cat.id_categoria INTO id_categoria 
    FROM categorias cat 
    WHERE cat.nombre_categoria = p_nombre_categoria;
    
    IF id_categoria IS NULL THEN
        PERFORM utils.registrar_log(
            'VALIDATION_ERROR', 
            'Categoría no encontrada al registrar profesor', 
            jsonb_build_object('categoria', p_nombre_categoria),
            p_usuario_accion
        );
        es_valido := false;
        mensaje := 'La categoría especificada no existe';
        codigo_error := 'CATEGORIA_INVALIDA';
        RETURN;
    END IF;

    -- Validar dedicación
    SELECT ded.id_dedicacion INTO id_dedicacion 
    FROM dedicaciones ded 
    WHERE ded.nombre_dedicacion = p_nombre_dedicacion;
    
    IF id_dedicacion IS NULL THEN
        PERFORM utils.registrar_log(
            'VALIDATION_ERROR', 
            'Dedicación no encontrada al registrar profesor', 
            jsonb_build_object('dedicacion', p_nombre_dedicacion),
            p_usuario_accion
        );
        es_valido := false;
        mensaje := 'La dedicación especificada no existe';
		status := 400;
        codigo_error := 'DEDICACION_INVALIDA';
        RETURN;
    END IF;

    -- Validar ubicación
    SELECT ubi.id_ubicacion INTO id_ubicacion 
    FROM ubicaciones ubi 
    WHERE ubi.nombre_ubicacion = p_nombre_ubicacion;
    
    IF id_ubicacion IS NULL THEN
        PERFORM utils.registrar_log(
            'VALIDATION_ERROR', 
            'Ubicación no encontrada al registrar profesor', 
            jsonb_build_object('ubicacion', p_nombre_ubicacion),
            p_usuario_accion
        );
        es_valido := false;
        mensaje := 'La ubicación especificada no existe';
		status := 400;
        codigo_error := 'UBICACION_INVALIDA';
        RETURN;
    END IF;
END;
$$;


ALTER FUNCTION validaciones.validar_datos_registro_profesor_completo(p_usuario_accion integer, p_id integer, p_genero character varying, p_email character varying, p_nombre_categoria character varying, p_nombre_dedicacion character varying, p_nombre_ubicacion character varying, OUT es_valido boolean, OUT mensaje text, OUT status integer, OUT codigo_error text, OUT id_categoria bigint, OUT id_dedicacion bigint, OUT id_ubicacion bigint) OWNER TO postgres;

--
-- TOC entry 299 (class 1255 OID 68678)
-- Name: validar_datos_unidad_curricular_completo(integer, bigint, character varying, text, integer, character varying); Type: FUNCTION; Schema: validaciones; Owner: postgres
--

CREATE FUNCTION validaciones.validar_datos_unidad_curricular_completo(p_usuario_accion integer, p_id_trayecto bigint, p_nombre_unidad_curricular character varying, p_descripcion_unidad_curricular text, p_carga_horas integer, p_codigo_unidad character varying, OUT es_valido boolean, OUT mensaje text, OUT codigo_error text) RETURNS record
    LANGUAGE plpgsql
    AS $$
DECLARE
    id_pnf_validado bigint;
BEGIN
    -- Inicializar valores de salida
    es_valido := true;
    mensaje := 'Datos de unidad curricular válidos';
    codigo_error := NULL;
    id_pnf_validado := NULL;

    -- 1. Validar existencia del trayecto
    IF NOT EXISTS(SELECT 1 FROM trayectos WHERE id_trayecto = p_id_trayecto) THEN
        PERFORM utils.registrar_log(
            'VALIDATION_ERROR', 
            'Trayecto no encontrado al registrar unidad curricular', 
            jsonb_build_object('id_trayecto', p_id_trayecto),
            p_usuario_accion
        );
        es_valido := false;
        mensaje := format('El trayecto con ID %s no existe', p_id_trayecto);
        codigo_error := 'TRAYECTO_NO_EXISTE';
        RETURN; -- Solo usamos RETURN aquí para salir de la función sin necesidad de pasar valores
    END IF;

    -- 2. Validar que el trayecto tenga PNF asociado
    SELECT id_pnf INTO id_pnf_validado 
    FROM trayectos 
    WHERE id_trayecto = p_id_trayecto;
    
    IF id_pnf_validado IS NULL THEN
        PERFORM utils.registrar_log(
            'VALIDATION_ERROR', 
            'Trayecto sin PNF asociado', 
            jsonb_build_object('id_trayecto', p_id_trayecto),
            p_usuario_accion
        );
        es_valido := false;
        mensaje := 'El trayecto no está asociado a ningún PNF';
        codigo_error := 'TRAYECTO_SIN_PNF';
        RETURN;
    END IF;

    -- 3. Validar unicidad de la unidad curricular
    IF EXISTS(
        SELECT 1 FROM unidades_curriculares 
        WHERE id_trayecto = p_id_trayecto
          AND nombre_unidad_curricular = p_nombre_unidad_curricular
          AND descripcion_unidad_curricular = p_descripcion_unidad_curricular
          AND horas_clase = p_carga_horas
          AND codigo_unidad = p_codigo_unidad
    ) THEN
        PERFORM utils.registrar_log(
            'DUPLICATE_ENTRY', 
            'Unidad curricular duplicada', 
            jsonb_build_object(
                'id_trayecto', p_id_trayecto,
                'nombre_unidad', p_nombre_unidad_curricular
            ),
            p_usuario_accion
        );
        es_valido := false;
        mensaje := format('La unidad curricular "%s" ya existe en este trayecto', p_nombre_unidad_curricular);
        codigo_error := 'UNIDAD_DUPLICADA';
        RETURN;
    END IF;
END;
$$;


ALTER FUNCTION validaciones.validar_datos_unidad_curricular_completo(p_usuario_accion integer, p_id_trayecto bigint, p_nombre_unidad_curricular character varying, p_descripcion_unidad_curricular text, p_carga_horas integer, p_codigo_unidad character varying, OUT es_valido boolean, OUT mensaje text, OUT codigo_error text) OWNER TO postgres;

--
-- TOC entry 288 (class 1255 OID 60480)
-- Name: validar_existencia_usuario(bigint); Type: FUNCTION; Schema: validaciones; Owner: postgres
--

CREATE FUNCTION validaciones.validar_existencia_usuario(p_cedula_usuario bigint) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_usuario_existe BOOLEAN;
BEGIN
    -- Verificar si el usuario existe
    SELECT EXISTS(SELECT 1 FROM users WHERE cedula = p_cedula_usuario) 
    INTO v_usuario_existe;
    
    -- Si no existe, registrar log y retornar false
    IF NOT v_usuario_existe THEN
        PERFORM utils.registrar_log(
            'VALIDATION_ERROR', 
            'Usuario no encontrado',
            jsonb_build_object(
                'usuario_solicitado', p_cedula_usuario
            ),
            NULL
        );
        RETURN false;
    END IF;
    
    -- Si existe, retornar true
    RETURN true;
END;
$$;


ALTER FUNCTION validaciones.validar_existencia_usuario(p_cedula_usuario bigint) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 266 (class 1259 OID 116199)
-- Name: areas_de_conocimiento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.areas_de_conocimiento (
    id integer NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.areas_de_conocimiento OWNER TO postgres;

--
-- TOC entry 265 (class 1259 OID 116198)
-- Name: areas_de_conocimiento_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.areas_de_conocimiento_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.areas_de_conocimiento_id_seq OWNER TO postgres;

--
-- TOC entry 5277 (class 0 OID 0)
-- Dependencies: 265
-- Name: areas_de_conocimiento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.areas_de_conocimiento_id_seq OWNED BY public.areas_de_conocimiento.id;


--
-- TOC entry 272 (class 1259 OID 116246)
-- Name: aulas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.aulas (
    id_aula integer NOT NULL,
    id_sede integer NOT NULL,
    codigo character varying(255) NOT NULL,
    tipo_id integer NOT NULL,
    capacidad integer NOT NULL,
    activa boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.aulas OWNER TO postgres;

--
-- TOC entry 271 (class 1259 OID 116245)
-- Name: aulas_id_aula_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.aulas_id_aula_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.aulas_id_aula_seq OWNER TO postgres;

--
-- TOC entry 5278 (class 0 OID 0)
-- Dependencies: 271
-- Name: aulas_id_aula_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.aulas_id_aula_seq OWNED BY public.aulas.id_aula;


--
-- TOC entry 225 (class 1259 OID 115766)
-- Name: categorias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categorias (
    id_categoria smallint NOT NULL,
    nombre_categoria character varying(50) NOT NULL,
    descripcion_categoria text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.categorias OWNER TO postgres;

--
-- TOC entry 5279 (class 0 OID 0)
-- Dependencies: 225
-- Name: COLUMN categorias.id_categoria; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.categorias.id_categoria IS 'ID numérico pequeño de la categoría (1-255)';


--
-- TOC entry 5280 (class 0 OID 0)
-- Dependencies: 225
-- Name: COLUMN categorias.nombre_categoria; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.categorias.nombre_categoria IS 'Nombre descriptivo de la categoría (debe ser único)';


--
-- TOC entry 5281 (class 0 OID 0)
-- Dependencies: 225
-- Name: COLUMN categorias.descripcion_categoria; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.categorias.descripcion_categoria IS 'Descripción detallada de la categoría';


--
-- TOC entry 5282 (class 0 OID 0)
-- Dependencies: 225
-- Name: COLUMN categorias.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.categorias.created_at IS 'Fecha de creación del registro';


--
-- TOC entry 5283 (class 0 OID 0)
-- Dependencies: 225
-- Name: COLUMN categorias.updated_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.categorias.updated_at IS 'Fecha de última actualización del registro';


--
-- TOC entry 237 (class 1259 OID 115889)
-- Name: coordinadores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coordinadores (
    id_coordinador bigint NOT NULL,
    id_profesor bigint NOT NULL,
    id_pnf smallint NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.coordinadores OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 115888)
-- Name: coordinadores_id_coordinador_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.coordinadores_id_coordinador_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.coordinadores_id_coordinador_seq OWNER TO postgres;

--
-- TOC entry 5284 (class 0 OID 0)
-- Dependencies: 236
-- Name: coordinadores_id_coordinador_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.coordinadores_id_coordinador_seq OWNED BY public.coordinadores.id_coordinador;


--
-- TOC entry 224 (class 1259 OID 115755)
-- Name: dedicaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dedicaciones (
    id_dedicacion smallint NOT NULL,
    nombre_dedicacion character varying(50) NOT NULL,
    horas_docencia_semanales interval NOT NULL,
    horas_administrativas_semanales interval DEFAULT '00:00:00'::interval NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_dedicacion_total CHECK ((((EXTRACT(epoch FROM horas_docencia_semanales) / (3600)::numeric) + (EXTRACT(epoch FROM horas_administrativas_semanales) / (3600)::numeric)) <= (40)::numeric))
);


ALTER TABLE public.dedicaciones OWNER TO postgres;

--
-- TOC entry 5285 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN dedicaciones.id_dedicacion; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.dedicaciones.id_dedicacion IS 'ID numérico pequeño para tipo de dedicación (1-255)';


--
-- TOC entry 5286 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN dedicaciones.nombre_dedicacion; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.dedicaciones.nombre_dedicacion IS 'Nombre del tipo de dedicación (ej: Tiempo completo, Medio tiempo)';


--
-- TOC entry 5287 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN dedicaciones.horas_docencia_semanales; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.dedicaciones.horas_docencia_semanales IS 'Horas semanales dedicadas a docencia (formato interval)';


--
-- TOC entry 5288 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN dedicaciones.horas_administrativas_semanales; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.dedicaciones.horas_administrativas_semanales IS 'Horas semanales dedicadas a actividades administrativas';


--
-- TOC entry 5289 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN dedicaciones.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.dedicaciones.created_at IS 'Fecha de creación del registro';


--
-- TOC entry 5290 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN dedicaciones.updated_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.dedicaciones.updated_at IS 'Fecha de última actualización del registro';


--
-- TOC entry 250 (class 1259 OID 116036)
-- Name: horarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.horarios (
    id_horario bigint NOT NULL,
    seccion_id bigint NOT NULL,
    profesor_id bigint NOT NULL,
    unidad_curricular_id bigint NOT NULL,
    dia_semana text NOT NULL,
    hora_inicio time without time zone NOT NULL,
    hora_fin time without time zone NOT NULL,
    aula character varying(50) NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_horario_valido CHECK ((hora_inicio < hora_fin)),
    CONSTRAINT horarios_dia_semana_check CHECK ((dia_semana = ANY (ARRAY['Lunes'::text, 'Martes'::text, 'Miércoles'::text, 'Jueves'::text, 'Viernes'::text, 'Sábado'::text])))
);


ALTER TABLE public.horarios OWNER TO postgres;

--
-- TOC entry 5291 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN horarios.id_horario; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.horarios.id_horario IS 'ID único del horario';


--
-- TOC entry 5292 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN horarios.seccion_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.horarios.seccion_id IS 'Sección asociada al horario';


--
-- TOC entry 5293 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN horarios.profesor_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.horarios.profesor_id IS 'Profesor asignado';


--
-- TOC entry 5294 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN horarios.unidad_curricular_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.horarios.unidad_curricular_id IS 'Unidad curricular programada';


--
-- TOC entry 5295 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN horarios.dia_semana; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.horarios.dia_semana IS 'Día de la semana (domingo excluido por ser no lectivo)';


--
-- TOC entry 5296 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN horarios.hora_inicio; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.horarios.hora_inicio IS 'Hora de inicio de la clase';


--
-- TOC entry 5297 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN horarios.hora_fin; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.horarios.hora_fin IS 'Hora de finalización de la clase';


--
-- TOC entry 5298 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN horarios.aula; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.horarios.aula IS 'Aula o espacio físico asignado';


--
-- TOC entry 5299 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN horarios.activo; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.horarios.activo IS 'Indica si el horario está actualmente activo';


--
-- TOC entry 5300 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN horarios.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.horarios.created_at IS 'Fecha de creación del registro';


--
-- TOC entry 5301 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN horarios.updated_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.horarios.updated_at IS 'Fecha de última actualización';


--
-- TOC entry 249 (class 1259 OID 116035)
-- Name: horarios_id_horario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.horarios_id_horario_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.horarios_id_horario_seq OWNER TO postgres;

--
-- TOC entry 5302 (class 0 OID 0)
-- Dependencies: 249
-- Name: horarios_id_horario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.horarios_id_horario_seq OWNED BY public.horarios.id_horario;


--
-- TOC entry 221 (class 1259 OID 114219)
-- Name: knex_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.knex_migrations (
    id integer NOT NULL,
    name character varying(255),
    batch integer,
    migration_time timestamp with time zone
);


ALTER TABLE public.knex_migrations OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 114218)
-- Name: knex_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.knex_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.knex_migrations_id_seq OWNER TO postgres;

--
-- TOC entry 5303 (class 0 OID 0)
-- Dependencies: 220
-- Name: knex_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.knex_migrations_id_seq OWNED BY public.knex_migrations.id;


--
-- TOC entry 223 (class 1259 OID 114226)
-- Name: knex_migrations_lock; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.knex_migrations_lock (
    index integer NOT NULL,
    is_locked integer
);


ALTER TABLE public.knex_migrations_lock OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 114225)
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.knex_migrations_lock_index_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.knex_migrations_lock_index_seq OWNER TO postgres;

--
-- TOC entry 5304 (class 0 OID 0)
-- Dependencies: 222
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.knex_migrations_lock_index_seq OWNED BY public.knex_migrations_lock.index;


--
-- TOC entry 244 (class 1259 OID 115962)
-- Name: logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.logs (
    id bigint NOT NULL,
    event_type character varying(50) NOT NULL,
    message text,
    metadata jsonb,
    user_id bigint,
    reference_id character varying(100),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.logs OWNER TO postgres;

--
-- TOC entry 5305 (class 0 OID 0)
-- Dependencies: 244
-- Name: TABLE logs; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.logs IS 'Índice para búsquedas por usuario';


--
-- TOC entry 5306 (class 0 OID 0)
-- Dependencies: 244
-- Name: COLUMN logs.id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.logs.id IS 'Identificador único del log';


--
-- TOC entry 5307 (class 0 OID 0)
-- Dependencies: 244
-- Name: COLUMN logs.event_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.logs.event_type IS 'Tipo de evento (ej: "user_login", "post_created")';


--
-- TOC entry 5308 (class 0 OID 0)
-- Dependencies: 244
-- Name: COLUMN logs.message; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.logs.message IS 'Descripción detallada del evento';


--
-- TOC entry 5309 (class 0 OID 0)
-- Dependencies: 244
-- Name: COLUMN logs.metadata; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.logs.metadata IS 'Información adicional estructurada (ej: IP, dispositivo)';


--
-- TOC entry 5310 (class 0 OID 0)
-- Dependencies: 244
-- Name: COLUMN logs.user_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.logs.user_id IS 'ID del usuario asociado al evento (si aplica)';


--
-- TOC entry 5311 (class 0 OID 0)
-- Dependencies: 244
-- Name: COLUMN logs.reference_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.logs.reference_id IS 'ID del recurso relacionado (ej: "post_123")';


--
-- TOC entry 5312 (class 0 OID 0)
-- Dependencies: 244
-- Name: COLUMN logs.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.logs.created_at IS 'Fecha y hora en que se registró el evento';


--
-- TOC entry 243 (class 1259 OID 115961)
-- Name: logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.logs_id_seq OWNER TO postgres;

--
-- TOC entry 5313 (class 0 OID 0)
-- Dependencies: 243
-- Name: logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.logs_id_seq OWNED BY public.logs.id;


--
-- TOC entry 248 (class 1259 OID 116018)
-- Name: notification_recipients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_recipients (
    notification_id bigint NOT NULL,
    user_id bigint NOT NULL,
    is_read boolean DEFAULT false
);


ALTER TABLE public.notification_recipients OWNER TO postgres;

--
-- TOC entry 5314 (class 0 OID 0)
-- Dependencies: 248
-- Name: TABLE notification_recipients; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.notification_recipients IS 'Índice para búsquedas por usuario';


--
-- TOC entry 5315 (class 0 OID 0)
-- Dependencies: 248
-- Name: COLUMN notification_recipients.notification_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.notification_recipients.notification_id IS 'ID de la notificación';


--
-- TOC entry 5316 (class 0 OID 0)
-- Dependencies: 248
-- Name: COLUMN notification_recipients.user_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.notification_recipients.user_id IS 'ID del usuario destinatario';


--
-- TOC entry 5317 (class 0 OID 0)
-- Dependencies: 248
-- Name: COLUMN notification_recipients.is_read; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.notification_recipients.is_read IS 'Indica si el usuario leyó esta notificación masiva';


--
-- TOC entry 247 (class 1259 OID 116003)
-- Name: notification_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_roles (
    notification_id bigint NOT NULL,
    role_id integer NOT NULL
);


ALTER TABLE public.notification_roles OWNER TO postgres;

--
-- TOC entry 5318 (class 0 OID 0)
-- Dependencies: 247
-- Name: TABLE notification_roles; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.notification_roles IS 'Clave primaria compuesta para relación notificación-rol';


--
-- TOC entry 5319 (class 0 OID 0)
-- Dependencies: 247
-- Name: COLUMN notification_roles.notification_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.notification_roles.notification_id IS 'ID de la notificación relacionada';


--
-- TOC entry 5320 (class 0 OID 0)
-- Dependencies: 247
-- Name: COLUMN notification_roles.role_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.notification_roles.role_id IS 'ID del rol destinatario';


--
-- TOC entry 246 (class 1259 OID 115979)
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id bigint NOT NULL,
    user_id bigint,
    type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    body text,
    is_read boolean DEFAULT false,
    read_at timestamp with time zone,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    is_mass boolean DEFAULT false,
    mass_parent_id bigint
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- TOC entry 5321 (class 0 OID 0)
-- Dependencies: 246
-- Name: TABLE notifications; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.notifications IS 'Índice para ordenar por fecha';


--
-- TOC entry 5322 (class 0 OID 0)
-- Dependencies: 246
-- Name: COLUMN notifications.id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.notifications.id IS 'ID único de la notificación';


--
-- TOC entry 5323 (class 0 OID 0)
-- Dependencies: 246
-- Name: COLUMN notifications.user_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.notifications.user_id IS 'ID del usuario destinatario (nulo para notificaciones masivas)';


--
-- TOC entry 5324 (class 0 OID 0)
-- Dependencies: 246
-- Name: COLUMN notifications.type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.notifications.type IS 'Tipo de notificación';


--
-- TOC entry 5325 (class 0 OID 0)
-- Dependencies: 246
-- Name: COLUMN notifications.title; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.notifications.title IS 'Título de la notificación';


--
-- TOC entry 5326 (class 0 OID 0)
-- Dependencies: 246
-- Name: COLUMN notifications.body; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.notifications.body IS 'Contenido principal de la notificación';


--
-- TOC entry 5327 (class 0 OID 0)
-- Dependencies: 246
-- Name: COLUMN notifications.is_read; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.notifications.is_read IS 'Indica si la notificación fue leída';


--
-- TOC entry 5328 (class 0 OID 0)
-- Dependencies: 246
-- Name: COLUMN notifications.read_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.notifications.read_at IS 'Fecha/hora de lectura';


--
-- TOC entry 5329 (class 0 OID 0)
-- Dependencies: 246
-- Name: COLUMN notifications.metadata; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.notifications.metadata IS 'Metadatos adicionales en formato JSON';


--
-- TOC entry 5330 (class 0 OID 0)
-- Dependencies: 246
-- Name: COLUMN notifications.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.notifications.created_at IS 'Fecha de creación';


--
-- TOC entry 5331 (class 0 OID 0)
-- Dependencies: 246
-- Name: COLUMN notifications.is_mass; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.notifications.is_mass IS 'Indica si es notificación masiva';


--
-- TOC entry 5332 (class 0 OID 0)
-- Dependencies: 246
-- Name: COLUMN notifications.mass_parent_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.notifications.mass_parent_id IS 'ID de la notificación padre para masivas';


--
-- TOC entry 245 (class 1259 OID 115978)
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- TOC entry 5333 (class 0 OID 0)
-- Dependencies: 245
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- TOC entry 228 (class 1259 OID 115789)
-- Name: pnfs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pnfs (
    id_pnf smallint NOT NULL,
    codigo_pnf character varying(10) NOT NULL,
    nombre_pnf character varying(60) NOT NULL,
    id_sede smallint NOT NULL,
    descripcion_pnf character varying(400) NOT NULL,
    poblacion_estudiantil_pnf integer DEFAULT 0 NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.pnfs OWNER TO postgres;

--
-- TOC entry 5334 (class 0 OID 0)
-- Dependencies: 228
-- Name: COLUMN pnfs.codigo_pnf; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.pnfs.codigo_pnf IS 'Código institucional del PNF (ej: ING-INF)';


--
-- TOC entry 5335 (class 0 OID 0)
-- Dependencies: 228
-- Name: COLUMN pnfs.nombre_pnf; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.pnfs.nombre_pnf IS 'Nombre completo del Programa Nacional de Formación';


--
-- TOC entry 5336 (class 0 OID 0)
-- Dependencies: 228
-- Name: COLUMN pnfs.descripcion_pnf; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.pnfs.descripcion_pnf IS 'Objetivos y alcance del programa';


--
-- TOC entry 5337 (class 0 OID 0)
-- Dependencies: 228
-- Name: COLUMN pnfs.poblacion_estudiantil_pnf; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.pnfs.poblacion_estudiantil_pnf IS 'Estudiantes activos registrados';


--
-- TOC entry 5338 (class 0 OID 0)
-- Dependencies: 228
-- Name: COLUMN pnfs.activo; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.pnfs.activo IS 'Indica si el PNF está actualmente activo';


--
-- TOC entry 5339 (class 0 OID 0)
-- Dependencies: 228
-- Name: COLUMN pnfs.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.pnfs.created_at IS 'Fecha de creación del registro';


--
-- TOC entry 5340 (class 0 OID 0)
-- Dependencies: 228
-- Name: COLUMN pnfs.updated_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.pnfs.updated_at IS 'Fecha de última actualización';


--
-- TOC entry 227 (class 1259 OID 115788)
-- Name: pnfs_id_pnf_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pnfs_id_pnf_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pnfs_id_pnf_seq OWNER TO postgres;

--
-- TOC entry 5341 (class 0 OID 0)
-- Dependencies: 227
-- Name: pnfs_id_pnf_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pnfs_id_pnf_seq OWNED BY public.pnfs.id_pnf;


--
-- TOC entry 260 (class 1259 OID 116145)
-- Name: post_grado; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post_grado (
    id_post_grado integer NOT NULL,
    nombre character varying(100) NOT NULL,
    tipo_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.post_grado OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 116144)
-- Name: post_grado_id_post_grado_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.post_grado_id_post_grado_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.post_grado_id_post_grado_seq OWNER TO postgres;

--
-- TOC entry 5342 (class 0 OID 0)
-- Dependencies: 259
-- Name: post_grado_id_post_grado_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.post_grado_id_post_grado_seq OWNED BY public.post_grado.id_post_grado;


--
-- TOC entry 258 (class 1259 OID 116129)
-- Name: pre_grado; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pre_grado (
    id_pre_grado integer NOT NULL,
    nombre character varying(100) NOT NULL,
    tipo_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.pre_grado OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 116128)
-- Name: pre_grado_id_pre_grado_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pre_grado_id_pre_grado_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pre_grado_id_pre_grado_seq OWNER TO postgres;

--
-- TOC entry 5343 (class 0 OID 0)
-- Dependencies: 257
-- Name: pre_grado_id_pre_grado_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pre_grado_id_pre_grado_seq OWNED BY public.pre_grado.id_pre_grado;


--
-- TOC entry 268 (class 1259 OID 116212)
-- Name: profesor_area_conocimiento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profesor_area_conocimiento (
    id integer NOT NULL,
    profesor_id integer NOT NULL,
    area_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.profesor_area_conocimiento OWNER TO postgres;

--
-- TOC entry 267 (class 1259 OID 116211)
-- Name: profesor_area_conocimiento_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.profesor_area_conocimiento_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.profesor_area_conocimiento_id_seq OWNER TO postgres;

--
-- TOC entry 5344 (class 0 OID 0)
-- Dependencies: 267
-- Name: profesor_area_conocimiento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.profesor_area_conocimiento_id_seq OWNED BY public.profesor_area_conocimiento.id;


--
-- TOC entry 235 (class 1259 OID 115871)
-- Name: profesores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profesores (
    id_profesor bigint NOT NULL,
    id_cedula bigint NOT NULL,
    fecha_ingreso date NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.profesores OWNER TO postgres;

--
-- TOC entry 5345 (class 0 OID 0)
-- Dependencies: 235
-- Name: COLUMN profesores.id_profesor; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.profesores.id_profesor IS 'ID único del profesor';


--
-- TOC entry 5346 (class 0 OID 0)
-- Dependencies: 235
-- Name: COLUMN profesores.id_cedula; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.profesores.id_cedula IS 'Relación con la tabla de usuarios (1 a 1)';


--
-- TOC entry 5347 (class 0 OID 0)
-- Dependencies: 235
-- Name: COLUMN profesores.fecha_ingreso; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.profesores.fecha_ingreso IS 'Fecha de ingreso a la institución';


--
-- TOC entry 5348 (class 0 OID 0)
-- Dependencies: 235
-- Name: COLUMN profesores.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.profesores.created_at IS 'Fecha de creación del registro';


--
-- TOC entry 5349 (class 0 OID 0)
-- Dependencies: 235
-- Name: COLUMN profesores.updated_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.profesores.updated_at IS 'Fecha de última actualización';


--
-- TOC entry 234 (class 1259 OID 115870)
-- Name: profesores_id_profesor_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.profesores_id_profesor_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.profesores_id_profesor_seq OWNER TO postgres;

--
-- TOC entry 5350 (class 0 OID 0)
-- Dependencies: 234
-- Name: profesores_id_profesor_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.profesores_id_profesor_seq OWNED BY public.profesores.id_profesor;


--
-- TOC entry 252 (class 1259 OID 116073)
-- Name: relacion_categoria_profesor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.relacion_categoria_profesor (
    id integer NOT NULL,
    profesor_id integer NOT NULL,
    categoria_id integer NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_fin date,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.relacion_categoria_profesor OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 116072)
-- Name: relacion_categoria_profesor_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.relacion_categoria_profesor_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.relacion_categoria_profesor_id_seq OWNER TO postgres;

--
-- TOC entry 5351 (class 0 OID 0)
-- Dependencies: 251
-- Name: relacion_categoria_profesor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.relacion_categoria_profesor_id_seq OWNED BY public.relacion_categoria_profesor.id;


--
-- TOC entry 254 (class 1259 OID 116092)
-- Name: relacion_dedicacion_profesor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.relacion_dedicacion_profesor (
    id integer NOT NULL,
    profesor_id integer NOT NULL,
    dedicacion_id integer NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_fin date,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.relacion_dedicacion_profesor OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 116091)
-- Name: relacion_dedicacion_profesor_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.relacion_dedicacion_profesor_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.relacion_dedicacion_profesor_id_seq OWNER TO postgres;

--
-- TOC entry 5352 (class 0 OID 0)
-- Dependencies: 253
-- Name: relacion_dedicacion_profesor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.relacion_dedicacion_profesor_id_seq OWNED BY public.relacion_dedicacion_profesor.id;


--
-- TOC entry 264 (class 1259 OID 116180)
-- Name: relacion_profesor_post_grado; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.relacion_profesor_post_grado (
    id_r_post_grado_profesor integer NOT NULL,
    profesor_id integer NOT NULL,
    post_grado_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.relacion_profesor_post_grado OWNER TO postgres;

--
-- TOC entry 263 (class 1259 OID 116179)
-- Name: relacion_profesor_post_grado_id_r_post_grado_profesor_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.relacion_profesor_post_grado_id_r_post_grado_profesor_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.relacion_profesor_post_grado_id_r_post_grado_profesor_seq OWNER TO postgres;

--
-- TOC entry 5353 (class 0 OID 0)
-- Dependencies: 263
-- Name: relacion_profesor_post_grado_id_r_post_grado_profesor_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.relacion_profesor_post_grado_id_r_post_grado_profesor_seq OWNED BY public.relacion_profesor_post_grado.id_r_post_grado_profesor;


--
-- TOC entry 262 (class 1259 OID 116161)
-- Name: relacion_profesor_pre_grado; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.relacion_profesor_pre_grado (
    id_r_pre_grado_profesor integer NOT NULL,
    profesor_id integer NOT NULL,
    pre_grado_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.relacion_profesor_pre_grado OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 116160)
-- Name: relacion_profesor_pre_grado_id_r_pre_grado_profesor_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.relacion_profesor_pre_grado_id_r_pre_grado_profesor_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.relacion_profesor_pre_grado_id_r_pre_grado_profesor_seq OWNER TO postgres;

--
-- TOC entry 5354 (class 0 OID 0)
-- Dependencies: 261
-- Name: relacion_profesor_pre_grado_id_r_pre_grado_profesor_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.relacion_profesor_pre_grado_id_r_pre_grado_profesor_seq OWNED BY public.relacion_profesor_pre_grado.id_r_pre_grado_profesor;


--
-- TOC entry 232 (class 1259 OID 115844)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id_rol smallint NOT NULL,
    nombre_rol character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 5355 (class 0 OID 0)
-- Dependencies: 232
-- Name: COLUMN roles.id_rol; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.roles.id_rol IS 'Identificador único del rol (valor entre 1-255)';


--
-- TOC entry 5356 (class 0 OID 0)
-- Dependencies: 232
-- Name: COLUMN roles.nombre_rol; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.roles.nombre_rol IS 'Nombre descriptivo del rol (profesor, coordinador, etc.)';


--
-- TOC entry 5357 (class 0 OID 0)
-- Dependencies: 232
-- Name: COLUMN roles.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.roles.created_at IS 'Fecha y hora de creación del registro';


--
-- TOC entry 5358 (class 0 OID 0)
-- Dependencies: 232
-- Name: COLUMN roles.updated_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.roles.updated_at IS 'Fecha y hora de última actualización';


--
-- TOC entry 242 (class 1259 OID 115937)
-- Name: secciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.secciones (
    id_seccion bigint NOT NULL,
    valor_seccion character varying(1) NOT NULL,
    id_trayecto bigint NOT NULL,
    id_turno bigint,
    cupos_disponibles integer DEFAULT 20 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_secciones_cupos_validos CHECK (((cupos_disponibles >= 8) AND (cupos_disponibles <= 40)))
);


ALTER TABLE public.secciones OWNER TO postgres;

--
-- TOC entry 5359 (class 0 OID 0)
-- Dependencies: 242
-- Name: TABLE secciones; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.secciones IS 'Tabla de secciones académicas agrupadas por trayecto';


--
-- TOC entry 5360 (class 0 OID 0)
-- Dependencies: 242
-- Name: COLUMN secciones.id_seccion; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.secciones.id_seccion IS 'ID único de la sección (UUID)';


--
-- TOC entry 5361 (class 0 OID 0)
-- Dependencies: 242
-- Name: COLUMN secciones.valor_seccion; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.secciones.valor_seccion IS 'Valor identificador de la sección (ej: "1")';


--
-- TOC entry 5362 (class 0 OID 0)
-- Dependencies: 242
-- Name: COLUMN secciones.id_trayecto; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.secciones.id_trayecto IS 'Trayecto al que pertenece la sección';


--
-- TOC entry 5363 (class 0 OID 0)
-- Dependencies: 242
-- Name: COLUMN secciones.id_turno; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.secciones.id_turno IS 'El turno que tiene la seccion';


--
-- TOC entry 5364 (class 0 OID 0)
-- Dependencies: 242
-- Name: COLUMN secciones.cupos_disponibles; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.secciones.cupos_disponibles IS 'Cantidad de cupos disponibles (8-40)';


--
-- TOC entry 5365 (class 0 OID 0)
-- Dependencies: 242
-- Name: COLUMN secciones.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.secciones.created_at IS 'Fecha de creación del registro';


--
-- TOC entry 5366 (class 0 OID 0)
-- Dependencies: 242
-- Name: COLUMN secciones.updated_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.secciones.updated_at IS 'Fecha de última actualización';


--
-- TOC entry 241 (class 1259 OID 115936)
-- Name: secciones_id_seccion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.secciones_id_seccion_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.secciones_id_seccion_seq OWNER TO postgres;

--
-- TOC entry 5367 (class 0 OID 0)
-- Dependencies: 241
-- Name: secciones_id_seccion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.secciones_id_seccion_seq OWNED BY public.secciones.id_seccion;


--
-- TOC entry 226 (class 1259 OID 115778)
-- Name: sedes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sedes (
    id_sede smallint NOT NULL,
    nombre_sede character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.sedes OWNER TO postgres;

--
-- TOC entry 5368 (class 0 OID 0)
-- Dependencies: 226
-- Name: COLUMN sedes.id_sede; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.sedes.id_sede IS 'Identificador único numerico de la ubicación en rango (1-255)';


--
-- TOC entry 5369 (class 0 OID 0)
-- Dependencies: 226
-- Name: COLUMN sedes.nombre_sede; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.sedes.nombre_sede IS 'Nombre descriptivo de la ubicación (debe ser único)';


--
-- TOC entry 5370 (class 0 OID 0)
-- Dependencies: 226
-- Name: COLUMN sedes.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.sedes.created_at IS 'Fecha de creación del registro';


--
-- TOC entry 5371 (class 0 OID 0)
-- Dependencies: 226
-- Name: COLUMN sedes.updated_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.sedes.updated_at IS 'Fecha de última actualización del registro';


--
-- TOC entry 270 (class 1259 OID 116233)
-- Name: tipos_de_aula; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipos_de_aula (
    id integer NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.tipos_de_aula OWNER TO postgres;

--
-- TOC entry 269 (class 1259 OID 116232)
-- Name: tipos_de_aula_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tipos_de_aula_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tipos_de_aula_id_seq OWNER TO postgres;

--
-- TOC entry 5372 (class 0 OID 0)
-- Dependencies: 269
-- Name: tipos_de_aula_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tipos_de_aula_id_seq OWNED BY public.tipos_de_aula.id;


--
-- TOC entry 256 (class 1259 OID 116119)
-- Name: tipos_post_grado; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipos_post_grado (
    id_tipo_post_grado integer NOT NULL,
    nombre_tipo_post_grado character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.tipos_post_grado OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 116110)
-- Name: tipos_pre_grado; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipos_pre_grado (
    id_tipo_pre_grado integer NOT NULL,
    nombre_tipo_pre_grado character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.tipos_pre_grado OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 115812)
-- Name: trayectos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trayectos (
    id_trayecto smallint NOT NULL,
    poblacion_estudiantil integer DEFAULT 0 NOT NULL,
    valor_trayecto character varying(20) NOT NULL,
    id_pnf smallint NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.trayectos OWNER TO postgres;

--
-- TOC entry 5373 (class 0 OID 0)
-- Dependencies: 230
-- Name: COLUMN trayectos.poblacion_estudiantil; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trayectos.poblacion_estudiantil IS 'Cantidad de estudiantes en el trayecto';


--
-- TOC entry 5374 (class 0 OID 0)
-- Dependencies: 230
-- Name: COLUMN trayectos.valor_trayecto; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trayectos.valor_trayecto IS 'Valor identificador del trayecto (ej: Trayecto I, Trayecto II)';


--
-- TOC entry 5375 (class 0 OID 0)
-- Dependencies: 230
-- Name: COLUMN trayectos.id_pnf; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trayectos.id_pnf IS 'Referencia al PNF al que pertenece el trayecto';


--
-- TOC entry 5376 (class 0 OID 0)
-- Dependencies: 230
-- Name: COLUMN trayectos.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trayectos.created_at IS 'Fecha de creación del registro';


--
-- TOC entry 5377 (class 0 OID 0)
-- Dependencies: 230
-- Name: COLUMN trayectos.updated_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trayectos.updated_at IS 'Fecha de última actualización del registro';


--
-- TOC entry 229 (class 1259 OID 115811)
-- Name: trayectos_id_trayecto_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.trayectos_id_trayecto_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.trayectos_id_trayecto_seq OWNER TO postgres;

--
-- TOC entry 5378 (class 0 OID 0)
-- Dependencies: 229
-- Name: trayectos_id_trayecto_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.trayectos_id_trayecto_seq OWNED BY public.trayectos.id_trayecto;


--
-- TOC entry 238 (class 1259 OID 115907)
-- Name: turnos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.turnos (
    id_turno smallint NOT NULL,
    nombre_turno character varying(255) NOT NULL,
    inicio_hora time without time zone NOT NULL,
    fin_hora time without time zone NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_tiempo_turno CHECK ((fin_hora > inicio_hora))
);


ALTER TABLE public.turnos OWNER TO postgres;

--
-- TOC entry 5379 (class 0 OID 0)
-- Dependencies: 238
-- Name: COLUMN turnos.nombre_turno; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.turnos.nombre_turno IS 'Nombre del turno (ej: Matutino, Vespertino)';


--
-- TOC entry 5380 (class 0 OID 0)
-- Dependencies: 238
-- Name: COLUMN turnos.inicio_hora; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.turnos.inicio_hora IS 'Hora de inicio del turno';


--
-- TOC entry 5381 (class 0 OID 0)
-- Dependencies: 238
-- Name: COLUMN turnos.fin_hora; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.turnos.fin_hora IS 'Hora de fin del turno';


--
-- TOC entry 240 (class 1259 OID 115916)
-- Name: unidades_curriculares; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.unidades_curriculares (
    id_unidad_curricular bigint NOT NULL,
    id_trayecto bigint NOT NULL,
    codigo_unidad character varying(20) NOT NULL,
    nombre_unidad_curricular character varying(100) NOT NULL,
    descripcion_unidad_curricular text NOT NULL,
    horas_clase smallint NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.unidades_curriculares OWNER TO postgres;

--
-- TOC entry 5382 (class 0 OID 0)
-- Dependencies: 240
-- Name: COLUMN unidades_curriculares.id_unidad_curricular; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.unidades_curriculares.id_unidad_curricular IS 'ID único de la unidad curricular';


--
-- TOC entry 5383 (class 0 OID 0)
-- Dependencies: 240
-- Name: COLUMN unidades_curriculares.id_trayecto; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.unidades_curriculares.id_trayecto IS 'Trayecto al que pertenece la unidad curricular';


--
-- TOC entry 5384 (class 0 OID 0)
-- Dependencies: 240
-- Name: COLUMN unidades_curriculares.codigo_unidad; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.unidades_curriculares.codigo_unidad IS 'Código único identificador de la unidad (ej: MAT-101)';


--
-- TOC entry 5385 (class 0 OID 0)
-- Dependencies: 240
-- Name: COLUMN unidades_curriculares.nombre_unidad_curricular; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.unidades_curriculares.nombre_unidad_curricular IS 'Nombre completo de la unidad curricular';


--
-- TOC entry 5386 (class 0 OID 0)
-- Dependencies: 240
-- Name: COLUMN unidades_curriculares.descripcion_unidad_curricular; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.unidades_curriculares.descripcion_unidad_curricular IS 'Descripción detallada de los contenidos y objetivos';


--
-- TOC entry 5387 (class 0 OID 0)
-- Dependencies: 240
-- Name: COLUMN unidades_curriculares.horas_clase; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.unidades_curriculares.horas_clase IS 'Duración de horas de clase';


--
-- TOC entry 5388 (class 0 OID 0)
-- Dependencies: 240
-- Name: COLUMN unidades_curriculares.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.unidades_curriculares.created_at IS 'Fecha de creación del registro';


--
-- TOC entry 5389 (class 0 OID 0)
-- Dependencies: 240
-- Name: COLUMN unidades_curriculares.updated_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.unidades_curriculares.updated_at IS 'Fecha de última actualización';


--
-- TOC entry 239 (class 1259 OID 115915)
-- Name: unidades_curriculares_id_unidad_curricular_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.unidades_curriculares_id_unidad_curricular_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.unidades_curriculares_id_unidad_curricular_seq OWNER TO postgres;

--
-- TOC entry 5390 (class 0 OID 0)
-- Dependencies: 239
-- Name: unidades_curriculares_id_unidad_curricular_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.unidades_curriculares_id_unidad_curricular_seq OWNED BY public.unidades_curriculares.id_unidad_curricular;


--
-- TOC entry 231 (class 1259 OID 115828)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    cedula bigint NOT NULL,
    nombres character varying(50) NOT NULL,
    apellidos character varying(50) NOT NULL,
    direccion character varying(200) NOT NULL,
    password character varying(100) NOT NULL,
    telefono_movil character varying(15) NOT NULL,
    telefono_local character varying(15),
    fecha_nacimiento date NOT NULL,
    genero text NOT NULL,
    email character varying(100) NOT NULL,
    activo boolean DEFAULT true,
    last_login timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT users_genero_check CHECK ((genero = ANY (ARRAY['masculino'::text, 'femenino'::text])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 5391 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN users.cedula; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.cedula IS 'Número de cédula como identificador único';


--
-- TOC entry 5392 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN users.nombres; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.nombres IS 'Nombres del usuario';


--
-- TOC entry 5393 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN users.apellidos; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.apellidos IS 'Apellidos del usuario';


--
-- TOC entry 5394 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN users.direccion; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.direccion IS 'Dirección completa del usuario';


--
-- TOC entry 5395 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN users.password; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.password IS 'Contraseña encriptada';


--
-- TOC entry 5396 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN users.telefono_movil; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.telefono_movil IS 'Teléfono móvil principal';


--
-- TOC entry 5397 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN users.telefono_local; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.telefono_local IS 'Teléfono local (opcional)';


--
-- TOC entry 5398 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN users.fecha_nacimiento; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.fecha_nacimiento IS 'Fecha de nacimiento del usuario';


--
-- TOC entry 5399 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN users.genero; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.genero IS 'Género del usuario';


--
-- TOC entry 5400 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN users.email; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.email IS 'Correo electrónico único';


--
-- TOC entry 5401 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN users.activo; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.activo IS 'Indica si el usuario está activo en el sistema';


--
-- TOC entry 5402 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN users.last_login; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.last_login IS 'Último inicio de sesión';


--
-- TOC entry 5403 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN users.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.created_at IS 'Fecha de creación del registro';


--
-- TOC entry 5404 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN users.updated_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.updated_at IS 'Fecha de última actualización';


--
-- TOC entry 233 (class 1259 OID 115853)
-- Name: usuario_rol; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario_rol (
    usuario_id integer NOT NULL,
    rol_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.usuario_rol OWNER TO postgres;

--
-- TOC entry 5405 (class 0 OID 0)
-- Dependencies: 233
-- Name: TABLE usuario_rol; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.usuario_rol IS 'Tabla de relación muchos-a-muchos entre usuarios y roles';


--
-- TOC entry 5406 (class 0 OID 0)
-- Dependencies: 233
-- Name: COLUMN usuario_rol.usuario_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.usuario_rol.usuario_id IS 'ID del usuario en la tabla usuarios (parte de clave foránea)';


--
-- TOC entry 5407 (class 0 OID 0)
-- Dependencies: 233
-- Name: COLUMN usuario_rol.rol_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.usuario_rol.rol_id IS 'ID del rol en la tabla roles (parte de clave foránea)';


--
-- TOC entry 5408 (class 0 OID 0)
-- Dependencies: 233
-- Name: COLUMN usuario_rol.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.usuario_rol.created_at IS 'Fecha y hora de asignación del rol';


--
-- TOC entry 5409 (class 0 OID 0)
-- Dependencies: 233
-- Name: COLUMN usuario_rol.updated_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.usuario_rol.updated_at IS 'Fecha y hora de última actualización de la asignación';


--
-- TOC entry 4887 (class 2604 OID 116202)
-- Name: areas_de_conocimiento id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.areas_de_conocimiento ALTER COLUMN id SET DEFAULT nextval('public.areas_de_conocimiento_id_seq'::regclass);


--
-- TOC entry 4896 (class 2604 OID 116249)
-- Name: aulas id_aula; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aulas ALTER COLUMN id_aula SET DEFAULT nextval('public.aulas_id_aula_seq'::regclass);


--
-- TOC entry 4842 (class 2604 OID 115892)
-- Name: coordinadores id_coordinador; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coordinadores ALTER COLUMN id_coordinador SET DEFAULT nextval('public.coordinadores_id_coordinador_seq'::regclass);


--
-- TOC entry 4861 (class 2604 OID 116039)
-- Name: horarios id_horario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios ALTER COLUMN id_horario SET DEFAULT nextval('public.horarios_id_horario_seq'::regclass);


--
-- TOC entry 4814 (class 2604 OID 114222)
-- Name: knex_migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.knex_migrations ALTER COLUMN id SET DEFAULT nextval('public.knex_migrations_id_seq'::regclass);


--
-- TOC entry 4815 (class 2604 OID 114229)
-- Name: knex_migrations_lock index; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.knex_migrations_lock ALTER COLUMN index SET DEFAULT nextval('public.knex_migrations_lock_index_seq'::regclass);


--
-- TOC entry 4854 (class 2604 OID 115965)
-- Name: logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs ALTER COLUMN id SET DEFAULT nextval('public.logs_id_seq'::regclass);


--
-- TOC entry 4856 (class 2604 OID 115982)
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- TOC entry 4823 (class 2604 OID 115792)
-- Name: pnfs id_pnf; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pnfs ALTER COLUMN id_pnf SET DEFAULT nextval('public.pnfs_id_pnf_seq'::regclass);


--
-- TOC entry 4878 (class 2604 OID 116148)
-- Name: post_grado id_post_grado; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_grado ALTER COLUMN id_post_grado SET DEFAULT nextval('public.post_grado_id_post_grado_seq'::regclass);


--
-- TOC entry 4875 (class 2604 OID 116132)
-- Name: pre_grado id_pre_grado; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pre_grado ALTER COLUMN id_pre_grado SET DEFAULT nextval('public.pre_grado_id_pre_grado_seq'::regclass);


--
-- TOC entry 4890 (class 2604 OID 116215)
-- Name: profesor_area_conocimiento id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesor_area_conocimiento ALTER COLUMN id SET DEFAULT nextval('public.profesor_area_conocimiento_id_seq'::regclass);


--
-- TOC entry 4839 (class 2604 OID 115874)
-- Name: profesores id_profesor; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesores ALTER COLUMN id_profesor SET DEFAULT nextval('public.profesores_id_profesor_seq'::regclass);


--
-- TOC entry 4865 (class 2604 OID 116076)
-- Name: relacion_categoria_profesor id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.relacion_categoria_profesor ALTER COLUMN id SET DEFAULT nextval('public.relacion_categoria_profesor_id_seq'::regclass);


--
-- TOC entry 4868 (class 2604 OID 116095)
-- Name: relacion_dedicacion_profesor id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.relacion_dedicacion_profesor ALTER COLUMN id SET DEFAULT nextval('public.relacion_dedicacion_profesor_id_seq'::regclass);


--
-- TOC entry 4884 (class 2604 OID 116183)
-- Name: relacion_profesor_post_grado id_r_post_grado_profesor; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.relacion_profesor_post_grado ALTER COLUMN id_r_post_grado_profesor SET DEFAULT nextval('public.relacion_profesor_post_grado_id_r_post_grado_profesor_seq'::regclass);


--
-- TOC entry 4881 (class 2604 OID 116164)
-- Name: relacion_profesor_pre_grado id_r_pre_grado_profesor; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.relacion_profesor_pre_grado ALTER COLUMN id_r_pre_grado_profesor SET DEFAULT nextval('public.relacion_profesor_pre_grado_id_r_pre_grado_profesor_seq'::regclass);


--
-- TOC entry 4850 (class 2604 OID 115940)
-- Name: secciones id_seccion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.secciones ALTER COLUMN id_seccion SET DEFAULT nextval('public.secciones_id_seccion_seq'::regclass);


--
-- TOC entry 4893 (class 2604 OID 116236)
-- Name: tipos_de_aula id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_de_aula ALTER COLUMN id SET DEFAULT nextval('public.tipos_de_aula_id_seq'::regclass);


--
-- TOC entry 4828 (class 2604 OID 115815)
-- Name: trayectos id_trayecto; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trayectos ALTER COLUMN id_trayecto SET DEFAULT nextval('public.trayectos_id_trayecto_seq'::regclass);


--
-- TOC entry 4847 (class 2604 OID 115919)
-- Name: unidades_curriculares id_unidad_curricular; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unidades_curriculares ALTER COLUMN id_unidad_curricular SET DEFAULT nextval('public.unidades_curriculares_id_unidad_curricular_seq'::regclass);


--
-- TOC entry 5262 (class 0 OID 116199)
-- Dependencies: 266
-- Data for Name: areas_de_conocimiento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.areas_de_conocimiento (id, nombre, descripcion, created_at, updated_at) FROM stdin;
1	Programación	Desarrollo de software y lógica de programación.	2025-07-04 20:42:46.363339-04	2025-07-04 20:42:46.363339-04
2	Base de Datos	Modelado, diseño y administración de bases de datos.	2025-07-04 20:42:46.363339-04	2025-07-04 20:42:46.363339-04
3	Redes de Computadoras	Infraestructura, protocolos y seguridad de redes.	2025-07-04 20:42:46.363339-04	2025-07-04 20:42:46.363339-04
4	Sistemas Operativos	Principios y administración de sistemas operativos.	2025-07-04 20:42:46.363339-04	2025-07-04 20:42:46.363339-04
5	Ingeniería de Software	Procesos de diseño, desarrollo y mantenimiento de software.	2025-07-04 20:42:46.363339-04	2025-07-04 20:42:46.363339-04
6	Gestión Empresarial	Planificación, dirección y control de organizaciones.	2025-07-04 20:42:46.363339-04	2025-07-04 20:42:46.363339-04
7	Contabilidad	Registro y análisis financiero.	2025-07-04 20:42:46.363339-04	2025-07-04 20:42:46.363339-04
8	Finanzas	Gestión de recursos económicos.	2025-07-04 20:42:46.363339-04	2025-07-04 20:42:46.363339-04
9	Mercadeo	Estrategias de venta, publicidad y análisis de mercado.	2025-07-04 20:42:46.363339-04	2025-07-04 20:42:46.363339-04
10	Recursos Humanos	Administración de personal y talento humano.	2025-07-04 20:42:46.363339-04	2025-07-04 20:42:46.363339-04
11	Rehabilitación Física	Tratamientos físicos para recuperación de movilidad.	2025-07-04 20:42:46.363339-04	2025-07-04 20:42:46.363339-04
12	Anatomía Humana	Estructura del cuerpo humano aplicada a la fisioterapia.	2025-07-04 20:42:46.363339-04	2025-07-04 20:42:46.363339-04
13	Kinesiología	Estudio del movimiento corporal.	2025-07-04 20:42:46.363339-04	2025-07-04 20:42:46.363339-04
14	Terapia Funcional	Intervención para mejorar habilidades ocupacionales.	2025-07-04 20:42:46.363339-04	2025-07-04 20:42:46.363339-04
15	Psicomotricidad	Relación entre lo psíquico y lo motriz en el desarrollo.	2025-07-04 20:42:46.363339-04	2025-07-04 20:42:46.363339-04
16	Entrenamiento Deportivo	Planificación y evaluación del rendimiento físico.	2025-07-04 20:42:46.363339-04	2025-07-04 20:42:46.363339-04
17	Educación Física	Formación física integral en contextos educativos.	2025-07-04 20:42:46.363339-04	2025-07-04 20:42:46.363339-04
18	Biomecánica	Estudio del movimiento en el deporte.	2025-07-04 20:42:46.363339-04	2025-07-04 20:42:46.363339-04
19	Psicología Comunitaria	Intervenciones en comunidades y grupos sociales.	2025-07-04 20:42:46.363339-04	2025-07-04 20:42:46.363339-04
20	Psicología del Desarrollo	Evolución del comportamiento humano a lo largo de la vida.	2025-07-04 20:42:46.363339-04	2025-07-04 20:42:46.363339-04
21	Teorías de la Personalidad	Modelos explicativos del comportamiento individual.	2025-07-04 20:42:46.363339-04	2025-07-04 20:42:46.363339-04
22	Higiene y Seguridad Industrial	Prevención de accidentes y enfermedades laborales.	2025-07-04 20:42:46.363339-04	2025-07-04 20:42:46.363339-04
23	Ergonomía	Adaptación del entorno laboral al trabajador.	2025-07-04 20:42:46.363339-04	2025-07-04 20:42:46.363339-04
24	Salud Ocupacional	Promoción de la salud en el entorno de trabajo.	2025-07-04 20:42:46.363339-04	2025-07-04 20:42:46.363339-04
25	Didáctica Infantil	Estrategias educativas para la infancia.	2025-07-04 20:42:46.363339-04	2025-07-04 20:42:46.363339-04
26	Desarrollo Psicomotor	Desarrollo físico y mental en la infancia.	2025-07-04 20:42:46.363339-04	2025-07-04 20:42:46.363339-04
27	Psicología Infantil	Estudio del comportamiento en la primera infancia.	2025-07-04 20:42:46.363339-04	2025-07-04 20:42:46.363339-04
28	Matemáticas	Lógica, aritmética, álgebra, geometría y cálculo.	2025-07-04 20:42:46.363339-04	2025-07-04 20:42:46.363339-04
29	Lengua y Literatura	Análisis y producción de textos, gramática y comprensión.	2025-07-04 20:42:46.363339-04	2025-07-04 20:42:46.363339-04
30	Inglés	Lengua extranjera: comprensión y expresión oral y escrita.	2025-07-04 20:42:46.363339-04	2025-07-04 20:42:46.363339-04
31	Filosofía	Reflexión crítica sobre el pensamiento, la ética y la lógica.	2025-07-04 20:42:46.363339-04	2025-07-04 20:42:46.363339-04
32	Política y Sociedad	Estructura del Estado, ciudadanía y participación.	2025-07-04 20:42:46.363339-04	2025-07-04 20:42:46.363339-04
33	Historia de Venezuela	Evolución política y social del país.	2025-07-04 20:42:46.363339-04	2025-07-04 20:42:46.363339-04
34	Metodología de la Investigación	Técnicas y herramientas para realizar investigaciones académicas.	2025-07-04 20:42:46.363339-04	2025-07-04 20:42:46.363339-04
35	Tecnología Educativa	Uso de herramientas tecnológicas aplicadas a la enseñanza.	2025-07-04 20:42:46.363339-04	2025-07-04 20:42:46.363339-04
\.


--
-- TOC entry 5268 (class 0 OID 116246)
-- Dependencies: 272
-- Data for Name: aulas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.aulas (id_aula, id_sede, codigo, tipo_id, capacidad, activa, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5221 (class 0 OID 115766)
-- Dependencies: 225
-- Data for Name: categorias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categorias (id_categoria, nombre_categoria, descripcion_categoria, created_at, updated_at) FROM stdin;
1	Instructor	\N	2025-07-04 20:42:46.345561-04	2025-07-04 20:42:46.345561-04
2	Asistente	\N	2025-07-04 20:42:46.345561-04	2025-07-04 20:42:46.345561-04
3	Agregado	\N	2025-07-04 20:42:46.345561-04	2025-07-04 20:42:46.345561-04
4	Asociado	\N	2025-07-04 20:42:46.345561-04	2025-07-04 20:42:46.345561-04
5	Titular	\N	2025-07-04 20:42:46.345561-04	2025-07-04 20:42:46.345561-04
\.


--
-- TOC entry 5233 (class 0 OID 115889)
-- Dependencies: 237
-- Data for Name: coordinadores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coordinadores (id_coordinador, id_profesor, id_pnf, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5220 (class 0 OID 115755)
-- Dependencies: 224
-- Data for Name: dedicaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dedicaciones (id_dedicacion, nombre_dedicacion, horas_docencia_semanales, horas_administrativas_semanales, created_at, updated_at) FROM stdin;
1	Convencional	07:00:00	00:00:00	2025-07-04 20:42:46.355521-04	2025-07-04 20:42:46.355521-04
2	Medio Tiempo	12:00:00	06:00:00	2025-07-04 20:42:46.355521-04	2025-07-04 20:42:46.355521-04
3	Tiempo Completo	14:00:00	16:00:00	2025-07-04 20:42:46.355521-04	2025-07-04 20:42:46.355521-04
4	Exclusivo	18:00:00	18:00:00	2025-07-04 20:42:46.355521-04	2025-07-04 20:42:46.355521-04
\.


--
-- TOC entry 5246 (class 0 OID 116036)
-- Dependencies: 250
-- Data for Name: horarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.horarios (id_horario, seccion_id, profesor_id, unidad_curricular_id, dia_semana, hora_inicio, hora_fin, aula, activo, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5217 (class 0 OID 114219)
-- Dependencies: 221
-- Data for Name: knex_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.knex_migrations (id, name, batch, migration_time) FROM stdin;
69	20250525000001_dedicaciones.js	1	2025-07-04 20:42:35.085-04
70	20250525000002_categorias.js	1	2025-07-04 20:42:35.115-04
71	20250525000003_sedes.js	1	2025-07-04 20:42:35.131-04
72	20250525000004_pnfs.js	1	2025-07-04 20:42:35.174-04
73	20250525000005_trayectos.js	1	2025-07-04 20:42:35.197-04
74	20250525000006_users.js	1	2025-07-04 20:42:35.224-04
75	20250525000007_roles.js	1	2025-07-04 20:42:35.256-04
76	20250525000008_profesores.js	1	2025-07-04 20:42:35.279-04
77	20250525000009_coordinadores.js	1	2025-07-04 20:42:35.297-04
78	20250525000010_turnos.js	1	2025-07-04 20:42:35.304-04
79	20250525000011_unidad_curricular.js	1	2025-07-04 20:42:35.337-04
80	20250525000012_secciones.js	1	2025-07-04 20:42:35.368-04
81	20250525000013_logs.js	1	2025-07-04 20:42:35.39-04
82	20250525000014_notifications.js	1	2025-07-04 20:42:35.456-04
83	20250525000015_horarios.js	1	2025-07-04 20:42:35.51-04
84	20250525000016_relaciones_categoria_dedicacion.js	1	2025-07-04 20:42:35.544-04
85	20250525000017_pre_post-grado.js	1	2025-07-04 20:42:35.596-04
86	20250525000018_relaciones_pre_post_grado.js	1	2025-07-04 20:42:35.625-04
87	20250525000019_area_conocimiento.js	1	2025-07-04 20:42:35.662-04
88	20250525000020_aulas.js	1	2025-07-04 20:42:35.701-04
\.


--
-- TOC entry 5219 (class 0 OID 114226)
-- Dependencies: 223
-- Data for Name: knex_migrations_lock; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.knex_migrations_lock (index, is_locked) FROM stdin;
1	0
\.


--
-- TOC entry 5240 (class 0 OID 115962)
-- Dependencies: 244
-- Data for Name: logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.logs (id, event_type, message, metadata, user_id, reference_id, created_at) FROM stdin;
\.


--
-- TOC entry 5244 (class 0 OID 116018)
-- Dependencies: 248
-- Data for Name: notification_recipients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification_recipients (notification_id, user_id, is_read) FROM stdin;
\.


--
-- TOC entry 5243 (class 0 OID 116003)
-- Dependencies: 247
-- Data for Name: notification_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification_roles (notification_id, role_id) FROM stdin;
\.


--
-- TOC entry 5242 (class 0 OID 115979)
-- Dependencies: 246
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, type, title, body, is_read, read_at, metadata, created_at, is_mass, mass_parent_id) FROM stdin;
\.


--
-- TOC entry 5224 (class 0 OID 115789)
-- Dependencies: 228
-- Data for Name: pnfs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pnfs (id_pnf, codigo_pnf, nombre_pnf, id_sede, descripcion_pnf, poblacion_estudiantil_pnf, activo, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5256 (class 0 OID 116145)
-- Dependencies: 260
-- Data for Name: post_grado; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.post_grado (id_post_grado, nombre, tipo_id, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5254 (class 0 OID 116129)
-- Dependencies: 258
-- Data for Name: pre_grado; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pre_grado (id_pre_grado, nombre, tipo_id, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5264 (class 0 OID 116212)
-- Dependencies: 268
-- Data for Name: profesor_area_conocimiento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profesor_area_conocimiento (id, profesor_id, area_id, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5231 (class 0 OID 115871)
-- Dependencies: 235
-- Data for Name: profesores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profesores (id_profesor, id_cedula, fecha_ingreso, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5248 (class 0 OID 116073)
-- Dependencies: 252
-- Data for Name: relacion_categoria_profesor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.relacion_categoria_profesor (id, profesor_id, categoria_id, fecha_inicio, fecha_fin, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5250 (class 0 OID 116092)
-- Dependencies: 254
-- Data for Name: relacion_dedicacion_profesor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.relacion_dedicacion_profesor (id, profesor_id, dedicacion_id, fecha_inicio, fecha_fin, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5260 (class 0 OID 116180)
-- Dependencies: 264
-- Data for Name: relacion_profesor_post_grado; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.relacion_profesor_post_grado (id_r_post_grado_profesor, profesor_id, post_grado_id, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5258 (class 0 OID 116161)
-- Dependencies: 262
-- Data for Name: relacion_profesor_pre_grado; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.relacion_profesor_pre_grado (id_r_pre_grado_profesor, profesor_id, pre_grado_id, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5228 (class 0 OID 115844)
-- Dependencies: 232
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id_rol, nombre_rol, created_at, updated_at) FROM stdin;
1	Vicerrector	2025-07-04 20:42:46.33518-04	2025-07-04 20:42:46.33518-04
2	Director General de Gestión Curricular	2025-07-04 20:42:46.33518-04	2025-07-04 20:42:46.33518-04
3	Profesor	2025-07-04 20:42:46.33518-04	2025-07-04 20:42:46.33518-04
4	Coordinador	2025-07-04 20:42:46.33518-04	2025-07-04 20:42:46.33518-04
20	SuperAdmin	2025-07-04 20:42:46.33518-04	2025-07-04 20:42:46.33518-04
\.


--
-- TOC entry 5238 (class 0 OID 115937)
-- Dependencies: 242
-- Data for Name: secciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.secciones (id_seccion, valor_seccion, id_trayecto, id_turno, cupos_disponibles, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5222 (class 0 OID 115778)
-- Dependencies: 226
-- Data for Name: sedes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sedes (id_sede, nombre_sede, created_at, updated_at) FROM stdin;
1	Núcleo de Humanidades y Ciencias Sociales	2025-07-04 20:42:46.342664-04	2025-07-04 20:42:46.342664-04
2	Núcleo de Tecnología y Ciencias Administrativas	2025-07-04 20:42:46.342664-04	2025-07-04 20:42:46.342664-04
3	Núcleo de Salud y Deporte	2025-07-04 20:42:46.342664-04	2025-07-04 20:42:46.342664-04
\.


--
-- TOC entry 5266 (class 0 OID 116233)
-- Dependencies: 270
-- Data for Name: tipos_de_aula; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tipos_de_aula (id, nombre, descripcion, created_at, updated_at) FROM stdin;
1	Teoría	Aula estándar para clases teóricas.	2025-07-04 20:42:46.370697-04	2025-07-04 20:42:46.370697-04
2	Laboratorio	Espacio para prácticas científicas o técnicas.	2025-07-04 20:42:46.370697-04	2025-07-04 20:42:46.370697-04
3	Computación	Aula equipada con computadoras.	2025-07-04 20:42:46.370697-04	2025-07-04 20:42:46.370697-04
4	Audiovisual	Sala con recursos de proyección y sonido.	2025-07-04 20:42:46.370697-04	2025-07-04 20:42:46.370697-04
5	Multifuncional	Espacio adaptable a distintas actividades.	2025-07-04 20:42:46.370697-04	2025-07-04 20:42:46.370697-04
\.


--
-- TOC entry 5252 (class 0 OID 116119)
-- Dependencies: 256
-- Data for Name: tipos_post_grado; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tipos_post_grado (id_tipo_post_grado, nombre_tipo_post_grado, created_at, updated_at) FROM stdin;
1	Especialización	2025-07-04 20:42:46.350262-04	2025-07-04 20:42:46.350262-04
2	Maestría	2025-07-04 20:42:46.350262-04	2025-07-04 20:42:46.350262-04
3	Doctorado	2025-07-04 20:42:46.350262-04	2025-07-04 20:42:46.350262-04
4	Diplomado	2025-07-04 20:42:46.350262-04	2025-07-04 20:42:46.350262-04
5	Postdoctorado	2025-07-04 20:42:46.350262-04	2025-07-04 20:42:46.350262-04
\.


--
-- TOC entry 5251 (class 0 OID 116110)
-- Dependencies: 255
-- Data for Name: tipos_pre_grado; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tipos_pre_grado (id_tipo_pre_grado, nombre_tipo_pre_grado, created_at, updated_at) FROM stdin;
1	TSU	2025-07-04 20:42:46.348128-04	2025-07-04 20:42:46.348128-04
2	Licenciatura	2025-07-04 20:42:46.348128-04	2025-07-04 20:42:46.348128-04
3	Ingeniería	2025-07-04 20:42:46.348128-04	2025-07-04 20:42:46.348128-04
4	Arquitectura	2025-07-04 20:42:46.348128-04	2025-07-04 20:42:46.348128-04
5	Medicina	2025-07-04 20:42:46.348128-04	2025-07-04 20:42:46.348128-04
6	Odontología	2025-07-04 20:42:46.348128-04	2025-07-04 20:42:46.348128-04
7	Veterinaria	2025-07-04 20:42:46.348128-04	2025-07-04 20:42:46.348128-04
8	Educación	2025-07-04 20:42:46.348128-04	2025-07-04 20:42:46.348128-04
9	Abogacía	2025-07-04 20:42:46.348128-04	2025-07-04 20:42:46.348128-04
10	Contaduría Pública	2025-07-04 20:42:46.348128-04	2025-07-04 20:42:46.348128-04
\.


--
-- TOC entry 5226 (class 0 OID 115812)
-- Dependencies: 230
-- Data for Name: trayectos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trayectos (id_trayecto, poblacion_estudiantil, valor_trayecto, id_pnf, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5234 (class 0 OID 115907)
-- Dependencies: 238
-- Data for Name: turnos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.turnos (id_turno, nombre_turno, inicio_hora, fin_hora, created_at, updated_at) FROM stdin;
1	Matutino	07:00:00	12:15:00	2025-07-04 20:42:46.352714-04	2025-07-04 20:42:46.352714-04
2	Vespertino	12:30:00	18:00:00	2025-07-04 20:42:46.352714-04	2025-07-04 20:42:46.352714-04
3	Nocturno	18:00:00	21:30:00	2025-07-04 20:42:46.352714-04	2025-07-04 20:42:46.352714-04
\.


--
-- TOC entry 5236 (class 0 OID 115916)
-- Dependencies: 240
-- Data for Name: unidades_curriculares; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.unidades_curriculares (id_unidad_curricular, id_trayecto, codigo_unidad, nombre_unidad_curricular, descripcion_unidad_curricular, horas_clase, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5227 (class 0 OID 115828)
-- Dependencies: 231
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (cedula, nombres, apellidos, direccion, password, telefono_movil, telefono_local, fecha_nacimiento, genero, email, activo, last_login, created_at, updated_at) FROM stdin;
999999999	Super	Administrador	Servidor Principal	$2b$10$ucX43L0/PEXPpUDge6vvfuyRhXiSTJIpL5h2rtZhVszN45ftvqpIW	04141234567	\N	1985-01-01	masculino	superadmin@uptamca.ve	t	2025-07-04 20:42:46.32999-04	2025-07-04 20:42:46.32999-04	2025-07-04 20:42:46.32999-04
\.


--
-- TOC entry 5229 (class 0 OID 115853)
-- Dependencies: 233
-- Data for Name: usuario_rol; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuario_rol (usuario_id, rol_id, created_at, updated_at) FROM stdin;
999999999	20	2025-07-04 20:42:46.33796-04	2025-07-04 20:42:46.33796-04
\.


--
-- TOC entry 5410 (class 0 OID 0)
-- Dependencies: 265
-- Name: areas_de_conocimiento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.areas_de_conocimiento_id_seq', 35, true);


--
-- TOC entry 5411 (class 0 OID 0)
-- Dependencies: 271
-- Name: aulas_id_aula_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.aulas_id_aula_seq', 1, false);


--
-- TOC entry 5412 (class 0 OID 0)
-- Dependencies: 236
-- Name: coordinadores_id_coordinador_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.coordinadores_id_coordinador_seq', 1, false);


--
-- TOC entry 5413 (class 0 OID 0)
-- Dependencies: 249
-- Name: horarios_id_horario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.horarios_id_horario_seq', 1, false);


--
-- TOC entry 5414 (class 0 OID 0)
-- Dependencies: 220
-- Name: knex_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.knex_migrations_id_seq', 88, true);


--
-- TOC entry 5415 (class 0 OID 0)
-- Dependencies: 222
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.knex_migrations_lock_index_seq', 1, true);


--
-- TOC entry 5416 (class 0 OID 0)
-- Dependencies: 243
-- Name: logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.logs_id_seq', 1, false);


--
-- TOC entry 5417 (class 0 OID 0)
-- Dependencies: 245
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- TOC entry 5418 (class 0 OID 0)
-- Dependencies: 227
-- Name: pnfs_id_pnf_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pnfs_id_pnf_seq', 1, false);


--
-- TOC entry 5419 (class 0 OID 0)
-- Dependencies: 259
-- Name: post_grado_id_post_grado_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.post_grado_id_post_grado_seq', 1, false);


--
-- TOC entry 5420 (class 0 OID 0)
-- Dependencies: 257
-- Name: pre_grado_id_pre_grado_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pre_grado_id_pre_grado_seq', 1, false);


--
-- TOC entry 5421 (class 0 OID 0)
-- Dependencies: 267
-- Name: profesor_area_conocimiento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.profesor_area_conocimiento_id_seq', 1, false);


--
-- TOC entry 5422 (class 0 OID 0)
-- Dependencies: 234
-- Name: profesores_id_profesor_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.profesores_id_profesor_seq', 1, false);


--
-- TOC entry 5423 (class 0 OID 0)
-- Dependencies: 251
-- Name: relacion_categoria_profesor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.relacion_categoria_profesor_id_seq', 1, false);


--
-- TOC entry 5424 (class 0 OID 0)
-- Dependencies: 253
-- Name: relacion_dedicacion_profesor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.relacion_dedicacion_profesor_id_seq', 1, false);


--
-- TOC entry 5425 (class 0 OID 0)
-- Dependencies: 263
-- Name: relacion_profesor_post_grado_id_r_post_grado_profesor_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.relacion_profesor_post_grado_id_r_post_grado_profesor_seq', 1, false);


--
-- TOC entry 5426 (class 0 OID 0)
-- Dependencies: 261
-- Name: relacion_profesor_pre_grado_id_r_pre_grado_profesor_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.relacion_profesor_pre_grado_id_r_pre_grado_profesor_seq', 1, false);


--
-- TOC entry 5427 (class 0 OID 0)
-- Dependencies: 241
-- Name: secciones_id_seccion_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.secciones_id_seccion_seq', 1, false);


--
-- TOC entry 5428 (class 0 OID 0)
-- Dependencies: 269
-- Name: tipos_de_aula_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tipos_de_aula_id_seq', 5, true);


--
-- TOC entry 5429 (class 0 OID 0)
-- Dependencies: 229
-- Name: trayectos_id_trayecto_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.trayectos_id_trayecto_seq', 1, false);


--
-- TOC entry 5430 (class 0 OID 0)
-- Dependencies: 239
-- Name: unidades_curriculares_id_unidad_curricular_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.unidades_curriculares_id_unidad_curricular_seq', 1, false);


--
-- TOC entry 5022 (class 2606 OID 116210)
-- Name: areas_de_conocimiento areas_de_conocimiento_nombre_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.areas_de_conocimiento
    ADD CONSTRAINT areas_de_conocimiento_nombre_unique UNIQUE (nombre);


--
-- TOC entry 5024 (class 2606 OID 116208)
-- Name: areas_de_conocimiento areas_de_conocimiento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.areas_de_conocimiento
    ADD CONSTRAINT areas_de_conocimiento_pkey PRIMARY KEY (id);


--
-- TOC entry 5034 (class 2606 OID 116266)
-- Name: aulas aulas_id_sede_codigo_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aulas
    ADD CONSTRAINT aulas_id_sede_codigo_unique UNIQUE (id_sede, codigo);


--
-- TOC entry 5036 (class 2606 OID 116254)
-- Name: aulas aulas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aulas
    ADD CONSTRAINT aulas_pkey PRIMARY KEY (id_aula);


--
-- TOC entry 4915 (class 2606 OID 115776)
-- Name: categorias categorias_nombre_categoria_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_nombre_categoria_unique UNIQUE (nombre_categoria);


--
-- TOC entry 4917 (class 2606 OID 115774)
-- Name: categorias categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_pkey PRIMARY KEY (id_categoria);


--
-- TOC entry 4957 (class 2606 OID 115896)
-- Name: coordinadores coordinadores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coordinadores
    ADD CONSTRAINT coordinadores_pkey PRIMARY KEY (id_coordinador);


--
-- TOC entry 4911 (class 2606 OID 115764)
-- Name: dedicaciones dedicaciones_nombre_dedicacion_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dedicaciones
    ADD CONSTRAINT dedicaciones_nombre_dedicacion_unique UNIQUE (nombre_dedicacion);


--
-- TOC entry 4913 (class 2606 OID 115762)
-- Name: dedicaciones dedicaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dedicaciones
    ADD CONSTRAINT dedicaciones_pkey PRIMARY KEY (id_dedicacion);


--
-- TOC entry 4988 (class 2606 OID 116048)
-- Name: horarios horarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios
    ADD CONSTRAINT horarios_pkey PRIMARY KEY (id_horario);


--
-- TOC entry 4909 (class 2606 OID 114231)
-- Name: knex_migrations_lock knex_migrations_lock_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.knex_migrations_lock
    ADD CONSTRAINT knex_migrations_lock_pkey PRIMARY KEY (index);


--
-- TOC entry 4907 (class 2606 OID 114224)
-- Name: knex_migrations knex_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.knex_migrations
    ADD CONSTRAINT knex_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4976 (class 2606 OID 115970)
-- Name: logs logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs
    ADD CONSTRAINT logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4985 (class 2606 OID 116023)
-- Name: notification_recipients notification_recipients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_recipients
    ADD CONSTRAINT notification_recipients_pkey PRIMARY KEY (notification_id, user_id);


--
-- TOC entry 4983 (class 2606 OID 116007)
-- Name: notification_roles notification_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_roles
    ADD CONSTRAINT notification_roles_pkey PRIMARY KEY (notification_id, role_id);


--
-- TOC entry 4980 (class 2606 OID 115989)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 4928 (class 2606 OID 115800)
-- Name: pnfs pnfs_codigo_pnf_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pnfs
    ADD CONSTRAINT pnfs_codigo_pnf_unique UNIQUE (codigo_pnf);


--
-- TOC entry 4930 (class 2606 OID 115802)
-- Name: pnfs pnfs_nombre_pnf_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pnfs
    ADD CONSTRAINT pnfs_nombre_pnf_unique UNIQUE (nombre_pnf);


--
-- TOC entry 4932 (class 2606 OID 115798)
-- Name: pnfs pnfs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pnfs
    ADD CONSTRAINT pnfs_pkey PRIMARY KEY (id_pnf);


--
-- TOC entry 5014 (class 2606 OID 116154)
-- Name: post_grado post_grado_nombre_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_grado
    ADD CONSTRAINT post_grado_nombre_unique UNIQUE (nombre);


--
-- TOC entry 5016 (class 2606 OID 116152)
-- Name: post_grado post_grado_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_grado
    ADD CONSTRAINT post_grado_pkey PRIMARY KEY (id_post_grado);


--
-- TOC entry 5010 (class 2606 OID 116138)
-- Name: pre_grado pre_grado_nombre_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pre_grado
    ADD CONSTRAINT pre_grado_nombre_unique UNIQUE (nombre);


--
-- TOC entry 5012 (class 2606 OID 116136)
-- Name: pre_grado pre_grado_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pre_grado
    ADD CONSTRAINT pre_grado_pkey PRIMARY KEY (id_pre_grado);


--
-- TOC entry 5026 (class 2606 OID 116219)
-- Name: profesor_area_conocimiento profesor_area_conocimiento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesor_area_conocimiento
    ADD CONSTRAINT profesor_area_conocimiento_pkey PRIMARY KEY (id);


--
-- TOC entry 5028 (class 2606 OID 116231)
-- Name: profesor_area_conocimiento profesor_area_conocimiento_profesor_id_area_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesor_area_conocimiento
    ADD CONSTRAINT profesor_area_conocimiento_profesor_id_area_id_unique UNIQUE (profesor_id, area_id);


--
-- TOC entry 4953 (class 2606 OID 115885)
-- Name: profesores profesores_id_cedula_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesores
    ADD CONSTRAINT profesores_id_cedula_unique UNIQUE (id_cedula);


--
-- TOC entry 4955 (class 2606 OID 115878)
-- Name: profesores profesores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesores
    ADD CONSTRAINT profesores_pkey PRIMARY KEY (id_profesor);


--
-- TOC entry 4998 (class 2606 OID 116080)
-- Name: relacion_categoria_profesor relacion_categoria_profesor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.relacion_categoria_profesor
    ADD CONSTRAINT relacion_categoria_profesor_pkey PRIMARY KEY (id);


--
-- TOC entry 5000 (class 2606 OID 116099)
-- Name: relacion_dedicacion_profesor relacion_dedicacion_profesor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.relacion_dedicacion_profesor
    ADD CONSTRAINT relacion_dedicacion_profesor_pkey PRIMARY KEY (id);


--
-- TOC entry 5020 (class 2606 OID 116187)
-- Name: relacion_profesor_post_grado relacion_profesor_post_grado_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.relacion_profesor_post_grado
    ADD CONSTRAINT relacion_profesor_post_grado_pkey PRIMARY KEY (id_r_post_grado_profesor);


--
-- TOC entry 5018 (class 2606 OID 116168)
-- Name: relacion_profesor_pre_grado relacion_profesor_pre_grado_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.relacion_profesor_pre_grado
    ADD CONSTRAINT relacion_profesor_pre_grado_pkey PRIMARY KEY (id_r_pre_grado_profesor);


--
-- TOC entry 4945 (class 2606 OID 115852)
-- Name: roles roles_nombre_rol_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_nombre_rol_unique UNIQUE (nombre_rol);


--
-- TOC entry 4947 (class 2606 OID 115850)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id_rol);


--
-- TOC entry 4970 (class 2606 OID 115946)
-- Name: secciones secciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.secciones
    ADD CONSTRAINT secciones_pkey PRIMARY KEY (id_seccion);


--
-- TOC entry 4921 (class 2606 OID 115786)
-- Name: sedes sedes_nombre_sede_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sedes
    ADD CONSTRAINT sedes_nombre_sede_unique UNIQUE (nombre_sede);


--
-- TOC entry 4923 (class 2606 OID 115784)
-- Name: sedes sedes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sedes
    ADD CONSTRAINT sedes_pkey PRIMARY KEY (id_sede);


--
-- TOC entry 5030 (class 2606 OID 116244)
-- Name: tipos_de_aula tipos_de_aula_nombre_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_de_aula
    ADD CONSTRAINT tipos_de_aula_nombre_unique UNIQUE (nombre);


--
-- TOC entry 5032 (class 2606 OID 116242)
-- Name: tipos_de_aula tipos_de_aula_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_de_aula
    ADD CONSTRAINT tipos_de_aula_pkey PRIMARY KEY (id);


--
-- TOC entry 5006 (class 2606 OID 116127)
-- Name: tipos_post_grado tipos_post_grado_nombre_tipo_post_grado_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_post_grado
    ADD CONSTRAINT tipos_post_grado_nombre_tipo_post_grado_unique UNIQUE (nombre_tipo_post_grado);


--
-- TOC entry 5008 (class 2606 OID 116125)
-- Name: tipos_post_grado tipos_post_grado_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_post_grado
    ADD CONSTRAINT tipos_post_grado_pkey PRIMARY KEY (id_tipo_post_grado);


--
-- TOC entry 5002 (class 2606 OID 116118)
-- Name: tipos_pre_grado tipos_pre_grado_nombre_tipo_pre_grado_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_pre_grado
    ADD CONSTRAINT tipos_pre_grado_nombre_tipo_pre_grado_unique UNIQUE (nombre_tipo_pre_grado);


--
-- TOC entry 5004 (class 2606 OID 116116)
-- Name: tipos_pre_grado tipos_pre_grado_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_pre_grado
    ADD CONSTRAINT tipos_pre_grado_pkey PRIMARY KEY (id_tipo_pre_grado);


--
-- TOC entry 4936 (class 2606 OID 115820)
-- Name: trayectos trayectos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trayectos
    ADD CONSTRAINT trayectos_pkey PRIMARY KEY (id_trayecto);


--
-- TOC entry 4959 (class 2606 OID 115914)
-- Name: turnos turnos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.turnos
    ADD CONSTRAINT turnos_pkey PRIMARY KEY (id_turno);


--
-- TOC entry 4964 (class 2606 OID 115932)
-- Name: unidades_curriculares unidades_curriculares_codigo_unidad_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unidades_curriculares
    ADD CONSTRAINT unidades_curriculares_codigo_unidad_unique UNIQUE (codigo_unidad);


--
-- TOC entry 4966 (class 2606 OID 115925)
-- Name: unidades_curriculares unidades_curriculares_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unidades_curriculares
    ADD CONSTRAINT unidades_curriculares_pkey PRIMARY KEY (id_unidad_curricular);


--
-- TOC entry 4994 (class 2606 OID 116067)
-- Name: horarios uq_aula_horario; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios
    ADD CONSTRAINT uq_aula_horario UNIQUE (aula, dia_semana, hora_inicio, hora_fin);


--
-- TOC entry 4996 (class 2606 OID 116065)
-- Name: horarios uq_profesor_horario; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios
    ADD CONSTRAINT uq_profesor_horario UNIQUE (profesor_id, dia_semana, hora_inicio, hora_fin);


--
-- TOC entry 4972 (class 2606 OID 115960)
-- Name: secciones uq_seccion_trayecto; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.secciones
    ADD CONSTRAINT uq_seccion_trayecto UNIQUE (valor_seccion, id_trayecto);


--
-- TOC entry 4941 (class 2606 OID 115840)
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- TOC entry 4943 (class 2606 OID 115838)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (cedula);


--
-- TOC entry 4949 (class 2606 OID 115859)
-- Name: usuario_rol usuario_rol_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario_rol
    ADD CONSTRAINT usuario_rol_pkey PRIMARY KEY (usuario_id, rol_id);


--
-- TOC entry 4918 (class 1259 OID 115777)
-- Name: idx_categoria_nombre; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_categoria_nombre ON public.categorias USING btree (nombre_categoria);


--
-- TOC entry 4989 (class 1259 OID 116071)
-- Name: idx_horarios_dia_hora; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_horarios_dia_hora ON public.horarios USING btree (dia_semana, hora_inicio);


--
-- TOC entry 4990 (class 1259 OID 116069)
-- Name: idx_horarios_profesor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_horarios_profesor ON public.horarios USING btree (profesor_id);


--
-- TOC entry 4991 (class 1259 OID 116068)
-- Name: idx_horarios_seccion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_horarios_seccion ON public.horarios USING btree (seccion_id);


--
-- TOC entry 4992 (class 1259 OID 116070)
-- Name: idx_horarios_uc; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_horarios_uc ON public.horarios USING btree (unidad_curricular_id);


--
-- TOC entry 4973 (class 1259 OID 115976)
-- Name: idx_logs_event_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_logs_event_type ON public.logs USING btree (event_type);


--
-- TOC entry 4974 (class 1259 OID 115977)
-- Name: idx_logs_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_logs_user_id ON public.logs USING btree (user_id);


--
-- TOC entry 4924 (class 1259 OID 115808)
-- Name: idx_pnfs_codigo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pnfs_codigo ON public.pnfs USING btree (codigo_pnf);


--
-- TOC entry 4925 (class 1259 OID 115810)
-- Name: idx_pnfs_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pnfs_estado ON public.pnfs USING btree (activo);


--
-- TOC entry 4926 (class 1259 OID 115809)
-- Name: idx_pnfs_nombre; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pnfs_nombre ON public.pnfs USING btree (nombre_pnf);


--
-- TOC entry 4950 (class 1259 OID 115887)
-- Name: idx_profesores_antiguedad; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_profesores_antiguedad ON public.profesores USING btree (fecha_ingreso);


--
-- TOC entry 4951 (class 1259 OID 115886)
-- Name: idx_profesores_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_profesores_usuario ON public.profesores USING btree (id_cedula);


--
-- TOC entry 4967 (class 1259 OID 115957)
-- Name: idx_secciones_trayecto; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_secciones_trayecto ON public.secciones USING btree (id_trayecto);


--
-- TOC entry 4968 (class 1259 OID 115958)
-- Name: idx_secciones_valor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_secciones_valor ON public.secciones USING btree (valor_seccion);


--
-- TOC entry 4919 (class 1259 OID 115787)
-- Name: idx_sede_nombre; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sede_nombre ON public.sedes USING btree (nombre_sede);


--
-- TOC entry 4933 (class 1259 OID 115826)
-- Name: idx_trayectos_pnf; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trayectos_pnf ON public.trayectos USING btree (id_pnf);


--
-- TOC entry 4934 (class 1259 OID 115827)
-- Name: idx_trayectos_valor_pnf; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trayectos_valor_pnf ON public.trayectos USING btree (valor_trayecto, id_pnf);


--
-- TOC entry 4960 (class 1259 OID 115934)
-- Name: idx_uc_codigo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_uc_codigo ON public.unidades_curriculares USING btree (codigo_unidad);


--
-- TOC entry 4961 (class 1259 OID 115935)
-- Name: idx_uc_nombre; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_uc_nombre ON public.unidades_curriculares USING btree (nombre_unidad_curricular);


--
-- TOC entry 4962 (class 1259 OID 115933)
-- Name: idx_uc_trayecto; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_uc_trayecto ON public.unidades_curriculares USING btree (id_trayecto);


--
-- TOC entry 4937 (class 1259 OID 115843)
-- Name: idx_users_activo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_activo ON public.users USING btree (activo);


--
-- TOC entry 4938 (class 1259 OID 115841)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 4939 (class 1259 OID 115842)
-- Name: idx_users_nombre_completo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_nombre_completo ON public.users USING btree (nombres, apellidos);


--
-- TOC entry 4986 (class 1259 OID 116034)
-- Name: notification_recipients_user_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX notification_recipients_user_id_index ON public.notification_recipients USING btree (user_id);


--
-- TOC entry 4977 (class 1259 OID 116002)
-- Name: notifications_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX notifications_created_at_index ON public.notifications USING btree (created_at);


--
-- TOC entry 4978 (class 1259 OID 116001)
-- Name: notifications_is_mass_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX notifications_is_mass_index ON public.notifications USING btree (is_mass);


--
-- TOC entry 4981 (class 1259 OID 116000)
-- Name: notifications_user_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX notifications_user_id_index ON public.notifications USING btree (user_id);


--
-- TOC entry 5069 (class 2606 OID 116255)
-- Name: aulas aulas_id_sede_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aulas
    ADD CONSTRAINT aulas_id_sede_foreign FOREIGN KEY (id_sede) REFERENCES public.sedes(id_sede) ON DELETE CASCADE;


--
-- TOC entry 5070 (class 2606 OID 116260)
-- Name: aulas aulas_tipo_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aulas
    ADD CONSTRAINT aulas_tipo_id_foreign FOREIGN KEY (tipo_id) REFERENCES public.tipos_de_aula(id) ON DELETE RESTRICT;


--
-- TOC entry 5042 (class 2606 OID 115902)
-- Name: coordinadores coordinadores_id_pnf_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coordinadores
    ADD CONSTRAINT coordinadores_id_pnf_foreign FOREIGN KEY (id_pnf) REFERENCES public.pnfs(id_pnf);


--
-- TOC entry 5043 (class 2606 OID 115897)
-- Name: coordinadores coordinadores_id_profesor_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coordinadores
    ADD CONSTRAINT coordinadores_id_profesor_foreign FOREIGN KEY (id_profesor) REFERENCES public.profesores(id_profesor);


--
-- TOC entry 5054 (class 2606 OID 116054)
-- Name: horarios horarios_profesor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios
    ADD CONSTRAINT horarios_profesor_id_foreign FOREIGN KEY (profesor_id) REFERENCES public.profesores(id_profesor) ON DELETE RESTRICT;


--
-- TOC entry 5055 (class 2606 OID 116049)
-- Name: horarios horarios_seccion_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios
    ADD CONSTRAINT horarios_seccion_id_foreign FOREIGN KEY (seccion_id) REFERENCES public.secciones(id_seccion) ON DELETE CASCADE;


--
-- TOC entry 5056 (class 2606 OID 116059)
-- Name: horarios horarios_unidad_curricular_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios
    ADD CONSTRAINT horarios_unidad_curricular_id_foreign FOREIGN KEY (unidad_curricular_id) REFERENCES public.unidades_curriculares(id_unidad_curricular) ON DELETE RESTRICT;


--
-- TOC entry 5047 (class 2606 OID 115971)
-- Name: logs logs_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs
    ADD CONSTRAINT logs_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(cedula) ON DELETE SET NULL;


--
-- TOC entry 5052 (class 2606 OID 116024)
-- Name: notification_recipients notification_recipients_notification_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_recipients
    ADD CONSTRAINT notification_recipients_notification_id_foreign FOREIGN KEY (notification_id) REFERENCES public.notifications(id) ON DELETE CASCADE;


--
-- TOC entry 5053 (class 2606 OID 116029)
-- Name: notification_recipients notification_recipients_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_recipients
    ADD CONSTRAINT notification_recipients_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(cedula) ON DELETE CASCADE;


--
-- TOC entry 5050 (class 2606 OID 116008)
-- Name: notification_roles notification_roles_notification_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_roles
    ADD CONSTRAINT notification_roles_notification_id_foreign FOREIGN KEY (notification_id) REFERENCES public.notifications(id) ON DELETE CASCADE;


--
-- TOC entry 5051 (class 2606 OID 116013)
-- Name: notification_roles notification_roles_role_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_roles
    ADD CONSTRAINT notification_roles_role_id_foreign FOREIGN KEY (role_id) REFERENCES public.roles(id_rol) ON DELETE CASCADE;


--
-- TOC entry 5048 (class 2606 OID 115995)
-- Name: notifications notifications_mass_parent_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_mass_parent_id_foreign FOREIGN KEY (mass_parent_id) REFERENCES public.notifications(id);


--
-- TOC entry 5049 (class 2606 OID 115990)
-- Name: notifications notifications_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(cedula) ON DELETE CASCADE;


--
-- TOC entry 5037 (class 2606 OID 115803)
-- Name: pnfs pnfs_id_sede_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pnfs
    ADD CONSTRAINT pnfs_id_sede_foreign FOREIGN KEY (id_sede) REFERENCES public.sedes(id_sede);


--
-- TOC entry 5062 (class 2606 OID 116155)
-- Name: post_grado post_grado_tipo_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_grado
    ADD CONSTRAINT post_grado_tipo_id_foreign FOREIGN KEY (tipo_id) REFERENCES public.tipos_post_grado(id_tipo_post_grado) ON DELETE RESTRICT;


--
-- TOC entry 5061 (class 2606 OID 116139)
-- Name: pre_grado pre_grado_tipo_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pre_grado
    ADD CONSTRAINT pre_grado_tipo_id_foreign FOREIGN KEY (tipo_id) REFERENCES public.tipos_pre_grado(id_tipo_pre_grado) ON DELETE RESTRICT;


--
-- TOC entry 5067 (class 2606 OID 116225)
-- Name: profesor_area_conocimiento profesor_area_conocimiento_area_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesor_area_conocimiento
    ADD CONSTRAINT profesor_area_conocimiento_area_id_foreign FOREIGN KEY (area_id) REFERENCES public.areas_de_conocimiento(id) ON DELETE CASCADE;


--
-- TOC entry 5068 (class 2606 OID 116220)
-- Name: profesor_area_conocimiento profesor_area_conocimiento_profesor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesor_area_conocimiento
    ADD CONSTRAINT profesor_area_conocimiento_profesor_id_foreign FOREIGN KEY (profesor_id) REFERENCES public.profesores(id_profesor) ON DELETE CASCADE;


--
-- TOC entry 5041 (class 2606 OID 115879)
-- Name: profesores profesores_id_cedula_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesores
    ADD CONSTRAINT profesores_id_cedula_foreign FOREIGN KEY (id_cedula) REFERENCES public.users(cedula) ON DELETE CASCADE;


--
-- TOC entry 5057 (class 2606 OID 116086)
-- Name: relacion_categoria_profesor relacion_categoria_profesor_categoria_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.relacion_categoria_profesor
    ADD CONSTRAINT relacion_categoria_profesor_categoria_id_foreign FOREIGN KEY (categoria_id) REFERENCES public.categorias(id_categoria) ON DELETE RESTRICT;


--
-- TOC entry 5058 (class 2606 OID 116081)
-- Name: relacion_categoria_profesor relacion_categoria_profesor_profesor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.relacion_categoria_profesor
    ADD CONSTRAINT relacion_categoria_profesor_profesor_id_foreign FOREIGN KEY (profesor_id) REFERENCES public.profesores(id_profesor) ON DELETE CASCADE;


--
-- TOC entry 5059 (class 2606 OID 116105)
-- Name: relacion_dedicacion_profesor relacion_dedicacion_profesor_dedicacion_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.relacion_dedicacion_profesor
    ADD CONSTRAINT relacion_dedicacion_profesor_dedicacion_id_foreign FOREIGN KEY (dedicacion_id) REFERENCES public.dedicaciones(id_dedicacion) ON DELETE RESTRICT;


--
-- TOC entry 5060 (class 2606 OID 116100)
-- Name: relacion_dedicacion_profesor relacion_dedicacion_profesor_profesor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.relacion_dedicacion_profesor
    ADD CONSTRAINT relacion_dedicacion_profesor_profesor_id_foreign FOREIGN KEY (profesor_id) REFERENCES public.profesores(id_profesor) ON DELETE CASCADE;


--
-- TOC entry 5065 (class 2606 OID 116193)
-- Name: relacion_profesor_post_grado relacion_profesor_post_grado_post_grado_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.relacion_profesor_post_grado
    ADD CONSTRAINT relacion_profesor_post_grado_post_grado_id_foreign FOREIGN KEY (post_grado_id) REFERENCES public.post_grado(id_post_grado) ON DELETE CASCADE;


--
-- TOC entry 5066 (class 2606 OID 116188)
-- Name: relacion_profesor_post_grado relacion_profesor_post_grado_profesor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.relacion_profesor_post_grado
    ADD CONSTRAINT relacion_profesor_post_grado_profesor_id_foreign FOREIGN KEY (profesor_id) REFERENCES public.profesores(id_profesor) ON DELETE CASCADE;


--
-- TOC entry 5063 (class 2606 OID 116174)
-- Name: relacion_profesor_pre_grado relacion_profesor_pre_grado_pre_grado_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.relacion_profesor_pre_grado
    ADD CONSTRAINT relacion_profesor_pre_grado_pre_grado_id_foreign FOREIGN KEY (pre_grado_id) REFERENCES public.pre_grado(id_pre_grado) ON DELETE CASCADE;


--
-- TOC entry 5064 (class 2606 OID 116169)
-- Name: relacion_profesor_pre_grado relacion_profesor_pre_grado_profesor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.relacion_profesor_pre_grado
    ADD CONSTRAINT relacion_profesor_pre_grado_profesor_id_foreign FOREIGN KEY (profesor_id) REFERENCES public.profesores(id_profesor) ON DELETE CASCADE;


--
-- TOC entry 5045 (class 2606 OID 115947)
-- Name: secciones secciones_id_trayecto_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.secciones
    ADD CONSTRAINT secciones_id_trayecto_foreign FOREIGN KEY (id_trayecto) REFERENCES public.trayectos(id_trayecto) ON DELETE CASCADE;


--
-- TOC entry 5046 (class 2606 OID 115952)
-- Name: secciones secciones_id_turno_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.secciones
    ADD CONSTRAINT secciones_id_turno_foreign FOREIGN KEY (id_turno) REFERENCES public.turnos(id_turno) ON DELETE CASCADE;


--
-- TOC entry 5038 (class 2606 OID 115821)
-- Name: trayectos trayectos_id_pnf_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trayectos
    ADD CONSTRAINT trayectos_id_pnf_foreign FOREIGN KEY (id_pnf) REFERENCES public.pnfs(id_pnf) ON DELETE CASCADE;


--
-- TOC entry 5044 (class 2606 OID 115926)
-- Name: unidades_curriculares unidades_curriculares_id_trayecto_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unidades_curriculares
    ADD CONSTRAINT unidades_curriculares_id_trayecto_foreign FOREIGN KEY (id_trayecto) REFERENCES public.trayectos(id_trayecto) ON DELETE CASCADE;


--
-- TOC entry 5039 (class 2606 OID 115865)
-- Name: usuario_rol usuario_rol_rol_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario_rol
    ADD CONSTRAINT usuario_rol_rol_id_foreign FOREIGN KEY (rol_id) REFERENCES public.roles(id_rol) ON DELETE CASCADE;


--
-- TOC entry 5040 (class 2606 OID 115860)
-- Name: usuario_rol usuario_rol_usuario_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario_rol
    ADD CONSTRAINT usuario_rol_usuario_id_foreign FOREIGN KEY (usuario_id) REFERENCES public.users(cedula) ON DELETE CASCADE;


-- Completed on 2025-07-11 09:29:43

--
-- PostgreSQL database dump complete
--

