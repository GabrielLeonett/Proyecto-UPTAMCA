import ProfesorModel from "../models/profesor.model.js";
import validationService from "./validation.service.js";
import FormatResponseModel from "../utils/FormatResponseModel.js";

/**
 * @class ProfesorService
 * @description Contiene la lógica de negocio relacionada con los profesores
 */
export default class ProfesorService {
  /**
   * Registrar un nuevo profesor
   * @param {object} datos - Datos del profesor
   * @param {object} usuario_accion - Usuario que realiza la acción
   */
  static async registrarProfesor(datos, usuario_accion) {
    try {
      // Validar usuario
      validationService.(usuario_accion.id, "ID del usuario en sesión");
      validationService.validarObjeto(usuario_accion, "usuario en sesión");

      // Validar datos del profesor usando el método específico
      const validacion = validationService.validateProfesor(datos);
      
      if (!validacion.isValid) {
        throw new Error(`Datos del profesor inválidos: ${validacion.errors.join(', ')}`);
      }

      // Validar que no haya conflicto con datos existentes (puedes agregar más validaciones aquí)
      await this.validarProfesorUnico(datos.cedula, datos.email);

      // Registrar en el modelo
      const resultado = await ProfesorModel.crear(datos, usuario_accion.id);

      return FormatResponseModel.respuestaPostgres(
        resultado,
        "Profesor registrado exitosamente"
      );
    } catch (error) {
      console.error("Error en registrarProfesor:", error);
      throw FormatResponseModel.respuestaError(
        error,
        "Error al registrar el profesor"
      );
    }
  }

  /**
   * Obtener todos los profesores
   */
  static async obtenerTodosLosProfesores() {
    try {
      const profesores = await ProfesorModel.obtenerTodos();
      
      // Validar que hay datos
      validationService.validarArray(profesores, "profesores");

      return FormatResponseModel.respuestaPostgres(
        profesores,
        "Profesores obtenidos exitosamente"
      );
    } catch (error) {
      console.error("Error en obtenerTodosLosProfesores:", error);
      throw FormatResponseModel.respuestaError(
        error,
        "Error al obtener los profesores"
      );
    }
  }

  /**
   * Obtener profesores con filtros
   * @param {object} filtros - Filtros de búsqueda
   */
  static async obtenerProfesoresConFiltros(filtros) {
    try {
      validationService.validarObjeto(filtros, "filtros");

      // Validar que al menos un filtro esté presente
      const filtrosDisponibles = ['dedicacion', 'categoria', 'ubicacion', 'area', 'fecha', 'genero'];
      const hayFiltros = filtrosDisponibles.some(filtro => 
        filtros[filtro] !== undefined && filtros[filtro] !== null && filtros[filtro] !== ''
      );

      if (!hayFiltros) {
        throw new Error("Se debe proporcionar al menos un filtro válido");
      }

      const profesores = await ProfesorModel.obtenerConFiltros(filtros);
      
      validationService.validarArray(profesores, "profesores filtrados");

      return FormatResponseModel.respuestaPostgres(
        profesores,
        "Profesores filtrados obtenidos exitosamente"
      );
    } catch (error) {
      console.error("Error en obtenerProfesoresConFiltros:", error);
      throw FormatResponseModel.respuestaError(
        error,
        "Error al obtener profesores con filtros"
      );
    }
  }

  /**
   * Buscar profesores por término
   * @param {string} busqueda - Término de búsqueda
   */
  static async buscarProfesores(busqueda) {
    try {
      validationService.validarTexto(busqueda, "término de búsqueda");
      validationService.validarTextoNoVacio(busqueda, "término de búsqueda");

      // Validar longitud mínima de búsqueda
      if (busqueda.length < 2) {
        throw new Error("El término de búsqueda debe tener al menos 2 caracteres");
      }

      const resultados = await ProfesorModel.buscar(busqueda);
      
      validationService.validarArray(resultados, "resultados de búsqueda");

      return FormatResponseModel.respuestaPostgres(
        resultados,
        "Búsqueda de profesores realizada exitosamente"
      );
    } catch (error) {
      console.error("Error en buscarProfesores:", error);
      throw FormatResponseModel.respuestaError(
        error,
        "Error al buscar profesores"
      );
    }
  }

