export async function seed(knex) {
  await knex('areas_de_conocimiento').del(); // Limpia primero

  await knex('areas_de_conocimiento').insert([
    // Ingeniería/T.S.U. en Informática
    { nombre: 'Programación', descripcion: 'Desarrollo de software y lógica de programación.' },
    { nombre: 'Base de Datos', descripcion: 'Modelado, diseño y administración de bases de datos.' },
    { nombre: 'Redes de Computadoras', descripcion: 'Infraestructura, protocolos y seguridad de redes.' },
    { nombre: 'Sistemas Operativos', descripcion: 'Principios y administración de sistemas operativos.' },
    { nombre: 'Ingeniería de Software', descripcion: 'Procesos de diseño, desarrollo y mantenimiento de software.' },

    // Administración
    { nombre: 'Gestión Empresarial', descripcion: 'Planificación, dirección y control de organizaciones.' },
    { nombre: 'Contabilidad', descripcion: 'Registro y análisis financiero.' },
    { nombre: 'Finanzas', descripcion: 'Gestión de recursos económicos.' },
    { nombre: 'Mercadeo', descripcion: 'Estrategias de venta, publicidad y análisis de mercado.' },
    { nombre: 'Recursos Humanos', descripcion: 'Administración de personal y talento humano.' },

    // Fisioterapia
    { nombre: 'Rehabilitación Física', descripcion: 'Tratamientos físicos para recuperación de movilidad.' },
    { nombre: 'Anatomía Humana', descripcion: 'Estructura del cuerpo humano aplicada a la fisioterapia.' },
    { nombre: 'Kinesiología', descripcion: 'Estudio del movimiento corporal.' },

    // Terapia Ocupacional
    { nombre: 'Terapia Funcional', descripcion: 'Intervención para mejorar habilidades ocupacionales.' },
    { nombre: 'Psicomotricidad', descripcion: 'Relación entre lo psíquico y lo motriz en el desarrollo.' },

    // Deporte
    { nombre: 'Entrenamiento Deportivo', descripcion: 'Planificación y evaluación del rendimiento físico.' },
    { nombre: 'Educación Física', descripcion: 'Formación física integral en contextos educativos.' },
    { nombre: 'Biomecánica', descripcion: 'Estudio del movimiento en el deporte.' },

    // Psicología Social
    { nombre: 'Psicología Comunitaria', descripcion: 'Intervenciones en comunidades y grupos sociales.' },
    { nombre: 'Psicología del Desarrollo', descripcion: 'Evolución del comportamiento humano a lo largo de la vida.' },
    { nombre: 'Teorías de la Personalidad', descripcion: 'Modelos explicativos del comportamiento individual.' },

    // Prevención y Salud para el Trabajo
    { nombre: 'Higiene y Seguridad Industrial', descripcion: 'Prevención de accidentes y enfermedades laborales.' },
    { nombre: 'Ergonomía', descripcion: 'Adaptación del entorno laboral al trabajador.' },
    { nombre: 'Salud Ocupacional', descripcion: 'Promoción de la salud en el entorno de trabajo.' },

    // Educación Inicial
    { nombre: 'Didáctica Infantil', descripcion: 'Estrategias educativas para la infancia.' },
    { nombre: 'Desarrollo Psicomotor', descripcion: 'Desarrollo físico y mental en la infancia.' },
    { nombre: 'Psicología Infantil', descripcion: 'Estudio del comportamiento en la primera infancia.' },

    // Áreas comunes/transversales
    { nombre: 'Matemáticas', descripcion: 'Lógica, aritmética, álgebra, geometría y cálculo.' },
    { nombre: 'Lengua y Literatura', descripcion: 'Análisis y producción de textos, gramática y comprensión.' },
    { nombre: 'Inglés', descripcion: 'Lengua extranjera: comprensión y expresión oral y escrita.' },
    { nombre: 'Filosofía', descripcion: 'Reflexión crítica sobre el pensamiento, la ética y la lógica.' },
    { nombre: 'Política y Sociedad', descripcion: 'Estructura del Estado, ciudadanía y participación.' },
    { nombre: 'Historia de Venezuela', descripcion: 'Evolución política y social del país.' },
    { nombre: 'Metodología de la Investigación', descripcion: 'Técnicas y herramientas para realizar investigaciones académicas.' },
    { nombre: 'Tecnología Educativa', descripcion: 'Uso de herramientas tecnológicas aplicadas a la enseñanza.' },
  ]);
}
