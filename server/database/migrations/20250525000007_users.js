export async function up(knex) {
  // Iniciar transacción para operaciones atómicas
  await knex.transaction(async (trx) => {
    // 1. Crear tabla users con estructura mejorada
    await trx.schema.createTable("users", (table) => {
      table.increments("id").primary();
      table.string("nombres", 50).notNullable();
      table.string("apellidos", 50).notNullable();
      table.string("direccion", 200).notNullable();
      table.string("password", 100).notNullable();
      table.string("telefono_movil", 15).notNullable();
      table.string("telefono_local", 15);
      table.date("fecha_nacimiento").notNullable();
      table.enu("genero", ["masculino", "femenino", "otro"]).notNullable();
      table.string("email", 100).unique().notNullable();
      table.boolean("activo").defaultTo(true);
      table.timestamp("last_login");
      table.timestamps(true, true);

      // Índices para mejor rendimiento
      table.index(["email"], "idx_users_email");
      table.index(["nombres", "apellidos"], "idx_users_nombre_completo");
    });
    
  });

  await knex.raw(`
    CREATE FUNCTION public.mostrar_usuarios(p_email character varying) RETURNS json
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
              RETURN json_build_object('status', 'error', 'message', 'Usuario no encontrado');
          END IF;
          
          -- Verificar roles
          SELECT EXISTS(SELECT 1 FROM profesores WHERE id_cedula = v_id_usuario) INTO v_es_profesor;
          SELECT EXISTS(SELECT 1 FROM coordinadores WHERE id_cedula = v_id_usuario) INTO v_es_coordinador;
          SELECT EXISTS(SELECT 1 FROM administradores WHERE id_cedula = v_id_usuario) INTO v_es_administrador;
          
          -- Construir array de roles
          v_roles := ARRAY[]::TEXT[];
          IF v_es_profesor THEN v_roles := array_append(v_roles, 'profesor'); END IF;
          IF v_es_coordinador THEN v_roles := array_append(v_roles, 'coordinador'); END IF;
          IF v_es_administrador THEN v_roles := array_append(v_roles, 'administrador'); END IF;
          
          -- Retornar resultado combinado
          RETURN json_build_object(
              'status', 'success',
              'usuario', v_usuario,
              'roles', v_roles
          );
      END;
      $$;

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
          INSERT INTO users (id, nombres, apellidos, email, direccion, password, telefono_movil, telefono_local, fecha_nacimiento, genero, created_at, updated_at)
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

    `);
}

export async function down(knex) {
  // Eliminar en orden inverso con transacción
  await knex.transaction(async (trx) => {
    await trx.raw(`
      DROP FUNCTION IF EXISTS public.autenticar_usuario;
      DROP PROCEDURE IF EXISTS public.registrar_usuario;
      DROP FUNCTION IF EXISTS public.obtener_usuario_completo;
    `);
    await trx.schema.dropTableIfExists("users");
  });
}