  /**
   * Obtener imagen de un profesor
   * @param {number} idProfesor - ID del profesor
   */
  static async obtenerImagenProfesor(idProfesor) {
    try {
      validationService.validarIdNumerico(idProfesor, "ID del profesor");

      const imagen = await ProfesorModel.obtenerImagen(idProfesor);
      
      validationService.validarArray(imagen, "información de imagen");

      if (imagen.length === 0) {
        throw new Error("No se encontró imagen para el profesor");
      }

      return FormatResponseModel.respuestaPostgres(
        imagen[0],
        "Imagen del profesor obtenida exitosamente"
      );
    } catch (error) {
      console.error("Error en obtenerImagenProfesor:", error);
      throw FormatResponseModel.respuestaError(
        error,
        "Error al obtener la imagen del profesor"
      );
    }
  }

  /**
   * Obtener catálogos de pregrados, posgrados y áreas
   */
  static async obtenerCatalogos() {
    try {
      const [pregrados, posgrados, areas] = await Promise.all([
        ProfesorModel.obtenerPregrados(),
        ProfesorModel.obtenerPosgrados(),
        ProfesorModel.obtenerAreasConocimiento()
      ]);

      validationService.validarArray(pregrados, "pregrados");
      validationService.validarArray(posgrados, "posgrados");
      validationService.validarArray(areas, "áreas de conocimiento");

      const catalogos = {
        pregrados,
        posgrados,
        areasConocimiento: areas
      };

      return FormatResponseModel.respuestaPostgres(
        catalogos,
        "Catálogos obtenidos exitosamente"
      );
    } catch (error) {
      console.error("Error en obtenerCatalogos:", error);
      throw FormatResponseModel.respuestaError(
        error,
        "Error al obtener los catálogos"
      );
    }
  }

  /**
   * Registrar disponibilidad docente
   * @param {object} datos - Datos de disponibilidad
   * @param {object} usuario_accion - Usuario que realiza la acción
   */
  static async registrarDisponibilidad(datos, usuario_accion) {
    try {
      validationService.validarIdNumerico(usuario_accion.id, "ID del usuario en sesión");
      
      // Validar datos de disponibilidad
      this.validarDatosDisponibilidad(datos);

      const resultado = await ProfesorModel.crearDisponibilidad(datos, usuario_accion.id);

      return FormatResponseModel.respuestaPostgres(
        resultado,
        "Disponibilidad docente registrada exitosamente"
      );
    } catch (error) {
      console.error("Error en registrarDisponibilidad:", error);
      throw FormatResponseModel.respuestaError(
        error,
        "Error al registrar la disponibilidad docente"
      );
    }
  }

  /**
   * Actualizar información de un profesor
   * @param {object} datos - Datos actualizados
   * @param {object} usuario_accion - Usuario que realiza la acción
   */
  static async actualizarProfesor(datos, usuario_accion) {
    try {
      validationService.validarIdNumerico(usuario_accion.id, "ID del usuario en sesión");
      validationService.validarIdNumerico(datos.id_profesor, "ID del profesor");

      // Validar datos parciales usando el método específico
      const validacion = validationService.validatePartialProfesor(datos);
      
      if (!validacion.isValid) {
        throw new Error(`Datos de actualización inválidos: ${validacion.errors.join(', ')}`);
      }

      // Validar que haya al menos un campo para actualizar
      const camposActualizables = [
        'nombres', 'apellidos', 'email', 'direccion', 'password',
        'telefono_movil', 'telefono_local', 'fecha_nacimiento', 'genero',
        'nombre_categoria', 'nombre_dedicacion', 'pre_grado', 'pos_grado',
        'area_de_conocimiento', 'imagen', 'municipio', 'fecha_ingreso'
      ];

      const hayCamposParaActualizar = camposActualizables.some(
        campo => datos[campo] !== undefined && datos[campo] !== null
      );

      if (!hayCamposParaActualizar) {
        throw new Error("Se debe proporcionar al menos un campo para actualizar");
      }

      const resultado = await ProfesorModel.actualizar(datos, usuario_accion.id);

      return FormatResponseModel.respuestaPostgres(
        resultado,
        "Profesor actualizado exitosamente"
      );
    } catch (error) {
      console.error("Error en actualizarProfesor:", error);
      throw FormatResponseModel.respuestaError(
        error,
        "Error al actualizar el profesor"
      );
    }
  }

