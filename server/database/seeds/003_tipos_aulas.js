export async function seed(knex) {
  await knex('tipos_de_aula').del();

  await knex('tipos_de_aula').insert([
    { nombre: 'Teoría', descripcion: 'Aula estándar para clases teóricas.' },
    { nombre: 'Laboratorio', descripcion: 'Espacio para prácticas científicas o técnicas.' },
    { nombre: 'Computación', descripcion: 'Aula equipada con computadoras.' },
    { nombre: 'Audiovisual', descripcion: 'Sala con recursos de proyección y sonido.' },
    { nombre: 'Multifuncional', descripcion: 'Espacio adaptable a distintas actividades.' },
  ]);
}
