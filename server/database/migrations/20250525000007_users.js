export async function up(knex) {
  // Primero crear la tabla users
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('nombres', 50).notNullable();
    table.string('apellidos', 50).notNullable();
    table.string('direccion', 200).notNullable();
    table.string('password', 60).notNullable();
    table.string('telefono_movil', 15).notNullable();
    table.string('telefono_local', 15);
    table.date('fecha_nacimiento').notNullable();
    table.enum('genero', ['masculino', 'femenino']);
    table.string('email', 100).unique().notNullable();
    table.timestamps(true, true);
  });

  // Luego crear las funciones
  await knex.raw(`
    CREATE OR REPLACE FUNCTION public.mostrar_usuarios(p_email character varying)
    RETURNS json
    LANGUAGE plpgsql
    AS $$
    DECLARE
        v_roles TEXT[];
        v_usuario JSON;
        v_id_usuario INTEGER;
        v_es_profesor BOOLEAN;
        v_es_coordinador BOOLEAN;
        v_es_administrador BOOLEAN;
    BEGIN 
        -- Obtener información básica del usuario
        SELECT id, json_build_object(
            'id', id,
            'nombres', nombres,
            'apellidos', apellidos,
            'email', email,
            'password', password
        ) INTO v_id_usuario, v_usuario
        FROM users 
        WHERE email = p_email;
        
        IF v_usuario IS NULL THEN
            RETURN json_build_object('error', 'Usuario no encontrado');
        END IF;
        
        -- Verificar roles
        SELECT EXISTS(
            SELECT 1 FROM profesores 
            WHERE id_cedula = v_id_usuario
        ) INTO v_es_profesor;
        
        SELECT EXISTS(
            SELECT 1 FROM coordinadores 
            WHERE id_cedula = v_id_usuario
        ) INTO v_es_coordinador;
        
        SELECT EXISTS(
            SELECT 1 FROM administradores 
            WHERE id_cedula = v_id_usuario
        ) INTO v_es_administrador;
        
        -- Construir array de roles
        v_roles := ARRAY[]::TEXT[];
        
        IF v_es_profesor THEN
            v_roles := array_append(v_roles, 'profesor');
        END IF;
        
        IF v_es_coordinador THEN
            v_roles := array_append(v_roles, 'coordinador');
        END IF;
        
        IF v_es_administrador THEN
            v_roles := array_append(v_roles, 'administrador');
        END IF;
        
        -- Retornar resultado combinado
        RETURN json_build_object(
            'usuario', v_usuario,
            'roles', v_roles
        );
    END;
    $$;

    CREATE OR REPLACE FUNCTION public.registra_usuarios(
        p_id integer, 
        p_nombres character varying, 
        p_apellidos character varying,
        p_email character varying, 
        p_direccion character varying, 
        p_password character varying, 
        p_telefono_movil character varying, 
        p_telefono_local character varying, 
        p_fecha_nacimiento date, 
        p_genero character varying
    )
    RETURNS json
    LANGUAGE plpgsql
    AS $$
    DECLARE
        usuario_existe BOOLEAN;
        resultado JSON;
    BEGIN
        -- Validación del género
        IF p_genero NOT IN ('masculino', 'femenino') THEN
            RETURN json_build_object(
                'status', 'error',
                'message', 'Género no válido. Debe ser "masculino" o "femenino"'
            );
        END IF;

        -- Verificación de usuario existente
        SELECT EXISTS(SELECT 1 FROM users WHERE email = p_email) INTO usuario_existe;
        
        IF usuario_existe THEN
            resultado := json_build_object(
                'status', 'error',
                'message', 'El usuario ya está registrado'
            );
        ELSE
            -- Inserción del nuevo usuario
            INSERT INTO users (
                id, nombres, apellidos, email, direccion, password, 
                telefono_movil, telefono_local, fecha_nacimiento, genero, 
                created_at, updated_at
            ) VALUES (
                p_id, p_nombres, p_apellidos, p_email, p_direccion, p_password,
                p_telefono_movil, p_telefono_local, p_fecha_nacimiento, p_genero, 
                NOW(), NOW()
            );
            
            resultado := json_build_object(
                'status', 'success',
                'message', 'Usuario registrado correctamente',
                'user_id', p_id
            );
        END IF;
        
        RETURN resultado;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN json_build_object(
                'status', 'error',
                'message', SQLERRM
            );
    END;
    $$;
  `);
}

export async function down(knex) {
  // Eliminar funciones primero
  await knex.raw(`
    DROP FUNCTION IF EXISTS public.mostrar_usuarios(character varying);
    DROP FUNCTION IF EXISTS public.registra_usuarios(
      integer, character varying, character varying, character varying, 
      character varying, character varying, character varying, 
      character varying, date, character varying
    );
  `);
  
  // Luego eliminar la tabla
  await knex.schema.dropTable('users');
}