  /**
   * Eliminar/destituir un profesor
   * @param {object} datos - Datos de eliminación
   * @param {object} usuario_accion - Usuario que realiza la acción
   */
  static async eliminarProfesor(datos, usuario_accion) {
    try {
      validationService.validarIdNumerico(usuario_accion.id, "ID del usuario en sesión");
      validationService.validarIdNumerico(datos.id_profesor, "ID del profesor");

      // Validar datos de eliminación
      this.validarDatosEliminacion(datos);

      const resultado = await ProfesorModel.eliminar(datos, usuario_accion.id);

      return FormatResponseModel.respuestaPostgres(
        resultado,
        "Profesor eliminado/destituido exitosamente"
      );
    } catch (error) {
      console.error("Error en eliminarProfesor:", error);
      throw FormatResponseModel.respuestaError(
        error,
        "Error al eliminar/destituir el profesor"
      );
    }
  }

  /**
   * Crear nuevo pregrado
   * @param {object} datos - Datos del pregrado
   * @param {object} usuario_accion - Usuario que realiza la acción
   */
  static async crearPregrado(datos, usuario_accion) {
    try {
      validationService.validarIdNumerico(usuario_accion.id, "ID del usuario en sesión");
      
      // Validar datos del pregrado
      validationService.validarObjeto(datos, "datos del pregrado");
      validationService.validarTexto(datos.nombre, "Nombre del pregrado");
      validationService.validarTexto(datos.tipo, "Tipo de pregrado");

      const resultado = await ProfesorModel.crearPregrado(datos, usuario_accion.id);

      return FormatResponseModel.respuestaPostgres(
        resultado,
        "Pregrado creado exitosamente"
      );
    } catch (error) {
      console.error("Error en crearPregrado:", error);
      throw FormatResponseModel.respuestaError(
        error,
        "Error al crear el pregrado"
      );
    }
  }

  /**
   * Crear nuevo posgrado
   * @param {object} datos - Datos del posgrado
   * @param {object} usuario_accion - Usuario que realiza la acción
   */
  static async crearPosgrado(datos, usuario_accion) {
    try {
      validationService.validarIdNumerico(usuario_accion.id, "ID del usuario en sesión");
      
      // Validar datos del posgrado
      validationService.validarObjeto(datos, "datos del posgrado");
      validationService.validarTexto(datos.nombre, "Nombre del posgrado");
      validationService.validarTexto(datos.tipo, "Tipo de posgrado");

      const resultado = await ProfesorModel.crearPosgrado(datos, usuario_accion.id);

      return FormatResponseModel.respuestaPostgres(
        resultado,
        "Posgrado creado exitosamente"
      );
    } catch (error) {
      console.error("Error en crearPosgrado:", error);
      throw FormatResponseModel.respuestaError(
        error,
        "Error al crear el posgrado"
      );
    }
  }

