export async function seed(knex) {
  // Borra todos los datos existentes en el orden correcto (considerando relaciones)
  await knex('r_unidad_curricular_seccion').del();
  await knex('unidad_curricular').del();
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
    { id: 1, tipo_rol: 1, nombre_rol: 'Vicerrector' },
    { id: 2, tipo_rol: 2, nombre_rol: 'Segundo Al Mando' },
    { id: 3, tipo_rol: 3, nombre_rol: 'Tercer Al Mando' }
  ]);

  await knex('ubicacion').insert([
    { id: 1, nombre_ubicacion: 'Núcleo de Humanidades y Ciencias Sociales' },
    { id: 2, nombre_ubicacion: 'Núcleo de Tegnología y Ciencias Administrativas' },
    { id: 3, nombre_ubicacion: 'Núcleo de Salud y Deporte' }
  ]);

  await knex('categoria').insert([
    { id: 1, nombre_categoria: 'Instructor' },
    { id: 2, nombre_categoria: 'Asistente' },
    { id: 3, nombre_categoria: 'Agregado' },
    { id: 4, nombre_categoria: 'Asociado' },
    { id: 5, nombre_categoria: 'Titular' },
  ]);

  await knex('dedicacion').insert([
    { id: 1, nombre_dedicacion: 'Convencional' },
    { id: 2, nombre_dedicacion: 'Medio Tiempo' },
    { id: 3, nombre_dedicacion: 'Tiempo Completo' },
    { id: 4, nombre_dedicacion: 'Exclusivo' }
  ]);
}