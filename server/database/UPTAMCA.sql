--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2025-06-10 07:43:41

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
-- TOC entry 257 (class 1255 OID 40223)
-- Name: actualizar_poblacion_pnf(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.actualizar_poblacion_pnf() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE 
    v_total_estudiantes INTEGER;
BEGIN
    -- Verificar si la población estudiantil cambió
    IF NEW.poblacion_estudiantil IS DISTINCT FROM OLD.poblacion_estudiantil THEN 
        -- Calcular la suma total de estudiantes para este PNF
        SELECT SUM(poblacion_estudiantil) INTO v_total_estudiantes
        FROM trayectos
        WHERE id_pnf = NEW.id_pnf;
        
        -- Actualizar la población en el PNF
        UPDATE pnfs 
        SET poblacion_estudiantil_pnf = v_total_estudiantes,
            updated_at = CURRENT_TIMESTAMP
        WHERE id_pnf = NEW.id_pnf;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.actualizar_poblacion_pnf() OWNER TO postgres;

--
-- TOC entry 266 (class 1255 OID 40216)
-- Name: actualizar_secciones_por_poblacion(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.actualizar_secciones_por_poblacion() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_resultado JSONB;
BEGIN
    -- Verificar si la población estudiantil cambió
    IF NEW.poblacion_estudiantil IS DISTINCT FROM OLD.poblacion_estudiantil THEN
        -- Llamar al procedimiento de distribución para este trayecto
        CALL public.distribuir_estudiantes_secciones(
            p_id_trayecto := NEW.id_trayecto,
            p_total_estudiantes := NEW.poblacion_estudiantil,
            p_resultado := v_resultado
        );
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.actualizar_secciones_por_poblacion() OWNER TO postgres;

--
-- TOC entry 268 (class 1255 OID 41036)
-- Name: actualizar_turno_seccion(character varying, integer, json); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.actualizar_turno_seccion(p_turno character varying, p_id_seccion integer, INOUT p_resultado json) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    V_EXISTE_SECCION BOOLEAN;
    V_TURNO_VALIDO BOOLEAN;
BEGIN 
    -- Verificar si la sección existe
    SELECT EXISTS(SELECT 1 FROM SECCIONES WHERE ID_SECCION = P_ID_SECCION) INTO V_EXISTE_SECCION;
    
    -- Verificar si el turno es válido
    V_TURNO_VALIDO := (P_TURNO IN ('matutino', 'vespertino', 'nocturno'));
    
    IF NOT V_EXISTE_SECCION THEN
        P_RESULTADO := json_build_object(
            'estado', 'error',
            'mensaje', 'La sección especificada no existe',
            'codigo', 404
        );
    ELSIF NOT V_TURNO_VALIDO THEN
        P_RESULTADO := json_build_object(
            'estado', 'error',
            'mensaje', 'Turno no válido. Debe ser: matutino, vespertino o nocturno',
            'codigo', 400
        );
    ELSE
        -- Actualizar el turno de la sección
        UPDATE SECCIONES 
        SET TURNO = P_TURNO 
        WHERE ID_SECCION = P_ID_SECCION;
        
        -- Verificar si se actualizó correctamente
        IF FOUND THEN
            P_RESULTADO := json_build_object(
                'estado', 'éxito',
                'mensaje', 'Turno actualizado correctamente',
                'codigo', 200,
                'datos', json_build_object(
                    'id_seccion', P_ID_SECCION,
                    'nuevo_turno', P_TURNO
                )
            );
        ELSE
            P_RESULTADO := json_build_object(
                'estado', 'error',
                'mensaje', 'No se pudo actualizar el turno',
                'codigo', 500
            );
        END IF;
    END IF;
    
    RETURN;
END;
$$;


ALTER FUNCTION public.actualizar_turno_seccion(p_turno character varying, p_id_seccion integer, INOUT p_resultado json) OWNER TO postgres;

--
-- TOC entry 262 (class 1255 OID 39045)
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
            dedicacion d ON p.id_dedicacion = d.id_dedicacion  -- JOIN para obtener nombre
        LEFT JOIN 
            categoria c ON p.id_categoria = c.id_categoria     -- JOIN para obtener nombre
        LEFT JOIN 
            ubicacion ub ON p.id_ubicacion = ub.id_ubicacion  -- JOIN para obtener nombre
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
-- TOC entry 264 (class 1255 OID 40212)
-- Name: distribuir_estudiantes_secciones(bigint, integer, jsonb); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.distribuir_estudiantes_secciones(IN p_id_trayecto bigint, IN p_total_estudiantes integer, INOUT p_resultado jsonb DEFAULT NULL::jsonb)
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
	seccion_record RECORD;  -- Variable de tipo RECORD para el bucle
BEGIN
    -- Validación de parámetros
    IF p_total_estudiantes <= 0 THEN
        p_resultado := jsonb_build_object(
            'estado', 'error',
            'mensaje', 'El total de estudiantes debe ser mayor a cero'
        );
        RETURN;
    END IF;

    -- Verificar existencia del trayecto
    IF NOT EXISTS (SELECT 1 FROM trayectos WHERE id_trayecto = p_id_trayecto) THEN
        p_resultado := jsonb_build_object(
            'estado', 'error',
            'mensaje', 'El trayecto especificado no existe'
        );
        RETURN;
    END IF;

    -- Calcular la mejor cantidad de secciones automáticamente
    v_cantidad_secciones := CEIL(p_total_estudiantes::numeric / v_maximo_estudiantes);
    
    -- Buscar la distribución óptima (empezando desde el máximo hacia abajo)
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
    
    -- Recalcular cantidad de secciones basada en la mejor distribución
    v_cantidad_secciones := CEIL(p_total_estudiantes::numeric / v_mejor_distribucion);
    v_estudiantes_por_seccion := p_total_estudiantes / v_cantidad_secciones;
    v_resto_estudiantes := p_total_estudiantes % v_cantidad_secciones;

    -- Obtener cantidad actual de secciones
    SELECT COUNT(*) INTO v_secciones_actuales 
    FROM secciones 
    WHERE id_trayecto = p_id_trayecto;
	
    -- Eliminar secciones sobrantes (si existen)
    IF v_secciones_actuales > v_cantidad_secciones THEN
        DELETE FROM secciones
        WHERE id_seccion IN (
            SELECT id_seccion FROM secciones 
            WHERE id_trayecto = p_id_trayecto
            ORDER BY id_seccion DESC 
            LIMIT (v_secciones_actuales - v_cantidad_secciones)
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
    
    -- Crear nuevas secciones si faltan
    IF v_secciones_actuales < v_cantidad_secciones THEN
        FOR v_contador IN 1..(v_cantidad_secciones - v_secciones_actuales) LOOP
            v_valor_seccion := 'Sección ' || (v_secciones_actuales + v_contador);
            
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
    END IF;
    
    -- Retornar resultado con detalles de la distribución
    p_resultado := jsonb_build_object(
        'estado', 'éxito',
        'mensaje', 'Distribución de estudiantes completada',
        'detalles', jsonb_build_object(
            'total_estudiantes', p_total_estudiantes,
            'secciones_creadas', v_cantidad_secciones - v_secciones_actuales,
            'secciones_actualizadas', LEAST(v_secciones_actuales, v_cantidad_secciones),
            'estudiantes_por_seccion', v_estudiantes_por_seccion,
            'secciones_con_extra', v_resto_estudiantes,
            'rango_aceptable', format('%s-%s estudiantes', v_minimo_estudiantes, v_maximo_estudiantes)
        )
    );

EXCEPTION
    WHEN OTHERS THEN
        p_resultado := jsonb_build_object(
            'estado', 'error',
            'mensaje', 'Error al distribuir estudiantes: ' || SQLERRM,
            'codigo_error', SQLSTATE
        );
END;
$$;


ALTER PROCEDURE public.distribuir_estudiantes_secciones(IN p_id_trayecto bigint, IN p_total_estudiantes integer, INOUT p_resultado jsonb) OWNER TO postgres;

--
-- TOC entry 256 (class 1255 OID 38777)
-- Name: filtrar_horarios(integer, text, text, text, text, boolean); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.filtrar_horarios(p_profesor_id integer DEFAULT NULL::integer, p_trayecto text DEFAULT NULL::text, p_pnf text DEFAULT NULL::text, p_unidad_curricular text DEFAULT NULL::text, p_dia_semana text DEFAULT NULL::text, p_refrescar boolean DEFAULT false) RETURNS TABLE(profesor_nombres text, profesor_apellidos text, nombre_pnf text, trayecto text, seccion text, hora_inicio time without time zone, dia_semana text, aula text, nombre_unidad_curricular text)
    LANGUAGE plpgsql
    AS $$
BEGIN

    RETURN QUERY
    SELECT 
        vhc.profesor_nombres::TEXT,
        vhc.profesor_apellidos::TEXT,
        vhc.nombre_pnf::TEXT,
        vhc.trayecto::TEXT,
        vhc.seccion::TEXT,
        vhc.hora_inicio,
        vhc.dia_semana::TEXT,
        vhc.aula::TEXT,
        vhc.nombre_unidad_curricular::TEXT
    FROM vista_horarios_completos vhc
    WHERE 
        (p_profesor_id IS NULL OR vhc.profesor_id = p_profesor_id) AND
        (p_trayecto IS NULL OR vhc.trayecto = p_trayecto) AND
        (p_pnf IS NULL OR vhc.nombre_pnf = p_pnf) AND
        (p_unidad_curricular IS NULL OR vhc.nombre_unidad_curricular = p_unidad_curricular) AND
        (p_dia_semana IS NULL OR vhc.dia_semana = p_dia_semana)
    ORDER BY 
        vhc.profesor_apellidos, 
        vhc.profesor_nombres,
        vhc.dia_semana,
        vhc.hora_inicio;
END;
$$;


ALTER FUNCTION public.filtrar_horarios(p_profesor_id integer, p_trayecto text, p_pnf text, p_unidad_curricular text, p_dia_semana text, p_refrescar boolean) OWNER TO postgres;

--
-- TOC entry 270 (class 1255 OID 44410)
-- Name: mostrar_profesor(character varying, character varying, character varying, character varying, date, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

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
            users u ON p.id_cedula = u.cedula
        LEFT JOIN 
            dedicacion d ON p.id_dedicacion = d.id_dedicacion
        LEFT JOIN 
            categoria c ON p.id_categoria = c.id_categoria
        LEFT JOIN 
            ubicacion ub ON p.id_ubicacion = ub.id_ubicacion
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


ALTER FUNCTION public.mostrar_profesor(p_nombre_dedicacion character varying, p_nombre_categoria character varying, p_nombre_ubicacion character varying, p_area_de_conocimiento character varying, p_fecha_ingreso date, p_genero character varying) OWNER TO postgres;

--
-- TOC entry 258 (class 1255 OID 38780)
-- Name: mostrar_usuarios(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.mostrar_usuarios(p_email character varying) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_roles TEXT[];
    v_usuario JSON;
    v_id_usuario INTEGER;
    v_nombre_rol TEXT;
BEGIN 
    -- Obtener información básica del usuario
    SELECT cedula INTO v_id_usuario
    FROM users 
    WHERE email = p_email;
    
    IF v_id_usuario IS NULL THEN
        RETURN json_build_object('status', 'error', 'message', 'Usuario no encontrado');
    END IF;
    
    -- Construir array de roles verificando todas las tablas relevantes
    v_roles := ARRAY[]::TEXT[];
    
    -- Verificar si es profesor
    IF EXISTS(SELECT 1 FROM profesores WHERE id_cedula = v_id_usuario) THEN
        v_roles := array_append(v_roles, 'Profesor');
    END IF;
    
    -- Verificar si es coordinador
    IF EXISTS(SELECT 1 FROM coordinadores WHERE id_cedula = v_id_usuario) THEN
        v_roles := array_append(v_roles, 'Coordinador');
    END IF;
    
    -- Verificar si es administrador y obtener el nombre del rol específico
    IF EXISTS(SELECT 1 FROM administradores WHERE id_cedula = v_id_usuario) THEN
        SELECT r.nombre_rol INTO v_nombre_rol
        FROM administradores a
        JOIN roles r ON a.id_rol = r.id_rol
        WHERE a.id_cedula = v_id_usuario;
        
        v_roles := array_append(v_roles, v_nombre_rol);
    END IF;
    
    -- Construir el objeto usuario con todos los datos incluyendo roles
    SELECT json_build_object(
        'id', cedula,
        'nombres', nombres,
        'apellidos', apellidos,
        'email', email,
        'password', password,
        'roles', v_roles  -- Aquí incluimos los roles dentro del objeto usuario
    ) INTO v_usuario
    FROM users 
    WHERE cedula = v_id_usuario;
    
    -- Retornar resultado
    RETURN json_build_object(
        'status', 'success',
        'usuario', v_usuario  -- Ahora usuario contiene todos los datos incluyendo roles
    );
END;
$$;


ALTER FUNCTION public.mostrar_usuarios(p_email character varying) OWNER TO postgres;

--
-- TOC entry 259 (class 1255 OID 38781)
-- Name: registrar_administrador(bigint, bigint); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.registrar_administrador(IN p_id_cedula bigint, IN p_id_rol bigint, OUT p_resultado json)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_usuario_existe BOOLEAN;
    v_ya_es_administrador BOOLEAN;
    v_error_message TEXT;
    v_error_context TEXT;
    v_error_detail TEXT;
BEGIN
    -- Iniciar bloque con manejo de excepciones
    BEGIN
        -- Verificar si el usuario existe
        SELECT EXISTS(SELECT 1 FROM users WHERE cedula = p_id_cedula) INTO v_usuario_existe;
        
        IF NOT v_usuario_existe THEN
            RAISE EXCEPTION 'El usuario con ID % no existe', p_id_cedula;
        END IF;
        
        -- Verificar si el usuario ya es administrador
        SELECT EXISTS(SELECT 1 FROM administradores WHERE id_cedula = p_id_cedula) INTO v_ya_es_administrador;
        
        IF v_ya_es_administrador THEN
            RAISE EXCEPTION 'El usuario con ID % ya es administrador', p_id_cedula;
        END IF;
        
        -- Verificar que el rol exista
        IF NOT EXISTS(SELECT 1 FROM roles WHERE id_rol = p_id_rol) THEN
            RAISE EXCEPTION 'El rol con ID % no existe', p_id_rol;
        END IF;
        
        -- Insertar el nuevo administrador
        INSERT INTO administradores (id_cedula, id_rol, created_at, updated_at)
        VALUES (p_id_cedula, p_id_rol, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        
        p_resultado := json_build_object(
            'status', 'success',
            'message', 'Administrador registrado exitosamente'
        );
        
    EXCEPTION
        WHEN OTHERS THEN
            -- Obtener detalles del error
            GET STACKED DIAGNOSTICS 
                v_error_message = MESSAGE_TEXT;
            p_resultado := json_build_object(
                'status', 'error',
                'message', v_error_message
            );
    END;
END;
$$;


ALTER PROCEDURE public.registrar_administrador(IN p_id_cedula bigint, IN p_id_rol bigint, OUT p_resultado json) OWNER TO postgres;

--
-- TOC entry 265 (class 1255 OID 40252)
-- Name: registrar_coordinador(bigint, smallint, smallint, json); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.registrar_coordinador(IN p_id_cedula bigint, IN p_id_ubicacion smallint, IN p_id_pnf smallint, INOUT p_resultado json DEFAULT NULL::json)
    LANGUAGE plpgsql
    AS $$
DECLARE 
    v_existe_pnf boolean;
    v_existe_ubicacion boolean;
    v_existe_persona boolean;
    v_coordinador_existente boolean;
BEGIN
    -- Validar que el PNF existe
    SELECT EXISTS(SELECT 1 FROM pnfs WHERE id_pnf = p_id_pnf) INTO v_existe_pnf;
    IF NOT v_existe_pnf THEN
        p_resultado := json_build_object(
            'estado', 'error',
            'mensaje', 'El PNF especificado no existe'
        );
        RETURN;
    END IF;

    -- Validar que la ubicación existe
    SELECT EXISTS(SELECT 1 FROM ubicacion WHERE id_ubicacion = p_id_ubicacion) INTO v_existe_ubicacion;
    IF NOT v_existe_ubicacion THEN
        p_resultado := json_build_object(
            'estado', 'error',
            'mensaje', 'La ubicación especificada no existe'
        );
        RETURN;
    END IF;

    -- Validar que la persona existe
    SELECT EXISTS(SELECT 1 FROM users WHERE cedula = p_id_cedula) INTO v_existe_persona;
    IF NOT v_existe_persona THEN
        p_resultado := json_build_object(
            'estado', 'error',
            'mensaje', 'La persona especificada no existe'
        );
        RETURN;
    END IF;

    -- Verificar si ya es coordinador
    SELECT EXISTS(SELECT 1 FROM coordinadores WHERE id_cedula = p_id_cedula) INTO v_coordinador_existente;
    IF v_coordinador_existente THEN
        p_resultado := json_build_object(
            'estado', 'error',
            'mensaje', 'Esta persona ya está registrada como coordinador'
        );
        RETURN;
    END IF;

    -- Insertar el nuevo coordinador
    BEGIN
        INSERT INTO coordinadores (
            id_cedula,
            id_ubicacion,
            id_pnf,
            created_at,
            updated_at
        ) VALUES (
            p_id_cedula,
            p_id_ubicacion,
            p_id_pnf,
            CURRENT_DATE,
            CURRENT_DATE
		);
		
        -- Éxito
        p_resultado := json_build_object(
            'estado', 'éxito',
            'mensaje', 'Coordinador registrado correctamente'
			);
    EXCEPTION WHEN OTHERS THEN
        p_resultado := json_build_object(
            'estado', 'error',
            'mensaje', 'Error al registrar coordinador: ' || SQLERRM,
            'codigo_error', SQLSTATE
        );
    END;
END;
$$;


ALTER PROCEDURE public.registrar_coordinador(IN p_id_cedula bigint, IN p_id_ubicacion smallint, IN p_id_pnf smallint, INOUT p_resultado json) OWNER TO postgres;

--
-- TOC entry 263 (class 1255 OID 40231)
-- Name: registrar_horario(bigint, bigint, bigint, character varying, time without time zone, time without time zone, character varying, boolean, jsonb); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.registrar_horario(IN p_id_seccion bigint, IN p_id_profesor bigint, IN p_unidad_curricular_id bigint, IN p_dia_semana character varying, IN p_hora_inicio time without time zone, IN p_hora_fin time without time zone DEFAULT NULL::time without time zone, IN p_aula character varying DEFAULT NULL::character varying, IN p_activo boolean DEFAULT true, INOUT p_resultado jsonb DEFAULT NULL::jsonb)
    LANGUAGE plpgsql
    AS $$

DECLARE 
    v_id_horario BIGINT;
    v_conflictos INT;
    v_carga_horas INTEGER;
    v_hora_fin_calculada TIME;
    v_horas_disponibles_docencia INTERVAL;
    v_horas_asignadas INTERVAL;
    v_horas_nuevas INTERVAL;
    v_dedicacion_id INTEGER;
BEGIN
    -- Validación básica de datos de entrada
    IF p_dia_semana NOT IN ('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado') THEN
        p_resultado := jsonb_build_object(
            'estado', 'error',
            'mensaje', 'Día de la semana no válido'
        );
        RETURN;
    END IF;

    -- Obtener carga horaria de la unidad curricular
    SELECT horas_clase INTO v_carga_horas 
    FROM unidades_curriculares 
    WHERE id_unidad_curricular = p_unidad_curricular_id;
    
    IF v_carga_horas IS NULL THEN
        p_resultado := jsonb_build_object(
            'estado', 'error',
            'mensaje', 'No se pudo determinar la carga horaria de la unidad curricular'
        );
        RETURN;
    END IF;

    -- Calcular hora de fin si no se proporciona (asumiendo horas académicas de 45 minutos)
    IF p_hora_fin IS NULL THEN
        v_hora_fin_calculada := p_hora_inicio + (v_carga_horas * INTERVAL '45 minutes');
    ELSE
        v_hora_fin_calculada := p_hora_fin;
    END IF;

    -- Validar que la hora de inicio sea anterior a la de fin
    IF p_hora_inicio >= v_hora_fin_calculada THEN
        p_resultado := jsonb_build_object(
            'estado', 'error',
            'mensaje', 'La hora de inicio debe ser anterior a la hora de fin',
            'hora_inicio', p_hora_inicio,
            'hora_fin_calculada', v_hora_fin_calculada
        );
        RETURN;
    END IF;

    -- Verificar existencia de referencias
    IF NOT EXISTS (SELECT 1 FROM secciones WHERE id_seccion = p_id_seccion) THEN
        p_resultado := jsonb_build_object(
            'estado', 'error',
            'mensaje', 'La sección especificada no existe'
        );
        RETURN;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM profesores WHERE id_profesor = p_id_profesor) THEN
        p_resultado := jsonb_build_object(
            'estado', 'error',
            'mensaje', 'El profesor especificado no existe'
        );
        RETURN;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM unidades_curriculares WHERE id_unidad_curricular = p_unidad_curricular_id) THEN
        p_resultado := jsonb_build_object(
            'estado', 'error',
            'mensaje', 'La unidad curricular especificada no existe'
        );
        RETURN;
    END IF;

    -- Obtener dedicación del profesor
    SELECT id_dedicacion INTO v_dedicacion_id FROM profesores WHERE id_profesor = p_id_profesor;
    
    IF v_dedicacion_id IS NULL THEN
        p_resultado := jsonb_build_object(
            'estado', 'error',
            'mensaje', 'El profesor no tiene una dedicación asignada'
        );
        RETURN;
    END IF;

    -- Obtener horas disponibles de docencia según dedicación
    SELECT horas_docencia_semanales INTO v_horas_disponibles_docencia
    FROM dedicacion
    WHERE id_dedicacion = v_dedicacion_id;

    -- Calcular horas ya asignadas al profesor esta semana
    SELECT COALESCE(SUM(hora_fin - hora_inicio), '0 hours'::INTERVAL) INTO v_horas_asignadas
    FROM horarios
    WHERE profesor_id = p_id_profesor
    AND activo = TRUE;

    -- Calcular horas que se agregarían con este nuevo horario
    v_horas_nuevas := (v_hora_fin_calculada - p_hora_inicio);

    -- Verificar si excede la dedicación
    IF (v_horas_asignadas + v_horas_nuevas) > v_horas_disponibles_docencia THEN
        p_resultado := jsonb_build_object(
            'estado', 'error',
            'mensaje', 'El profesor no tiene horas disponibles en su dedicación para asumir este horario',
            'horas_disponibles', v_horas_disponibles_docencia,
            'horas_asignadas', v_horas_asignadas,
            'horas_nuevas', v_horas_nuevas,
            'total_proyectado', v_horas_asignadas + v_horas_nuevas
        );
        RETURN;
    END IF;

    -- Verificar conflictos de horario para el profesor
    SELECT COUNT(*) INTO v_conflictos 
    FROM horarios 
    WHERE profesor_id = p_id_profesor 
      AND dia_semana = p_dia_semana 
      AND (
          (p_hora_inicio BETWEEN hora_inicio AND hora_fin) OR
          (v_hora_fin_calculada BETWEEN hora_inicio AND hora_fin) OR
          (hora_inicio BETWEEN p_hora_inicio AND v_hora_fin_calculada)
      )
      AND activo = TRUE;

    IF v_conflictos > 0 THEN
        p_resultado := jsonb_build_object(
            'estado', 'error',
            'mensaje', 'El profesor tiene un conflicto de horario en ese intervalo',
            'conflictos', v_conflictos
        );
        RETURN;
    END IF;

    -- Verificar conflictos de horario para la sección
    SELECT COUNT(*) INTO v_conflictos 
    FROM horarios
    WHERE seccion_id = p_id_seccion 
      AND dia_semana = p_dia_semana 
      AND (
          (p_hora_inicio BETWEEN hora_inicio AND hora_fin) OR
          (v_hora_fin_calculada BETWEEN hora_inicio AND hora_fin) OR
          (hora_inicio BETWEEN p_hora_inicio AND v_hora_fin_calculada)
      )
      AND activo = TRUE;

    IF v_conflictos > 0 THEN
        p_resultado := jsonb_build_object(
            'estado', 'error',
            'mensaje', 'La sección tiene un conflicto de horario en ese intervalo',
            'conflictos', v_conflictos
        );
        RETURN;
    END IF;
	
    -- Insertar el registro
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
        v_hora_fin_calculada,
        p_aula,
        p_activo
    ) RETURNING id_horario INTO v_id_horario;

    -- Retornar resultado exitoso
    p_resultado := jsonb_build_object(
        'estado', 'éxito',
        'mensaje', 'Horario registrado correctamente',
        'id_horario', v_id_horario,
        'horas_disponibles_restantes', v_horas_disponibles_docencia - (v_horas_asignadas + v_horas_nuevas)
    );

EXCEPTION
    WHEN unique_violation THEN
        p_resultado := jsonb_build_object(
            'estado', 'error',
            'mensaje', 'Ya existe un horario idéntico para esta sección'
        );
    WHEN foreign_key_violation THEN
        p_resultado := jsonb_build_object(
            'estado', 'error',
            'mensaje', 'Violación de clave foránea - verifique las referencias'
        );
    WHEN OTHERS THEN
        p_resultado := jsonb_build_object(
            'estado', 'error',
            'mensaje', SQLERRM,
            'codigo_error', SQLSTATE
        );
END;
$$;


ALTER PROCEDURE public.registrar_horario(IN p_id_seccion bigint, IN p_id_profesor bigint, IN p_unidad_curricular_id bigint, IN p_dia_semana character varying, IN p_hora_inicio time without time zone, IN p_hora_fin time without time zone, IN p_aula character varying, IN p_activo boolean, INOUT p_resultado jsonb) OWNER TO postgres;

--
-- TOC entry 267 (class 1255 OID 39905)
-- Name: registrar_pnf(character varying, character varying, integer, character varying, json); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.registrar_pnf(IN p_nombre_pnf character varying, IN p_descripcion_pnf character varying, IN p_poblacion integer, IN p_codigo_pnf character varying, INOUT p_resultado json DEFAULT NULL::json)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_existe_codigo BOOLEAN;
    v_existe_nombre BOOLEAN;
    nuevo_pnf BIGINT;
BEGIN
    -- Verificar si el código ya existe
    SELECT EXISTS(SELECT 1 FROM pnfs WHERE codigo_pnf = p_codigo_pnf) INTO v_existe_codigo;
    
    -- Verificar si el nombre ya existe
    SELECT EXISTS(SELECT 1 FROM pnfs WHERE nombre_pnf = p_nombre_pnf) INTO v_existe_nombre;
    
    -- Validaciones
    IF v_existe_codigo THEN
        p_resultado := json_build_object(
            'status', 'error',
            'message', 'El código PNF ya está registrado'
        );
        RETURN;
    ELSIF v_existe_nombre THEN
        p_resultado := json_build_object(
            'status', 'error',
            'message', 'El nombre PNF ya está registrado'
        );
        RETURN;
    END IF;
    
    -- Insertar el nuevo PNF
    BEGIN
        INSERT INTO pnfs (
            nombre_pnf,
            descripcion_pnf,
            poblacion_estudiantil_pnf,
            codigo_pnf,
            created_at,
            updated_at
        ) VALUES (
            p_nombre_pnf,
            p_descripcion_pnf,
            p_poblacion,
            p_codigo_pnf,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        ) RETURNING id_pnf INTO nuevo_pnf;

        -- Insertar los trayectos asociados
        INSERT INTO trayectos (
            valor_trayecto, 
            id_pnf,  
            created_at, 
            updated_at
        ) VALUES 
            ('1', nuevo_pnf, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
            ('2', nuevo_pnf, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
            ('3', nuevo_pnf, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
            ('4', nuevo_pnf, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        
        -- Respuesta exitosa
        p_resultado := json_build_object(
            'status', 'success',
            'message', 'PNF registrado exitosamente con sus 4 trayectos',
            'id_pnf', nuevo_pnf
        );
        
    EXCEPTION WHEN OTHERS THEN
        -- Capturar error en la operación
        p_resultado := json_build_object(
            'status', 'error',
            'message', 'Error al registrar el PNF: ' || SQLERRM,
            'sqlstate', SQLSTATE
        );
    END;
END;
$$;


ALTER PROCEDURE public.registrar_pnf(IN p_nombre_pnf character varying, IN p_descripcion_pnf character varying, IN p_poblacion integer, IN p_codigo_pnf character varying, INOUT p_resultado json) OWNER TO postgres;

--
-- TOC entry 261 (class 1255 OID 38785)
-- Name: registrar_profesor(bigint, character varying, character varying, character varying, character varying, character varying, character varying, date); Type: PROCEDURE; Schema: public; Owner: postgres
--

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
        SELECT EXISTS(SELECT 1 FROM users WHERE cedula = p_id_cedula) INTO v_user_exists;
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
        SELECT id_categoria INTO v_id_categoria FROM categoria WHERE nombre_categoria = p_nombre_categoria;
        IF v_id_categoria IS NULL THEN
            p_resultado := json_build_object('status', 'error', 'message', 'La categoría especificada no existe');
            RETURN;
        END IF;

        SELECT id_dedicacion INTO v_id_dedicacion FROM dedicacion WHERE nombre_dedicacion = p_nombre_dedicacion;
        IF v_id_dedicacion IS NULL THEN
            p_resultado := json_build_object('status', 'error', 'message', 'La dedicación especificada no existe');
            RETURN;
        END IF;

        SELECT id_ubicacion INTO v_id_ubicacion FROM ubicacion WHERE nombre_ubicacion = p_nombre_ubicacion;
        IF v_id_ubicacion IS NULL THEN
            p_resultado := json_build_object('status', 'error', 'message', 'La ubicación especificada no existe');
            RETURN;
        END IF;

        -- Insertar profesor en la base de datos
        INSERT INTO profesores (
            id_categoria, id_cedula, id_dedicacion, id_ubicacion,
            pre_grado, post_grado, area_de_conocimiento, fecha_ingreso,
            created_at, updated_at
        ) VALUES (
            v_id_categoria, p_id_cedula, v_id_dedicacion, v_id_ubicacion,
            p_pre_grado, p_pos_grado, p_area_de_conocimiento, p_fecha_ingreso,
            NOW(), NOW()
        ) RETURNING id_profesor INTO v_id_profesor;

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


ALTER PROCEDURE public.registrar_profesor(IN p_id_cedula bigint, IN p_nombre_categoria character varying, IN p_nombre_dedicacion character varying, IN p_nombre_ubicacion character varying, IN p_pre_grado character varying, IN p_pos_grado character varying, IN p_area_de_conocimiento character varying, IN p_fecha_ingreso date, OUT p_resultado json) OWNER TO postgres;

--
-- TOC entry 269 (class 1255 OID 39904)
-- Name: registrar_unidad_curricular(bigint, character varying, character varying, smallint, character varying, json); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.registrar_unidad_curricular(IN p_id_trayecto bigint, IN p_nombre_unidad_curricular character varying, IN p_descripcion_unidad_curricular character varying, IN p_carga_horas smallint, IN p_codigo_unidad character varying, INOUT p_resultado json DEFAULT NULL::json)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_existe_trayecto BOOLEAN;
    v_trayecto_pnf_id BIGINT;
    v_unidad_existente BOOLEAN;
    v_id_nueva_unidad BIGINT;
BEGIN
    -- Verificar si el trayecto existe y obtener su PNF asociado
    SELECT EXISTS(SELECT 1 FROM trayectos WHERE id_trayecto = p_id_trayecto), 
           (SELECT id_pnf FROM trayectos WHERE id_trayecto = p_id_trayecto)
    INTO v_existe_trayecto, v_trayecto_pnf_id;
    
    -- Si el trayecto no existe
    IF NOT v_existe_trayecto THEN
        p_resultado := json_build_object(
            'status', 'error',
            'message', format('El trayecto con ID %s no existe', p_id_trayecto)
        );
        RETURN;
    END IF;
    
    -- Verificar que el trayecto esté asociado a un PNF válido
    IF v_trayecto_pnf_id IS NULL THEN
        p_resultado := json_build_object(
            'status', 'error',
            'message', 'El trayecto no está asociado a ningún PNF'
        );
        RETURN;
    END IF;
    
    -- Verificar si ya existe una unidad curricular idéntica
    SELECT EXISTS(
        SELECT 1 FROM unidades_curriculares 
        WHERE id_trayecto = p_id_trayecto
          AND nombre_unidad_curricular = p_nombre_unidad_curricular
          AND descripcion_unidad_curricular = p_descripcion_unidad_curricular
          AND horas_clase = p_carga_horas
          AND codigo_unidad = p_codigo_unidad
    ) INTO v_unidad_existente;
    
    IF v_unidad_existente THEN
        p_resultado := json_build_object(
            'status', 'error',
            'message', format('La unidad curricular "%s" ya existe en este trayecto', p_nombre_unidad_curricular)
        );
        RETURN;
    END IF;
    
    -- Insertar la nueva unidad curricular
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
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ) RETURNING id_unidad_curricular INTO v_id_nueva_unidad;
    
    -- Retornar resultado exitoso
    p_resultado := json_build_object(
        'status', 'success',
        'message', format('Unidad curricular "%s" registrada exitosamente', p_nombre_unidad_curricular),
        'id_unidad_curricular', v_id_nueva_unidad
    );
    
EXCEPTION
    WHEN OTHERS THEN
        p_resultado := json_build_object(
            'status', 'error',
            'message', 'Error inesperado al registrar la unidad curricular: ' || SQLERRM
        );
END;
$$;


ALTER PROCEDURE public.registrar_unidad_curricular(IN p_id_trayecto bigint, IN p_nombre_unidad_curricular character varying, IN p_descripcion_unidad_curricular character varying, IN p_carga_horas smallint, IN p_codigo_unidad character varying, INOUT p_resultado json) OWNER TO postgres;

--
-- TOC entry 260 (class 1255 OID 38787)
-- Name: registrar_usuario(integer, character varying, character varying, character varying, character varying, character varying, character varying, character varying, date, character varying); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.registrar_usuario(IN p_id integer, IN p_nombres character varying, IN p_apellidos character varying, IN p_email character varying, IN p_direccion character varying, IN p_password character varying, IN p_telefono_movil character varying, IN p_telefono_local character varying, IN p_fecha_nacimiento date, IN p_genero character varying, OUT p_resultado json)
    LANGUAGE plpgsql
    AS $$
      DECLARE
          usuario_existe BOOLEAN;
      BEGIN
          -- Validación del género
          IF p_genero NOT IN ('masculino', 'femenino') THEN
              p_resultado := json_build_object('status', 'error', 'message', 'Género no válido. Debe ser "masculino" o "femenino"');
              RETURN;
          END IF;

          -- Verificación de usuario existente
          SELECT EXISTS(SELECT 1 FROM users WHERE email = p_email) INTO usuario_existe;
          IF usuario_existe THEN
              p_resultado := json_build_object('status', 'error', 'message', 'El usuario ya está registrado');
              RETURN;
          END IF;

          -- Insertar usuario sin transacción interna
          INSERT INTO users (cedula, nombres, apellidos, email, direccion, password, telefono_movil, telefono_local, fecha_nacimiento, genero, created_at, updated_at)
          VALUES (p_id, p_nombres, p_apellidos, p_email, p_direccion, p_password, p_telefono_movil, p_telefono_local, p_fecha_nacimiento, p_genero, NOW(), NOW());

          -- Respuesta de éxito
          p_resultado := json_build_object('status', 'success', 'message', 'Usuario registrado correctamente');

      EXCEPTION
          WHEN unique_violation THEN
              p_resultado := json_build_object('status', 'error', 'message', 'El usuario ya está registrado');
          WHEN foreign_key_violation THEN
              p_resultado := json_build_object('status', 'error', 'message', 'Error de clave foránea: Datos inválidos');
          WHEN OTHERS THEN
              p_resultado := json_build_object('status', 'error', 'message', 'Error inesperado: ' || SQLERRM);
      END;
      $$;


ALTER PROCEDURE public.registrar_usuario(IN p_id integer, IN p_nombres character varying, IN p_apellidos character varying, IN p_email character varying, IN p_direccion character varying, IN p_password character varying, IN p_telefono_movil character varying, IN p_telefono_local character varying, IN p_fecha_nacimiento date, IN p_genero character varying, OUT p_resultado json) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 237 (class 1259 OID 44300)
-- Name: administradores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.administradores (
    id_administrador bigint NOT NULL,
    id_cedula bigint NOT NULL,
    id_rol bigint NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.administradores OWNER TO postgres;

--
-- TOC entry 5050 (class 0 OID 0)
-- Dependencies: 237
-- Name: TABLE administradores; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.administradores IS 'Tabla de asociación entre usuarios y roles administrativos';


--
-- TOC entry 5051 (class 0 OID 0)
-- Dependencies: 237
-- Name: COLUMN administradores.id_administrador; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.administradores.id_administrador IS 'ID único del administrador';


--
-- TOC entry 5052 (class 0 OID 0)
-- Dependencies: 237
-- Name: COLUMN administradores.id_cedula; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.administradores.id_cedula IS 'Referencia al usuario en la tabla users';


--
-- TOC entry 5053 (class 0 OID 0)
-- Dependencies: 237
-- Name: COLUMN administradores.id_rol; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.administradores.id_rol IS 'Rol asignado al administrador';


--
-- TOC entry 5054 (class 0 OID 0)
-- Dependencies: 237
-- Name: COLUMN administradores.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.administradores.created_at IS 'Fecha de creación del registro';


--
-- TOC entry 5055 (class 0 OID 0)
-- Dependencies: 237
-- Name: COLUMN administradores.updated_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.administradores.updated_at IS 'Fecha de última actualización';


--
-- TOC entry 236 (class 1259 OID 44299)
-- Name: administradores_id_administrador_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.administradores_id_administrador_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.administradores_id_administrador_seq OWNER TO postgres;

--
-- TOC entry 5056 (class 0 OID 0)
-- Dependencies: 236
-- Name: administradores_id_administrador_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.administradores_id_administrador_seq OWNED BY public.administradores.id_administrador;


--
-- TOC entry 224 (class 1259 OID 44154)
-- Name: categoria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categoria (
    id_categoria smallint NOT NULL,
    nombre_categoria character varying(50) NOT NULL,
    descripcion_categoria text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.categoria OWNER TO postgres;

--
-- TOC entry 5057 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN categoria.id_categoria; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.categoria.id_categoria IS 'ID numérico pequeño de la categoría (1-255)';


--
-- TOC entry 5058 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN categoria.nombre_categoria; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.categoria.nombre_categoria IS 'Nombre descriptivo de la categoría (debe ser único)';


--
-- TOC entry 5059 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN categoria.descripcion_categoria; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.categoria.descripcion_categoria IS 'Descripción detallada de la categoría';


--
-- TOC entry 5060 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN categoria.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.categoria.created_at IS 'Fecha de creación del registro';


--
-- TOC entry 5061 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN categoria.updated_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.categoria.updated_at IS 'Fecha de última actualización del registro';


--
-- TOC entry 235 (class 1259 OID 44276)
-- Name: coordinadores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coordinadores (
    id_coordinador bigint NOT NULL,
    id_cedula bigint NOT NULL,
    id_ubicacion smallint NOT NULL,
    id_pnf smallint NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.coordinadores OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 44275)
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
-- TOC entry 5062 (class 0 OID 0)
-- Dependencies: 234
-- Name: coordinadores_id_coordinador_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.coordinadores_id_coordinador_seq OWNED BY public.coordinadores.id_coordinador;


--
-- TOC entry 223 (class 1259 OID 44143)
-- Name: dedicacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dedicacion (
    id_dedicacion smallint NOT NULL,
    nombre_dedicacion character varying(50) NOT NULL,
    horas_docencia_semanales interval NOT NULL,
    horas_administrativas_semanales interval DEFAULT '00:00:00'::interval NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_dedicacion_total CHECK ((((EXTRACT(epoch FROM horas_docencia_semanales) / (3600)::numeric) + (EXTRACT(epoch FROM horas_administrativas_semanales) / (3600)::numeric)) <= (40)::numeric))
);


ALTER TABLE public.dedicacion OWNER TO postgres;

--
-- TOC entry 5063 (class 0 OID 0)
-- Dependencies: 223
-- Name: COLUMN dedicacion.id_dedicacion; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.dedicacion.id_dedicacion IS 'ID numérico pequeño para tipo de dedicación (1-255)';


--
-- TOC entry 5064 (class 0 OID 0)
-- Dependencies: 223
-- Name: COLUMN dedicacion.nombre_dedicacion; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.dedicacion.nombre_dedicacion IS 'Nombre del tipo de dedicación (ej: Tiempo completo, Medio tiempo)';


--
-- TOC entry 5065 (class 0 OID 0)
-- Dependencies: 223
-- Name: COLUMN dedicacion.horas_docencia_semanales; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.dedicacion.horas_docencia_semanales IS 'Horas semanales dedicadas a docencia (formato interval)';


--
-- TOC entry 5066 (class 0 OID 0)
-- Dependencies: 223
-- Name: COLUMN dedicacion.horas_administrativas_semanales; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.dedicacion.horas_administrativas_semanales IS 'Horas semanales dedicadas a actividades administrativas';


--
-- TOC entry 5067 (class 0 OID 0)
-- Dependencies: 223
-- Name: COLUMN dedicacion.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.dedicacion.created_at IS 'Fecha de creación del registro';


--
-- TOC entry 5068 (class 0 OID 0)
-- Dependencies: 223
-- Name: COLUMN dedicacion.updated_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.dedicacion.updated_at IS 'Fecha de última actualización del registro';


--
-- TOC entry 243 (class 1259 OID 44367)
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
-- TOC entry 5069 (class 0 OID 0)
-- Dependencies: 243
-- Name: COLUMN horarios.id_horario; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.horarios.id_horario IS 'ID único del horario';


--
-- TOC entry 5070 (class 0 OID 0)
-- Dependencies: 243
-- Name: COLUMN horarios.seccion_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.horarios.seccion_id IS 'Sección asociada al horario';


--
-- TOC entry 5071 (class 0 OID 0)
-- Dependencies: 243
-- Name: COLUMN horarios.profesor_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.horarios.profesor_id IS 'Profesor asignado';


--
-- TOC entry 5072 (class 0 OID 0)
-- Dependencies: 243
-- Name: COLUMN horarios.unidad_curricular_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.horarios.unidad_curricular_id IS 'Unidad curricular programada';


--
-- TOC entry 5073 (class 0 OID 0)
-- Dependencies: 243
-- Name: COLUMN horarios.dia_semana; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.horarios.dia_semana IS 'Día de la semana (domingo excluido por ser no lectivo)';


--
-- TOC entry 5074 (class 0 OID 0)
-- Dependencies: 243
-- Name: COLUMN horarios.hora_inicio; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.horarios.hora_inicio IS 'Hora de inicio de la clase';


--
-- TOC entry 5075 (class 0 OID 0)
-- Dependencies: 243
-- Name: COLUMN horarios.hora_fin; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.horarios.hora_fin IS 'Hora de finalización de la clase';


--
-- TOC entry 5076 (class 0 OID 0)
-- Dependencies: 243
-- Name: COLUMN horarios.aula; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.horarios.aula IS 'Aula o espacio físico asignado';


--
-- TOC entry 5077 (class 0 OID 0)
-- Dependencies: 243
-- Name: COLUMN horarios.activo; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.horarios.activo IS 'Indica si el horario está actualmente activo';


--
-- TOC entry 5078 (class 0 OID 0)
-- Dependencies: 243
-- Name: COLUMN horarios.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.horarios.created_at IS 'Fecha de creación del registro';


--
-- TOC entry 5079 (class 0 OID 0)
-- Dependencies: 243
-- Name: COLUMN horarios.updated_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.horarios.updated_at IS 'Fecha de última actualización';


--
-- TOC entry 242 (class 1259 OID 44366)
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
-- TOC entry 5080 (class 0 OID 0)
-- Dependencies: 242
-- Name: horarios_id_horario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.horarios_id_horario_seq OWNED BY public.horarios.id_horario;


--
-- TOC entry 220 (class 1259 OID 38520)
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
-- TOC entry 219 (class 1259 OID 38519)
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
-- TOC entry 5081 (class 0 OID 0)
-- Dependencies: 219
-- Name: knex_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.knex_migrations_id_seq OWNED BY public.knex_migrations.id;


--
-- TOC entry 222 (class 1259 OID 38527)
-- Name: knex_migrations_lock; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.knex_migrations_lock (
    index integer NOT NULL,
    is_locked integer
);


ALTER TABLE public.knex_migrations_lock OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 38526)
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
-- TOC entry 5082 (class 0 OID 0)
-- Dependencies: 221
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.knex_migrations_lock_index_seq OWNED BY public.knex_migrations_lock.index;


--
-- TOC entry 226 (class 1259 OID 44167)
-- Name: pnfs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pnfs (
    id_pnf smallint NOT NULL,
    codigo_pnf character varying(10) NOT NULL,
    nombre_pnf character varying(60) NOT NULL,
    descripcion_pnf character varying(400) NOT NULL,
    poblacion_estudiantil_pnf integer DEFAULT 0 NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.pnfs OWNER TO postgres;

--
-- TOC entry 5083 (class 0 OID 0)
-- Dependencies: 226
-- Name: COLUMN pnfs.codigo_pnf; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.pnfs.codigo_pnf IS 'Código institucional del PNF (ej: ING-INF)';


--
-- TOC entry 5084 (class 0 OID 0)
-- Dependencies: 226
-- Name: COLUMN pnfs.nombre_pnf; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.pnfs.nombre_pnf IS 'Nombre completo del Programa Nacional de Formación';


--
-- TOC entry 5085 (class 0 OID 0)
-- Dependencies: 226
-- Name: COLUMN pnfs.descripcion_pnf; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.pnfs.descripcion_pnf IS 'Objetivos y alcance del programa';


--
-- TOC entry 5086 (class 0 OID 0)
-- Dependencies: 226
-- Name: COLUMN pnfs.poblacion_estudiantil_pnf; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.pnfs.poblacion_estudiantil_pnf IS 'Estudiantes activos registrados';


--
-- TOC entry 5087 (class 0 OID 0)
-- Dependencies: 226
-- Name: COLUMN pnfs.activo; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.pnfs.activo IS 'Indica si el PNF está actualmente activo';


--
-- TOC entry 5088 (class 0 OID 0)
-- Dependencies: 226
-- Name: COLUMN pnfs.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.pnfs.created_at IS 'Fecha de creación del registro';


--
-- TOC entry 5089 (class 0 OID 0)
-- Dependencies: 226
-- Name: COLUMN pnfs.updated_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.pnfs.updated_at IS 'Fecha de última actualización';


--
-- TOC entry 225 (class 1259 OID 44166)
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
-- TOC entry 5090 (class 0 OID 0)
-- Dependencies: 225
-- Name: pnfs_id_pnf_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pnfs_id_pnf_seq OWNED BY public.pnfs.id_pnf;


--
-- TOC entry 233 (class 1259 OID 44238)
-- Name: profesores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profesores (
    id_profesor bigint NOT NULL,
    id_categoria smallint NOT NULL,
    id_cedula bigint NOT NULL,
    id_dedicacion smallint NOT NULL,
    id_ubicacion smallint NOT NULL,
    pre_grado text NOT NULL,
    post_grado text NOT NULL,
    area_de_conocimiento character varying(300) NOT NULL,
    fecha_ingreso date NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.profesores OWNER TO postgres;

--
-- TOC entry 5091 (class 0 OID 0)
-- Dependencies: 233
-- Name: COLUMN profesores.id_profesor; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.profesores.id_profesor IS 'ID único del profesor';


--
-- TOC entry 5092 (class 0 OID 0)
-- Dependencies: 233
-- Name: COLUMN profesores.id_categoria; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.profesores.id_categoria IS 'Categoría del profesor';


--
-- TOC entry 5093 (class 0 OID 0)
-- Dependencies: 233
-- Name: COLUMN profesores.id_cedula; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.profesores.id_cedula IS 'Relación con la tabla de usuarios (1 a 1)';


--
-- TOC entry 5094 (class 0 OID 0)
-- Dependencies: 233
-- Name: COLUMN profesores.id_dedicacion; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.profesores.id_dedicacion IS 'Tipo de dedicación del profesor';


--
-- TOC entry 5095 (class 0 OID 0)
-- Dependencies: 233
-- Name: COLUMN profesores.id_ubicacion; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.profesores.id_ubicacion IS 'Ubicación física del profesor';


--
-- TOC entry 5096 (class 0 OID 0)
-- Dependencies: 233
-- Name: COLUMN profesores.pre_grado; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.profesores.pre_grado IS 'Formación de pregrado del profesor';


--
-- TOC entry 5097 (class 0 OID 0)
-- Dependencies: 233
-- Name: COLUMN profesores.post_grado; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.profesores.post_grado IS 'Formación de posgrado del profesor';


--
-- TOC entry 5098 (class 0 OID 0)
-- Dependencies: 233
-- Name: COLUMN profesores.area_de_conocimiento; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.profesores.area_de_conocimiento IS 'Área principal de conocimiento';


--
-- TOC entry 5099 (class 0 OID 0)
-- Dependencies: 233
-- Name: COLUMN profesores.fecha_ingreso; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.profesores.fecha_ingreso IS 'Fecha de ingreso a la institución';


--
-- TOC entry 5100 (class 0 OID 0)
-- Dependencies: 233
-- Name: COLUMN profesores.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.profesores.created_at IS 'Fecha de creación del registro';


--
-- TOC entry 5101 (class 0 OID 0)
-- Dependencies: 233
-- Name: COLUMN profesores.updated_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.profesores.updated_at IS 'Fecha de última actualización';


--
-- TOC entry 232 (class 1259 OID 44237)
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
-- TOC entry 5102 (class 0 OID 0)
-- Dependencies: 232
-- Name: profesores_id_profesor_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.profesores_id_profesor_seq OWNED BY public.profesores.id_profesor;


--
-- TOC entry 227 (class 1259 OID 44184)
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
-- TOC entry 5103 (class 0 OID 0)
-- Dependencies: 227
-- Name: COLUMN roles.id_rol; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.roles.id_rol IS 'ID numérico pequeño del rol (1-255)';


--
-- TOC entry 5104 (class 0 OID 0)
-- Dependencies: 227
-- Name: COLUMN roles.nombre_rol; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.roles.nombre_rol IS 'Nombre descriptivo del rol (debe ser único)';


--
-- TOC entry 5105 (class 0 OID 0)
-- Dependencies: 227
-- Name: COLUMN roles.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.roles.created_at IS 'Fecha de creación del registro';


--
-- TOC entry 5106 (class 0 OID 0)
-- Dependencies: 227
-- Name: COLUMN roles.updated_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.roles.updated_at IS 'Fecha de última actualización del registro';


--
-- TOC entry 239 (class 1259 OID 44323)
-- Name: secciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.secciones (
    id_seccion bigint NOT NULL,
    valor_seccion character varying(20) NOT NULL,
    id_trayecto bigint NOT NULL,
    cupos_disponibles integer DEFAULT 20 NOT NULL,
    turno text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_secciones_cupos_validos CHECK (((cupos_disponibles >= 8) AND (cupos_disponibles <= 40))),
    CONSTRAINT secciones_turno_check CHECK ((turno = ANY (ARRAY['matutino'::text, 'vespertino'::text, 'nocturno'::text])))
);


ALTER TABLE public.secciones OWNER TO postgres;

--
-- TOC entry 5107 (class 0 OID 0)
-- Dependencies: 239
-- Name: TABLE secciones; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.secciones IS 'Tabla de secciones académicas agrupadas por trayecto';


--
-- TOC entry 5108 (class 0 OID 0)
-- Dependencies: 239
-- Name: COLUMN secciones.id_seccion; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.secciones.id_seccion IS 'ID único de la sección (UUID)';


--
-- TOC entry 5109 (class 0 OID 0)
-- Dependencies: 239
-- Name: COLUMN secciones.valor_seccion; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.secciones.valor_seccion IS 'Valor identificador de la sección (ej: "Sección A")';


--
-- TOC entry 5110 (class 0 OID 0)
-- Dependencies: 239
-- Name: COLUMN secciones.id_trayecto; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.secciones.id_trayecto IS 'Trayecto al que pertenece la sección';


--
-- TOC entry 5111 (class 0 OID 0)
-- Dependencies: 239
-- Name: COLUMN secciones.cupos_disponibles; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.secciones.cupos_disponibles IS 'Cantidad de cupos disponibles (8-40)';


--
-- TOC entry 5112 (class 0 OID 0)
-- Dependencies: 239
-- Name: COLUMN secciones.turno; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.secciones.turno IS 'Esta columna es para saber el turno que le corresponde a la seccion.';


--
-- TOC entry 5113 (class 0 OID 0)
-- Dependencies: 239
-- Name: COLUMN secciones.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.secciones.created_at IS 'Fecha de creación del registro';


--
-- TOC entry 5114 (class 0 OID 0)
-- Dependencies: 239
-- Name: COLUMN secciones.updated_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.secciones.updated_at IS 'Fecha de última actualización';


--
-- TOC entry 238 (class 1259 OID 44322)
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
-- TOC entry 5115 (class 0 OID 0)
-- Dependencies: 238
-- Name: secciones_id_seccion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.secciones_id_seccion_seq OWNED BY public.secciones.id_seccion;


--
-- TOC entry 229 (class 1259 OID 44195)
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
-- TOC entry 5116 (class 0 OID 0)
-- Dependencies: 229
-- Name: COLUMN trayectos.poblacion_estudiantil; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trayectos.poblacion_estudiantil IS 'Cantidad de estudiantes en el trayecto';


--
-- TOC entry 5117 (class 0 OID 0)
-- Dependencies: 229
-- Name: COLUMN trayectos.valor_trayecto; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trayectos.valor_trayecto IS 'Valor identificador del trayecto (ej: Trayecto I, Trayecto II)';


--
-- TOC entry 5118 (class 0 OID 0)
-- Dependencies: 229
-- Name: COLUMN trayectos.id_pnf; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trayectos.id_pnf IS 'Referencia al PNF al que pertenece el trayecto';


--
-- TOC entry 5119 (class 0 OID 0)
-- Dependencies: 229
-- Name: COLUMN trayectos.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trayectos.created_at IS 'Fecha de creación del registro';


--
-- TOC entry 5120 (class 0 OID 0)
-- Dependencies: 229
-- Name: COLUMN trayectos.updated_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.trayectos.updated_at IS 'Fecha de última actualización del registro';


--
-- TOC entry 228 (class 1259 OID 44194)
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
-- TOC entry 5121 (class 0 OID 0)
-- Dependencies: 228
-- Name: trayectos_id_trayecto_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.trayectos_id_trayecto_seq OWNED BY public.trayectos.id_trayecto;


--
-- TOC entry 230 (class 1259 OID 44211)
-- Name: ubicacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ubicacion (
    id_ubicacion smallint NOT NULL,
    nombre_ubicacion character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.ubicacion OWNER TO postgres;

--
-- TOC entry 5122 (class 0 OID 0)
-- Dependencies: 230
-- Name: COLUMN ubicacion.id_ubicacion; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.ubicacion.id_ubicacion IS 'Identificador único numerico de la ubicación en rango (1-255)';


--
-- TOC entry 5123 (class 0 OID 0)
-- Dependencies: 230
-- Name: COLUMN ubicacion.nombre_ubicacion; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.ubicacion.nombre_ubicacion IS 'Nombre descriptivo de la ubicación (debe ser único)';


--
-- TOC entry 5124 (class 0 OID 0)
-- Dependencies: 230
-- Name: COLUMN ubicacion.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.ubicacion.created_at IS 'Fecha de creación del registro';


--
-- TOC entry 5125 (class 0 OID 0)
-- Dependencies: 230
-- Name: COLUMN ubicacion.updated_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.ubicacion.updated_at IS 'Fecha de última actualización del registro';


--
-- TOC entry 241 (class 1259 OID 44346)
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
-- TOC entry 5126 (class 0 OID 0)
-- Dependencies: 241
-- Name: COLUMN unidades_curriculares.id_unidad_curricular; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.unidades_curriculares.id_unidad_curricular IS 'ID único de la unidad curricular';


--
-- TOC entry 5127 (class 0 OID 0)
-- Dependencies: 241
-- Name: COLUMN unidades_curriculares.id_trayecto; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.unidades_curriculares.id_trayecto IS 'Trayecto al que pertenece la unidad curricular';


--
-- TOC entry 5128 (class 0 OID 0)
-- Dependencies: 241
-- Name: COLUMN unidades_curriculares.codigo_unidad; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.unidades_curriculares.codigo_unidad IS 'Código único identificador de la unidad (ej: MAT-101)';


--
-- TOC entry 5129 (class 0 OID 0)
-- Dependencies: 241
-- Name: COLUMN unidades_curriculares.nombre_unidad_curricular; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.unidades_curriculares.nombre_unidad_curricular IS 'Nombre completo de la unidad curricular';


--
-- TOC entry 5130 (class 0 OID 0)
-- Dependencies: 241
-- Name: COLUMN unidades_curriculares.descripcion_unidad_curricular; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.unidades_curriculares.descripcion_unidad_curricular IS 'Descripción detallada de los contenidos y objetivos';


--
-- TOC entry 5131 (class 0 OID 0)
-- Dependencies: 241
-- Name: COLUMN unidades_curriculares.horas_clase; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.unidades_curriculares.horas_clase IS 'Duración de horas de clase';


--
-- TOC entry 5132 (class 0 OID 0)
-- Dependencies: 241
-- Name: COLUMN unidades_curriculares.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.unidades_curriculares.created_at IS 'Fecha de creación del registro';


--
-- TOC entry 5133 (class 0 OID 0)
-- Dependencies: 241
-- Name: COLUMN unidades_curriculares.updated_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.unidades_curriculares.updated_at IS 'Fecha de última actualización';


--
-- TOC entry 240 (class 1259 OID 44345)
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
-- TOC entry 5134 (class 0 OID 0)
-- Dependencies: 240
-- Name: unidades_curriculares_id_unidad_curricular_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.unidades_curriculares_id_unidad_curricular_seq OWNED BY public.unidades_curriculares.id_unidad_curricular;


--
-- TOC entry 231 (class 1259 OID 44221)
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
-- TOC entry 5135 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN users.cedula; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.cedula IS 'Número de cédula como identificador único';


--
-- TOC entry 5136 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN users.nombres; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.nombres IS 'Nombres del usuario';


--
-- TOC entry 5137 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN users.apellidos; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.apellidos IS 'Apellidos del usuario';


--
-- TOC entry 5138 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN users.direccion; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.direccion IS 'Dirección completa del usuario';


--
-- TOC entry 5139 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN users.password; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.password IS 'Contraseña encriptada';


--
-- TOC entry 5140 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN users.telefono_movil; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.telefono_movil IS 'Teléfono móvil principal';


--
-- TOC entry 5141 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN users.telefono_local; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.telefono_local IS 'Teléfono local (opcional)';


--
-- TOC entry 5142 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN users.fecha_nacimiento; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.fecha_nacimiento IS 'Fecha de nacimiento del usuario';


--
-- TOC entry 5143 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN users.genero; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.genero IS 'Género del usuario';


--
-- TOC entry 5144 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN users.email; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.email IS 'Correo electrónico único';


--
-- TOC entry 5145 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN users.activo; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.activo IS 'Indica si el usuario está activo en el sistema';


--
-- TOC entry 5146 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN users.last_login; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.last_login IS 'Último inicio de sesión';


--
-- TOC entry 5147 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN users.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.created_at IS 'Fecha de creación del registro';


--
-- TOC entry 5148 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN users.updated_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.updated_at IS 'Fecha de última actualización';


--
-- TOC entry 244 (class 1259 OID 44411)
-- Name: vista_profesor_completo; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vista_profesor_completo AS
 SELECT u.cedula,
    u.nombres,
    u.apellidos,
    u.genero,
    u.fecha_nacimiento,
    p.fecha_ingreso,
    ubi.nombre_ubicacion AS ubicacion,
    c.nombre_categoria AS categoria,
    d.nombre_dedicacion AS dedicacion,
    u.email,
    u.telefono_movil,
    p.pre_grado,
    p.post_grado,
    p.area_de_conocimiento
   FROM ((((public.profesores p
     LEFT JOIN public.categoria c ON ((p.id_categoria = c.id_categoria)))
     LEFT JOIN public.ubicacion ubi ON ((p.id_ubicacion = ubi.id_ubicacion)))
     LEFT JOIN public.dedicacion d ON ((p.id_dedicacion = d.id_dedicacion)))
     LEFT JOIN public.users u ON ((p.id_cedula = u.cedula)));


ALTER VIEW public.vista_profesor_completo OWNER TO postgres;

--
-- TOC entry 4756 (class 2604 OID 44303)
-- Name: administradores id_administrador; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administradores ALTER COLUMN id_administrador SET DEFAULT nextval('public.administradores_id_administrador_seq'::regclass);


--
-- TOC entry 4753 (class 2604 OID 44279)
-- Name: coordinadores id_coordinador; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coordinadores ALTER COLUMN id_coordinador SET DEFAULT nextval('public.coordinadores_id_coordinador_seq'::regclass);


--
-- TOC entry 4766 (class 2604 OID 44370)
-- Name: horarios id_horario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios ALTER COLUMN id_horario SET DEFAULT nextval('public.horarios_id_horario_seq'::regclass);


--
-- TOC entry 4727 (class 2604 OID 38523)
-- Name: knex_migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.knex_migrations ALTER COLUMN id SET DEFAULT nextval('public.knex_migrations_id_seq'::regclass);


--
-- TOC entry 4728 (class 2604 OID 38530)
-- Name: knex_migrations_lock index; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.knex_migrations_lock ALTER COLUMN index SET DEFAULT nextval('public.knex_migrations_lock_index_seq'::regclass);


--
-- TOC entry 4734 (class 2604 OID 44170)
-- Name: pnfs id_pnf; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pnfs ALTER COLUMN id_pnf SET DEFAULT nextval('public.pnfs_id_pnf_seq'::regclass);


--
-- TOC entry 4750 (class 2604 OID 44241)
-- Name: profesores id_profesor; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesores ALTER COLUMN id_profesor SET DEFAULT nextval('public.profesores_id_profesor_seq'::regclass);


--
-- TOC entry 4759 (class 2604 OID 44326)
-- Name: secciones id_seccion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.secciones ALTER COLUMN id_seccion SET DEFAULT nextval('public.secciones_id_seccion_seq'::regclass);


--
-- TOC entry 4741 (class 2604 OID 44198)
-- Name: trayectos id_trayecto; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trayectos ALTER COLUMN id_trayecto SET DEFAULT nextval('public.trayectos_id_trayecto_seq'::regclass);


--
-- TOC entry 4763 (class 2604 OID 44349)
-- Name: unidades_curriculares id_unidad_curricular; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unidades_curriculares ALTER COLUMN id_unidad_curricular SET DEFAULT nextval('public.unidades_curriculares_id_unidad_curricular_seq'::regclass);


--
-- TOC entry 5038 (class 0 OID 44300)
-- Dependencies: 237
-- Data for Name: administradores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.administradores (id_administrador, id_cedula, id_rol, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5025 (class 0 OID 44154)
-- Dependencies: 224
-- Data for Name: categoria; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categoria (id_categoria, nombre_categoria, descripcion_categoria, created_at, updated_at) FROM stdin;
1	Instructor	\N	2025-06-09 12:51:07.035834-04	2025-06-09 12:51:07.035834-04
2	Asistente	\N	2025-06-09 12:51:07.035834-04	2025-06-09 12:51:07.035834-04
3	Agregado	\N	2025-06-09 12:51:07.035834-04	2025-06-09 12:51:07.035834-04
4	Asociado	\N	2025-06-09 12:51:07.035834-04	2025-06-09 12:51:07.035834-04
5	Titular	\N	2025-06-09 12:51:07.035834-04	2025-06-09 12:51:07.035834-04
\.


--
-- TOC entry 5036 (class 0 OID 44276)
-- Dependencies: 235
-- Data for Name: coordinadores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coordinadores (id_coordinador, id_cedula, id_ubicacion, id_pnf, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5024 (class 0 OID 44143)
-- Dependencies: 223
-- Data for Name: dedicacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dedicacion (id_dedicacion, nombre_dedicacion, horas_docencia_semanales, horas_administrativas_semanales, created_at, updated_at) FROM stdin;
1	Convencional	07:00:00	00:00:00	2025-06-09 12:51:07.038487-04	2025-06-09 12:51:07.038487-04
2	Medio Tiempo	12:00:00	06:00:00	2025-06-09 12:51:07.038487-04	2025-06-09 12:51:07.038487-04
3	Tiempo Completo	14:00:00	16:00:00	2025-06-09 12:51:07.038487-04	2025-06-09 12:51:07.038487-04
4	Exclusivo	18:00:00	18:00:00	2025-06-09 12:51:07.038487-04	2025-06-09 12:51:07.038487-04
\.


--
-- TOC entry 5044 (class 0 OID 44367)
-- Dependencies: 243
-- Data for Name: horarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.horarios (id_horario, seccion_id, profesor_id, unidad_curricular_id, dia_semana, hora_inicio, hora_fin, aula, activo, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5021 (class 0 OID 38520)
-- Dependencies: 220
-- Data for Name: knex_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.knex_migrations (id, name, batch, migration_time) FROM stdin;
118	20250525000001_dedicacion.js	1	2025-06-09 12:50:54.692-04
119	20250525000002_categoria.js	1	2025-06-09 12:50:54.724-04
120	20250525000003_pnfs.js	1	2025-06-09 12:50:54.751-04
121	20250525000004_roles.js	1	2025-06-09 12:50:54.764-04
122	20250525000005_trayecto.js	1	2025-06-09 12:50:54.795-04
123	20250525000006_ubicacion.js	1	2025-06-09 12:50:54.808-04
124	20250525000007_users.js	1	2025-06-09 12:50:54.833-04
125	20250525000008_profesores.js	1	2025-06-09 12:50:54.892-04
126	20250525000009_coordinadores.js	1	2025-06-09 12:50:54.911-04
127	20250525000010_administradores.js	1	2025-06-09 12:50:54.939-04
128	20250525000011_secciones.js	1	2025-06-09 12:50:54.968-04
129	20250525000012_unidad_curricular.js	1	2025-06-09 12:50:55.001-04
130	20250525000013_horarios.js	1	2025-06-09 12:50:55.057-04
\.


--
-- TOC entry 5023 (class 0 OID 38527)
-- Dependencies: 222
-- Data for Name: knex_migrations_lock; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.knex_migrations_lock (index, is_locked) FROM stdin;
1	0
\.


--
-- TOC entry 5027 (class 0 OID 44167)
-- Dependencies: 226
-- Data for Name: pnfs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pnfs (id_pnf, codigo_pnf, nombre_pnf, descripcion_pnf, poblacion_estudiantil_pnf, activo, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5034 (class 0 OID 44238)
-- Dependencies: 233
-- Data for Name: profesores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profesores (id_profesor, id_categoria, id_cedula, id_dedicacion, id_ubicacion, pre_grado, post_grado, area_de_conocimiento, fecha_ingreso, created_at, updated_at) FROM stdin;
1	1	31264460	1	2	Ingeniería en Sistemas	Doctorado en Ciencias de la Computación	Inteligencia Artificial	2021-03-22	2025-06-09 12:52:21.972321-04	2025-06-09 12:52:21.972321-04
2	4	17744380	3	2	Ingeniería	Maestria	Informatica	2025-06-09	2025-06-09 13:06:57.921517-04	2025-06-09 13:06:57.921517-04
\.


--
-- TOC entry 5028 (class 0 OID 44184)
-- Dependencies: 227
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id_rol, nombre_rol, created_at, updated_at) FROM stdin;
1	Vicerrector	2025-06-09 12:51:07.027636-04	2025-06-09 12:51:07.027636-04
2	Director General de Gestión Curricular	2025-06-09 12:51:07.027636-04	2025-06-09 12:51:07.027636-04
\.


--
-- TOC entry 5040 (class 0 OID 44323)
-- Dependencies: 239
-- Data for Name: secciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.secciones (id_seccion, valor_seccion, id_trayecto, cupos_disponibles, turno, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5030 (class 0 OID 44195)
-- Dependencies: 229
-- Data for Name: trayectos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trayectos (id_trayecto, poblacion_estudiantil, valor_trayecto, id_pnf, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5031 (class 0 OID 44211)
-- Dependencies: 230
-- Data for Name: ubicacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ubicacion (id_ubicacion, nombre_ubicacion, created_at, updated_at) FROM stdin;
1	Núcleo de Humanidades y Ciencias Sociales	2025-06-09 12:51:07.032585-04	2025-06-09 12:51:07.032585-04
2	Núcleo de Tecnología y Ciencias Administrativas	2025-06-09 12:51:07.032585-04	2025-06-09 12:51:07.032585-04
3	Núcleo de Salud y Deporte	2025-06-09 12:51:07.032585-04	2025-06-09 12:51:07.032585-04
\.


--
-- TOC entry 5042 (class 0 OID 44346)
-- Dependencies: 241
-- Data for Name: unidades_curriculares; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.unidades_curriculares (id_unidad_curricular, id_trayecto, codigo_unidad, nombre_unidad_curricular, descripcion_unidad_curricular, horas_clase, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5032 (class 0 OID 44221)
-- Dependencies: 231
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (cedula, nombres, apellidos, direccion, password, telefono_movil, telefono_local, fecha_nacimiento, genero, email, activo, last_login, created_at, updated_at) FROM stdin;
31264460	Gabriel Dayer	Leonett Armas	Av. Bermudez, Los teques	$2b$10$9gErmYZEP1zHMIWxQ/y.gOXAADti6idxfZDL3b3NkTBBbXFaKbfwi	04142245310	\N	2004-11-27	masculino	delegadogabrielleonett@gmail.com	t	\N	2025-06-09 12:52:21.972321-04	2025-06-09 12:52:21.972321-04
17744380	Liseth Adreidy	Leonett Armas	Av.Bermudez, Edif.Torre Conteca, Piso 12, Apartamento B	$2b$10$LztyJJODzyHbNAI8DpNf7.jfSdzNPfxTP1E3tUsc6shIYNMHzdeda	04242238744	\N	1985-08-13	femenino	gabriel_leonett@hotmail.com	t	\N	2025-06-09 13:06:57.921517-04	2025-06-09 13:06:57.921517-04
\.


--
-- TOC entry 5149 (class 0 OID 0)
-- Dependencies: 236
-- Name: administradores_id_administrador_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.administradores_id_administrador_seq', 1, false);


--
-- TOC entry 5150 (class 0 OID 0)
-- Dependencies: 234
-- Name: coordinadores_id_coordinador_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.coordinadores_id_coordinador_seq', 1, false);


--
-- TOC entry 5151 (class 0 OID 0)
-- Dependencies: 242
-- Name: horarios_id_horario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.horarios_id_horario_seq', 1, false);


--
-- TOC entry 5152 (class 0 OID 0)
-- Dependencies: 219
-- Name: knex_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.knex_migrations_id_seq', 130, true);


--
-- TOC entry 5153 (class 0 OID 0)
-- Dependencies: 221
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.knex_migrations_lock_index_seq', 1, true);


--
-- TOC entry 5154 (class 0 OID 0)
-- Dependencies: 225
-- Name: pnfs_id_pnf_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pnfs_id_pnf_seq', 1, false);


--
-- TOC entry 5155 (class 0 OID 0)
-- Dependencies: 232
-- Name: profesores_id_profesor_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.profesores_id_profesor_seq', 2, true);


--
-- TOC entry 5156 (class 0 OID 0)
-- Dependencies: 238
-- Name: secciones_id_seccion_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.secciones_id_seccion_seq', 1, false);


--
-- TOC entry 5157 (class 0 OID 0)
-- Dependencies: 228
-- Name: trayectos_id_trayecto_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.trayectos_id_trayecto_seq', 1, false);


--
-- TOC entry 5158 (class 0 OID 0)
-- Dependencies: 240
-- Name: unidades_curriculares_id_unidad_curricular_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.unidades_curriculares_id_unidad_curricular_seq', 1, false);


--
-- TOC entry 4831 (class 2606 OID 44307)
-- Name: administradores administradores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administradores
    ADD CONSTRAINT administradores_pkey PRIMARY KEY (id_administrador);


--
-- TOC entry 4785 (class 2606 OID 44164)
-- Name: categoria categoria_nombre_categoria_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categoria
    ADD CONSTRAINT categoria_nombre_categoria_unique UNIQUE (nombre_categoria);


--
-- TOC entry 4787 (class 2606 OID 44162)
-- Name: categoria categoria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categoria
    ADD CONSTRAINT categoria_pkey PRIMARY KEY (id_categoria);


--
-- TOC entry 4829 (class 2606 OID 44283)
-- Name: coordinadores coordinadores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coordinadores
    ADD CONSTRAINT coordinadores_pkey PRIMARY KEY (id_coordinador);


--
-- TOC entry 4781 (class 2606 OID 44152)
-- Name: dedicacion dedicacion_nombre_dedicacion_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dedicacion
    ADD CONSTRAINT dedicacion_nombre_dedicacion_unique UNIQUE (nombre_dedicacion);


--
-- TOC entry 4783 (class 2606 OID 44150)
-- Name: dedicacion dedicacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dedicacion
    ADD CONSTRAINT dedicacion_pkey PRIMARY KEY (id_dedicacion);


--
-- TOC entry 4850 (class 2606 OID 44379)
-- Name: horarios horarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios
    ADD CONSTRAINT horarios_pkey PRIMARY KEY (id_horario);


--
-- TOC entry 4779 (class 2606 OID 38532)
-- Name: knex_migrations_lock knex_migrations_lock_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.knex_migrations_lock
    ADD CONSTRAINT knex_migrations_lock_pkey PRIMARY KEY (index);


--
-- TOC entry 4777 (class 2606 OID 38525)
-- Name: knex_migrations knex_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.knex_migrations
    ADD CONSTRAINT knex_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4793 (class 2606 OID 44178)
-- Name: pnfs pnfs_codigo_pnf_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pnfs
    ADD CONSTRAINT pnfs_codigo_pnf_unique UNIQUE (codigo_pnf);


--
-- TOC entry 4795 (class 2606 OID 44180)
-- Name: pnfs pnfs_nombre_pnf_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pnfs
    ADD CONSTRAINT pnfs_nombre_pnf_unique UNIQUE (nombre_pnf);


--
-- TOC entry 4797 (class 2606 OID 44176)
-- Name: pnfs pnfs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pnfs
    ADD CONSTRAINT pnfs_pkey PRIMARY KEY (id_pnf);


--
-- TOC entry 4825 (class 2606 OID 44259)
-- Name: profesores profesores_id_cedula_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesores
    ADD CONSTRAINT profesores_id_cedula_unique UNIQUE (id_cedula);


--
-- TOC entry 4827 (class 2606 OID 44247)
-- Name: profesores profesores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesores
    ADD CONSTRAINT profesores_pkey PRIMARY KEY (id_profesor);


--
-- TOC entry 4800 (class 2606 OID 44192)
-- Name: roles roles_nombre_rol_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_nombre_rol_unique UNIQUE (nombre_rol);


--
-- TOC entry 4802 (class 2606 OID 44190)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id_rol);


--
-- TOC entry 4839 (class 2606 OID 44335)
-- Name: secciones secciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.secciones
    ADD CONSTRAINT secciones_pkey PRIMARY KEY (id_seccion);


--
-- TOC entry 4806 (class 2606 OID 44203)
-- Name: trayectos trayectos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trayectos
    ADD CONSTRAINT trayectos_pkey PRIMARY KEY (id_trayecto);


--
-- TOC entry 4809 (class 2606 OID 44219)
-- Name: ubicacion ubicacion_nombre_ubicacion_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ubicacion
    ADD CONSTRAINT ubicacion_nombre_ubicacion_unique UNIQUE (nombre_ubicacion);


--
-- TOC entry 4811 (class 2606 OID 44217)
-- Name: ubicacion ubicacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ubicacion
    ADD CONSTRAINT ubicacion_pkey PRIMARY KEY (id_ubicacion);


--
-- TOC entry 4846 (class 2606 OID 44362)
-- Name: unidades_curriculares unidades_curriculares_codigo_unidad_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unidades_curriculares
    ADD CONSTRAINT unidades_curriculares_codigo_unidad_unique UNIQUE (codigo_unidad);


--
-- TOC entry 4848 (class 2606 OID 44355)
-- Name: unidades_curriculares unidades_curriculares_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unidades_curriculares
    ADD CONSTRAINT unidades_curriculares_pkey PRIMARY KEY (id_unidad_curricular);


--
-- TOC entry 4835 (class 2606 OID 44319)
-- Name: administradores uq_administrador_rol; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administradores
    ADD CONSTRAINT uq_administrador_rol UNIQUE (id_cedula, id_rol);


--
-- TOC entry 4856 (class 2606 OID 44398)
-- Name: horarios uq_aula_horario; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios
    ADD CONSTRAINT uq_aula_horario UNIQUE (aula, dia_semana, hora_inicio, hora_fin);


--
-- TOC entry 4858 (class 2606 OID 44396)
-- Name: horarios uq_profesor_horario; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios
    ADD CONSTRAINT uq_profesor_horario UNIQUE (profesor_id, dia_semana, hora_inicio, hora_fin);


--
-- TOC entry 4841 (class 2606 OID 44344)
-- Name: secciones uq_seccion_trayecto; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.secciones
    ADD CONSTRAINT uq_seccion_trayecto UNIQUE (valor_seccion, id_trayecto);


--
-- TOC entry 4816 (class 2606 OID 44233)
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- TOC entry 4818 (class 2606 OID 44231)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (cedula);


--
-- TOC entry 4832 (class 1259 OID 44321)
-- Name: idx_administradores_rol; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_administradores_rol ON public.administradores USING btree (id_rol);


--
-- TOC entry 4833 (class 1259 OID 44320)
-- Name: idx_administradores_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_administradores_usuario ON public.administradores USING btree (id_cedula);


--
-- TOC entry 4788 (class 1259 OID 44165)
-- Name: idx_categoria_nombre; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_categoria_nombre ON public.categoria USING btree (nombre_categoria);


--
-- TOC entry 4851 (class 1259 OID 44402)
-- Name: idx_horarios_dia_hora; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_horarios_dia_hora ON public.horarios USING btree (dia_semana, hora_inicio);


--
-- TOC entry 4852 (class 1259 OID 44400)
-- Name: idx_horarios_profesor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_horarios_profesor ON public.horarios USING btree (profesor_id);


--
-- TOC entry 4853 (class 1259 OID 44399)
-- Name: idx_horarios_seccion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_horarios_seccion ON public.horarios USING btree (seccion_id);


--
-- TOC entry 4854 (class 1259 OID 44401)
-- Name: idx_horarios_uc; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_horarios_uc ON public.horarios USING btree (unidad_curricular_id);


--
-- TOC entry 4789 (class 1259 OID 44181)
-- Name: idx_pnfs_codigo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pnfs_codigo ON public.pnfs USING btree (codigo_pnf);


--
-- TOC entry 4790 (class 1259 OID 44183)
-- Name: idx_pnfs_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pnfs_estado ON public.pnfs USING btree (activo);


--
-- TOC entry 4791 (class 1259 OID 44182)
-- Name: idx_pnfs_nombre; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_pnfs_nombre ON public.pnfs USING btree (nombre_pnf);


--
-- TOC entry 4819 (class 1259 OID 44274)
-- Name: idx_profesores_antiguedad; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_profesores_antiguedad ON public.profesores USING btree (fecha_ingreso);


--
-- TOC entry 4820 (class 1259 OID 44272)
-- Name: idx_profesores_categoria; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_profesores_categoria ON public.profesores USING btree (id_categoria);


--
-- TOC entry 4821 (class 1259 OID 44273)
-- Name: idx_profesores_dedicacion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_profesores_dedicacion ON public.profesores USING btree (id_dedicacion);


--
-- TOC entry 4822 (class 1259 OID 44271)
-- Name: idx_profesores_ubicacion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_profesores_ubicacion ON public.profesores USING btree (id_ubicacion);


--
-- TOC entry 4823 (class 1259 OID 44270)
-- Name: idx_profesores_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_profesores_usuario ON public.profesores USING btree (id_cedula);


--
-- TOC entry 4798 (class 1259 OID 44193)
-- Name: idx_roles_nombre; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_roles_nombre ON public.roles USING btree (nombre_rol);


--
-- TOC entry 4836 (class 1259 OID 44341)
-- Name: idx_secciones_trayecto; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_secciones_trayecto ON public.secciones USING btree (id_trayecto);


--
-- TOC entry 4837 (class 1259 OID 44342)
-- Name: idx_secciones_valor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_secciones_valor ON public.secciones USING btree (valor_seccion);


--
-- TOC entry 4803 (class 1259 OID 44209)
-- Name: idx_trayectos_pnf; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trayectos_pnf ON public.trayectos USING btree (id_pnf);


--
-- TOC entry 4804 (class 1259 OID 44210)
-- Name: idx_trayectos_valor_pnf; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trayectos_valor_pnf ON public.trayectos USING btree (valor_trayecto, id_pnf);


--
-- TOC entry 4807 (class 1259 OID 44220)
-- Name: idx_ubicacion_nombre; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ubicacion_nombre ON public.ubicacion USING btree (nombre_ubicacion);


--
-- TOC entry 4842 (class 1259 OID 44364)
-- Name: idx_uc_codigo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_uc_codigo ON public.unidades_curriculares USING btree (codigo_unidad);


--
-- TOC entry 4843 (class 1259 OID 44365)
-- Name: idx_uc_nombre; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_uc_nombre ON public.unidades_curriculares USING btree (nombre_unidad_curricular);


--
-- TOC entry 4844 (class 1259 OID 44363)
-- Name: idx_uc_trayecto; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_uc_trayecto ON public.unidades_curriculares USING btree (id_trayecto);


--
-- TOC entry 4812 (class 1259 OID 44236)
-- Name: idx_users_activo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_activo ON public.users USING btree (activo);


--
-- TOC entry 4813 (class 1259 OID 44234)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 4814 (class 1259 OID 44235)
-- Name: idx_users_nombre_completo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_nombre_completo ON public.users USING btree (nombres, apellidos);


--
-- TOC entry 4867 (class 2606 OID 44308)
-- Name: administradores administradores_id_cedula_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administradores
    ADD CONSTRAINT administradores_id_cedula_foreign FOREIGN KEY (id_cedula) REFERENCES public.users(cedula) ON DELETE CASCADE;


--
-- TOC entry 4868 (class 2606 OID 44313)
-- Name: administradores administradores_id_rol_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.administradores
    ADD CONSTRAINT administradores_id_rol_foreign FOREIGN KEY (id_rol) REFERENCES public.roles(id_rol) ON DELETE RESTRICT;


--
-- TOC entry 4864 (class 2606 OID 44284)
-- Name: coordinadores coordinadores_id_cedula_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coordinadores
    ADD CONSTRAINT coordinadores_id_cedula_foreign FOREIGN KEY (id_cedula) REFERENCES public.users(cedula);


--
-- TOC entry 4865 (class 2606 OID 44294)
-- Name: coordinadores coordinadores_id_pnf_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coordinadores
    ADD CONSTRAINT coordinadores_id_pnf_foreign FOREIGN KEY (id_pnf) REFERENCES public.pnfs(id_pnf);


--
-- TOC entry 4866 (class 2606 OID 44289)
-- Name: coordinadores coordinadores_id_ubicacion_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coordinadores
    ADD CONSTRAINT coordinadores_id_ubicacion_foreign FOREIGN KEY (id_ubicacion) REFERENCES public.ubicacion(id_ubicacion);


--
-- TOC entry 4871 (class 2606 OID 44385)
-- Name: horarios horarios_profesor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios
    ADD CONSTRAINT horarios_profesor_id_foreign FOREIGN KEY (profesor_id) REFERENCES public.profesores(id_profesor) ON DELETE RESTRICT;


--
-- TOC entry 4872 (class 2606 OID 44380)
-- Name: horarios horarios_seccion_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios
    ADD CONSTRAINT horarios_seccion_id_foreign FOREIGN KEY (seccion_id) REFERENCES public.secciones(id_seccion) ON DELETE CASCADE;


--
-- TOC entry 4873 (class 2606 OID 44390)
-- Name: horarios horarios_unidad_curricular_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horarios
    ADD CONSTRAINT horarios_unidad_curricular_id_foreign FOREIGN KEY (unidad_curricular_id) REFERENCES public.unidades_curriculares(id_unidad_curricular) ON DELETE RESTRICT;


--
-- TOC entry 4860 (class 2606 OID 44248)
-- Name: profesores profesores_id_categoria_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesores
    ADD CONSTRAINT profesores_id_categoria_foreign FOREIGN KEY (id_categoria) REFERENCES public.categoria(id_categoria) ON DELETE RESTRICT;


--
-- TOC entry 4861 (class 2606 OID 44253)
-- Name: profesores profesores_id_cedula_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesores
    ADD CONSTRAINT profesores_id_cedula_foreign FOREIGN KEY (id_cedula) REFERENCES public.users(cedula) ON DELETE CASCADE;


--
-- TOC entry 4862 (class 2606 OID 44260)
-- Name: profesores profesores_id_dedicacion_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesores
    ADD CONSTRAINT profesores_id_dedicacion_foreign FOREIGN KEY (id_dedicacion) REFERENCES public.dedicacion(id_dedicacion) ON DELETE RESTRICT;


--
-- TOC entry 4863 (class 2606 OID 44265)
-- Name: profesores profesores_id_ubicacion_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profesores
    ADD CONSTRAINT profesores_id_ubicacion_foreign FOREIGN KEY (id_ubicacion) REFERENCES public.ubicacion(id_ubicacion) ON DELETE RESTRICT;


--
-- TOC entry 4869 (class 2606 OID 44336)
-- Name: secciones secciones_id_trayecto_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.secciones
    ADD CONSTRAINT secciones_id_trayecto_foreign FOREIGN KEY (id_trayecto) REFERENCES public.trayectos(id_trayecto) ON DELETE CASCADE;


--
-- TOC entry 4859 (class 2606 OID 44204)
-- Name: trayectos trayectos_id_pnf_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trayectos
    ADD CONSTRAINT trayectos_id_pnf_foreign FOREIGN KEY (id_pnf) REFERENCES public.pnfs(id_pnf) ON DELETE CASCADE;


--
-- TOC entry 4870 (class 2606 OID 44356)
-- Name: unidades_curriculares unidades_curriculares_id_trayecto_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unidades_curriculares
    ADD CONSTRAINT unidades_curriculares_id_trayecto_foreign FOREIGN KEY (id_trayecto) REFERENCES public.trayectos(id_trayecto) ON DELETE CASCADE;


-- Completed on 2025-06-10 07:43:42

--
-- PostgreSQL database dump complete
--