  /**
   * Crear nueva área de conocimiento
   * @param {object} datos - Datos del área de conocimiento
   * @param {object} usuario_accion - Usuario que realiza la acción
   */
  static async crearAreaConocimiento(datos, usuario_accion) {
    try {
      validationService.validarIdNumerico(usuario_accion.id, "ID del usuario en sesión");
      
      // Validar datos del área de conocimiento
      validationService.validarObjeto(datos, "datos del área de conocimiento");
      validationService.validarTexto(datos.area_conocimiento, "Nombre del área de conocimiento");

      const resultado = await ProfesorModel.crearAreaConocimiento(datos, usuario_accion.id);

      return FormatResponseModel.respuestaPostgres(
        resultado,
        "Área de conocimiento creada exitosamente"
      );
    } catch (error) {
      console.error("Error en crearAreaConocimiento:", error);
      throw FormatResponseModel.respuestaError(
        error,
        "Error al crear el área de conocimiento"
      );
    }
  }

  // =============================================
  // MÉTODOS PRIVADOS DE VALIDACIÓN
  // =============================================

  /**
   * Validar que el profesor sea único (por cédula y email)
   * @param {string} cedula 
   * @param {string} email 
   */
  static async validarProfesorUnico(cedula, email) {
    try {
      // Buscar por cédula
      const porCedula = await ProfesorModel.buscar(cedula);
      if (porCedula.length > 0) {
        throw new Error("Ya existe un profesor con esta cédula");
      }

      // Buscar por email
      const porEmail = await ProfesorModel.buscar(email);
      if (porEmail.length > 0) {
        throw new Error("Ya existe un profesor con este email");
      }
    } catch (error) {
      // Si el error es por no encontrar resultados, está bien
      if (!error.message.includes("Ya existe")) {
        // Si es otro tipo de error, lo relanzamos
        throw error;
      }
      throw error;
    }
  }

  /**
   * Validar datos de disponibilidad
   * @param {object} datos 
   */
  static validarDatosDisponibilidad(datos) {
    validationService.validarObjeto(datos, "datos de disponibilidad");

    const camposRequeridos = ['id_profesor', 'dia_semana', 'hora_inicio', 'hora_fin'];
    
    camposRequeridos.forEach(campo => {
      if (datos[campo] === undefined || datos[campo] === null) {
        throw new Error(`El campo ${campo} es requerido para la disponibilidad`);
      }
    });

    validationService.validarIdNumerico(datos.id_profesor, "ID profesor para disponibilidad");
    validationService.validarTexto(datos.dia_semana, "Día de la semana");
    validationService.validarHora(datos.hora_inicio, "Hora de inicio de disponibilidad");
    validationService.validarHora(datos.hora_fin, "Hora de fin de disponibilidad");

    // Validar que hora fin sea mayor que hora inicio
    const horaInicio = new Date(`2000-01-01T${datos.hora_inicio}`);
    const horaFin = new Date(`2000-01-01T${datos.hora_fin}`);
    
    if (horaFin <= horaInicio) {
      throw new Error("La hora de fin debe ser mayor a la hora de inicio en la disponibilidad");
    }
  }

  /**
   * Validar datos de eliminación
   * @param {object} datos 
   */
  static validarDatosEliminacion(datos) {
    validationService.validarObjeto(datos, "datos de eliminación");

    const camposRequeridos = ['tipo_accion', 'razon', 'fecha_efectiva'];
    
    camposRequeridos.forEach(campo => {
      if (datos[campo] === undefined || datos[campo] === null) {
        throw new Error(`El campo ${campo} es requerido para la eliminación`);
      }
    });

    validationService.validarTexto(datos.tipo_accion, "Tipo de acción");
    validationService.validarTexto(datos.razon, "Razón de eliminación");
    validationService.validarFecha(datos.fecha_efectiva, "Fecha efectiva de eliminación");

    // Validar que la fecha efectiva no sea en el pasado
    const fechaEfectiva = new Date(datos.fecha_efectiva);
    const hoy = new Date();
    if (fechaEfectiva < hoy) {
      throw new Error("La fecha efectiva no puede ser en el pasado");
    }
  }
}