import {hashPassword} from '../../utils/encrypted.js'

export async function seed(knex) {
  // Borra todos los datos existentes en el orden correcto (considerando relaciones)
  await knex("horarios").del();
  await knex("unidades_curriculares").del();
  await knex("secciones").del();
  await knex("trayectos").del();
  await knex("turnos").del();
  await knex("pnfs").del();
  await knex("profesores").del();
  await knex("roles").del();
  await knex("sedes").del();
  await knex("categorias").del();
  await knex("dedicaciones").del();
  await knex("users").del();
  await knex("tipos_pre_grado").del();
  await knex("tipos_post_grado").del();

  await knex("users").insert({
    cedula: 999999999,
    nombres: "Super",
    apellidos: "Administrador",
    direccion: "Servidor Principal",
    password: await hashPassword("12345678"),
    telefono_movil: "04141234567",
    telefono_local: null,
    fecha_nacimiento: "1985-01-01",
    genero: "masculino",
    email: "superadmin@uptamca.ve",
    activo: true,
    last_login: knex.fn.now(),
    created_at: knex.fn.now(),
    updated_at: knex.fn.now(),
  });

  // Inserta datos iniciales
  await knex("roles").insert([
    { id_rol: 1, nombre_rol: "Vicerrector" },
    { id_rol: 2, nombre_rol: "Director General de Gestión Curricular" },
    { id_rol: 3, nombre_rol: "Profesor" },
    { id_rol: 4, nombre_rol: "Coordinador" },
    { id_rol: 20, nombre_rol: "SuperAdmin" },
  ]);

  await knex("usuario_rol").insert([
    { usuario_id: 999999999, rol_id: 20 },
  ]);

  await knex("sedes").insert([
    {
      id_sede: 1,
      nombre_sede: "Núcleo de Humanidades y Ciencias Sociales",
    },
    {
      id_sede: 2,
      nombre_sede: "Núcleo de Tecnología y Ciencias Administrativas",
    },
    { id_sede: 3, nombre_sede: "Núcleo de Salud y Deporte" },
  ]);

  await knex("categorias").insert([
    { id_categoria: 1, nombre_categoria: "Instructor" },
    { id_categoria: 2, nombre_categoria: "Asistente" },
    { id_categoria: 3, nombre_categoria: "Agregado" },
    { id_categoria: 4, nombre_categoria: "Asociado" },
    { id_categoria: 5, nombre_categoria: "Titular" },
  ]);

  await knex("tipos_pre_grado").insert([
    { id_tipo_pre_grado: 1,nombre_tipo_pre_grado: "TSU" },
    { id_tipo_pre_grado: 2,nombre_tipo_pre_grado: "Licenciatura" },
    { id_tipo_pre_grado: 3,nombre_tipo_pre_grado: "Ingeniería" },
    { id_tipo_pre_grado: 4,nombre_tipo_pre_grado: "Arquitectura" },
    { id_tipo_pre_grado: 5,nombre_tipo_pre_grado: "Medicina" },
    { id_tipo_pre_grado: 6,nombre_tipo_pre_grado: "Odontología" },
    { id_tipo_pre_grado: 7,nombre_tipo_pre_grado: "Veterinaria" },
    { id_tipo_pre_grado: 8,nombre_tipo_pre_grado: "Educación" },
    { id_tipo_pre_grado: 9,nombre_tipo_pre_grado: "Abogacía" },
    { id_tipo_pre_grado: 10,nombre_tipo_pre_grado: "Contaduría Pública" }
  ]);

  await knex("tipos_post_grado").insert([
    { id_tipo_post_grado: 1,nombre_tipo_post_grado: "Especialización" },
    { id_tipo_post_grado: 2,nombre_tipo_post_grado: "Maestría" },
    { id_tipo_post_grado: 3,nombre_tipo_post_grado: "Doctorado" },
    { id_tipo_post_grado: 4,nombre_tipo_post_grado: "Diplomado" },       // No es título académico oficial, pero se ofrece comúnmente
    { id_tipo_post_grado: 5,nombre_tipo_post_grado: "Postdoctorado" }
  ]);

  await knex("turnos").insert([
    { 
        id_turno: 1, 
        nombre_turno: "Matutino",
        inicio_hora: '07:00:00',
        fin_hora: '12:15:00', 
        created_at: knex.fn.now(), 
        updated_at: knex.fn.now()
    },
    { 
        id_turno: 2, 
        nombre_turno: "Vespertino",  
        inicio_hora: '12:30:00',
        fin_hora: '18:00:00',
        created_at: knex.fn.now(), 
        updated_at: knex.fn.now()
    },
    { 
        id_turno: 3, 
        nombre_turno: "Nocturno",
        inicio_hora: '18:00:00',
        fin_hora: '21:30:00',
        created_at: knex.fn.now(), 
        updated_at: knex.fn.now()
    }
]);

  await knex("dedicaciones").insert([
    {
      id_dedicacion: 1,
      nombre_dedicacion: "Convencional",
      horas_docencia_semanales: "07:00:00",
      horas_administrativas_semanales: "00:00:00",
    },
    {
      id_dedicacion: 2,
      nombre_dedicacion: "Medio Tiempo",
      horas_docencia_semanales: "12:00:00",
      horas_administrativas_semanales: "06:00:00",
    },
    {
      id_dedicacion: 3,
      nombre_dedicacion: "Tiempo Completo",
      horas_docencia_semanales: "14:00:00",
      horas_administrativas_semanales: "16:00:00",
    },
    {
      id_dedicacion: 4,
      nombre_dedicacion: "Exclusivo",
      horas_docencia_semanales: "18:00:00",
      horas_administrativas_semanales: "18:00:00",
    },
  ]);
}
