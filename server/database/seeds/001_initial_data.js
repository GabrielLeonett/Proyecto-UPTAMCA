export async function seed(knex) {
  // Borra todos los datos existentes en el orden correcto (considerando relaciones)
  await knex('unidades_curriculares').del();
  await knex('secciones').del();
  await knex('trayectos').del();
  await knex('pnfs').del();
  await knex('roles').del();
  await knex('ubicacion').del();
  await knex('categoria').del();
  await knex('dedicacion').del();
  await knex('profesores').del();
  await knex('users').del();

  // Inserta datos iniciales
  await knex('roles').insert([
    { id_rol: 1,nombre_rol: 'Vicerrector' },
    { id_rol: 2,nombre_rol: 'Director General de Gestión Curricular' }
  ]);

  await knex('ubicacion').insert([
    { id_ubicacion: 1, nombre_ubicacion: 'Núcleo de Humanidades y Ciencias Sociales' },
    { id_ubicacion: 2, nombre_ubicacion: 'Núcleo de Tecnología y Ciencias Administrativas' },
    { id_ubicacion: 3, nombre_ubicacion: 'Núcleo de Salud y Deporte' }
  ]);

  await knex('categoria').insert([
    { id_categoria: 1, nombre_categoria: 'Instructor' },
    { id_categoria: 2, nombre_categoria: 'Asistente' },
    { id_categoria: 3, nombre_categoria: 'Agregado' },
    { id_categoria: 4, nombre_categoria: 'Asociado' },
    { id_categoria: 5, nombre_categoria: 'Titular' },
  ]);

  await knex('dedicacion').insert([
    { id_dedicacion: 1, nombre_dedicacion: 'Convencional' , horas_docencia_semanales: '07:00:00', horas_administrativas_semanales: '00:00:00'},
    { id_dedicacion: 2, nombre_dedicacion: 'Medio Tiempo', horas_docencia_semanales: '12:00:00',horas_administrativas_semanales: '06:00:00' },
    { id_dedicacion: 3, nombre_dedicacion: 'Tiempo Completo', horas_docencia_semanales: '14:00:00', horas_administrativas_semanales: '16:00:00'},
    { id_dedicacion: 4, nombre_dedicacion: 'Exclusivo' , horas_docencia_semanales: '18:00:00',horas_administrativas_semanales: '18:00:00'}
  ]);
}