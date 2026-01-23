// utils/envLoader.js
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Carga las variables de entorno desde el archivo correspondiente al entorno actual
 * @returns {Object} Objeto con las variables de entorno cargadas
 * @example
 * // Carga .env.development o .env.production según NODE_ENV
 * const env = loadEnv();
 * console.log(env.DB_PASSWORD);
 */
export function loadEnv() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const env = process.env.NODE_ENV || "development";
  const envFile = path.resolve(__dirname, `../.env.${env}`);

  // Cargar y verificar
  const result = dotenv.config({ path: envFile });

  if (result.error) {
    console.error("Error loading .env file:", result.error);
    throw result.error;
  }
}

/**
 * Convierte una variable a string en minúsculas si es de tipo string
 * @param {*} variable - Variable a convertir
 * @returns {string|undefined} String en minúsculas o undefined si no es string
 * @example
 * asegurarStringEnMinusculas("HOLA"); // "hola"
 * asegurarStringEnMinusculas(123); // undefined
 */
export function asegurarStringEnMinusculas(variable) {
  if (typeof variable === "string") {
    return variable.toLowerCase();
  }
}

/**
 * Parsea un campo que puede ser JSON string, array u otro tipo a array
 * @param {*} field - Campo a parsear (string JSON, array, u otro tipo)
 * @param {string} fieldName - Nombre del campo para mensajes de error
 * @returns {Array} Array parseado
 * @throws {Error} Si el formato del campo es inválido
 * @example
 * parseJSONField('["a", "b"]', 'tags'); // ["a", "b"]
 * parseJSONField(["a", "b"], 'tags'); // ["a", "b"]
 * parseJSONField("texto", 'tags'); // Error
 */
export const parseJSONField = (field, fieldName) => {
  if (!field) return [];

  try {
    // Si ya es un array, retornarlo directamente
    if (Array.isArray(field)) {
      return field;
    }

    // Si es string, parsearlo
    if (typeof field === "string") {
      const parsed = JSON.parse(field);
      console.log("Parsed field:", parsed);
      return Array.isArray(parsed) ? parsed : [parsed];
    }

    // Si es otro tipo, convertirlo a array
    return [field];
  } catch (error) {
    console.error(`❌ Error parseando ${fieldName}:`, error);
    throw new Error(`Formato inválido en ${fieldName}`);
  }
};

export function convertToPostgresArray(input) {
  console.log("Input recibido:", input);
  console.log("Tipo del input:", typeof input);

  if (!input) return "{}";

  let array;

  // Si ya es un array, usarlo directamente
  if (Array.isArray(input)) {
    array = input;
  }
  // Si es un string, intentar parsearlo como JSON
  else if (typeof input === "string") {
    try {
      array = JSON.parse(input);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return "{}";
    }
  }
  // Si es otro tipo, convertirlo a array
  else {
    array = [input];
  }

  // Validar que sea un array
  if (!Array.isArray(array) || array.length === 0) {
    return "{}";
  }

  // Convertir a formato PostgreSQL: {element1,element2,element3}
  const postgresFormat = `{${array.map((item) => `"${item}"`).join(",")}}`;
  console.log("Formato PostgreSQL:", postgresFormat);
  return postgresFormat;
}

/**
 *
 * @param {string} cookieHeader Objeto Cookie
 * @param {string} cookieName Nombre de la cookie que se desea obtener
 * @returns {string} valor de la cookie
 * @example
 * const token = getCookie(socket.handshake.headers.cookie, 'autorization');
 */
export function getCookie(cookieHeader, cookieName) {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";");
  const cookie = cookies.find((c) => c.trim().startsWith(`${cookieName}=`));

  return cookie ? cookie.split("=")[1].trim() : null;
}

/**
 * @module UTILS
 * @description Módulo de utilidades para manejo de horarios académicos
 * Proporciona funciones para conversión de formatos, cálculos de tiempo,
 * manejo de días de la semana y operaciones con horarios académicos.
 */

export const UTILS = {
  /**
   * Obtiene el ID numérico de un día de la semana a partir de su nombre
   * @param {string} dia - Nombre del día (ej: "lunes", "Martes", "MIÉRCOLES")
   * @returns {number} ID del día (0-5) o -1 si no se encuentra
   * @example
   * obtenerDiaId("lunes") // returns 0
   * obtenerDiaId("Sábado") // returns 5
   * obtenerDiaId("domingo") // returns -1
   */
  obtenerDiaId: (dia) => {
    const dias = [
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sábado",
    ];
    return dias.indexOf(dia.toLowerCase());
  },

  obtenerTurno: (turno) => {
    const horaInicioHHMM = UTILS.deshacerHora24(turno.hora_inicio);
    const horaFinHHMM = UTILS.deshacerHora24(turno.hora_fin);

    return { horaInicioHHMM, horaFinHHMM };
  },

  /**
   * Convierte una duración en formato HH:MM:SS a minutos totales y segundos totales
   * @param {string} duracionString - Duración en formato "HH:MM:SS", "MM:SS" o "HH:MM"
   * @returns {Object} Objeto con minutosTotales y segundosTotales
   * @throws {Error} Si el formato es inválido o contiene valores no numéricos
   * @example
   * convertirDuracion("01:30:00") // returns { minutosTotales: 90, segundosTotales: 5400 }
   * convertirDuracion("30:00")    // returns { minutosTotales: 30, segundosTotales: 1800 }
   * convertirDuracion("01:30")    // returns { minutosTotales: 90, segundosTotales: 5400 }
   */
  convertirDuracion: (duracionString) => {
    if (typeof duracionString !== "string") {
      throw new Error('El parámetro debe ser un string en formato "HH:MM:SS"');
    }

    const partes = duracionString.split(":");

    let horas = 0;
    let minutos = 0;
    let segundos = 0;

    // Manejar diferentes formatos: HH:MM:SS, MM:SS, HH:MM
    if (partes.length === 3) {
      // Formato HH:MM:SS
      [horas, minutos, segundos] = partes.map(Number);
    } else if (partes.length === 2) {
      // Formato MM:SS o HH:MM (asumimos MM:SS si el primer número es < 60)
      const primerValor = parseInt(partes[0]);
      if (primerValor < 60) {
        // Formato MM:SS
        [minutos, segundos] = partes.map(Number);
      } else {
        // Formato HH:MM
        [horas, minutos] = partes.map(Number);
      }
    } else {
      throw new Error('Formato inválido. Use "HH:MM:SS", "MM:SS" o "HH:MM"');
    }

    // Validar valores
    if ([horas, minutos, segundos].some(isNaN)) {
      throw new Error("Todos los valores deben ser números válidos");
    }

    // Calcular totales
    const minutosTotales = horas * 60 + minutos;
    const segundosTotales = horas * 3600 + minutos * 60 + segundos;

    return {
      minutosTotales,
      segundosTotales,
    };
  },

  /**
   * Obtiene el nombre del día de la semana a partir de su ID numérico
   * @param {number} id - ID del día (0-5)
   * @returns {string} Nombre del día o string vacío si el ID es inválido
   * @example
   * obtenerDiaNombre(0) // returns "Lunes"
   * obtenerDiaNombre(5) // returns "Sábado"
   * obtenerDiaNombre(6) // returns ""
   */
  obtenerDiaNombre: (id) => {
    const dias = [
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    return dias[id] || "";
  },

  /**
   * Suma múltiplos de 45 minutos a una hora en formato militar (HHMM)
   * @param {number|string} horaMilitar - Hora en formato HHMM (ej: 730, 1430)
   * @param {number} multiplicar - Número de bloques de 45 minutos a sumar
   * @returns {string} Nueva hora en formato HHMM con padding de ceros
   * @example
   * sumar45Minutos(700, 1)  // returns "0745"
   * sumar45Minutos(700, 2)  // returns "0830"
   * sumar45Minutos(2330, 1) // returns "0015" (overflow a siguiente día)
   */
  sumar45Minutos: (horaMilitar, multiplicar) => {
    const tiempo = parseInt(horaMilitar, 10);
    const horas = Math.floor(tiempo / 100);
    const minutos = tiempo % 100;
    const totalMinutos = horas * 60 + minutos;
    const nuevoTotalMinutos = totalMinutos + 45 * multiplicar;
    let nuevasHoras = Math.floor(nuevoTotalMinutos / 60);
    const nuevosMinutos = nuevoTotalMinutos % 60;

    if (nuevasHoras >= 24) nuevasHoras -= 24;

    const resultado = nuevasHoras * 100 + nuevosMinutos;
    return resultado.toString().padStart(4, "0");
  },

  /**
   * Suma múltiplos de 45 minutos a una hora y retorna en formato HH:MM:SS
   * @param {number|string} horaMilitar - Hora en formato HHMM
   * @param {number} multiplicar - Número de bloques de 45 minutos a sumar
   * @returns {string} Nueva hora en formato HH:MM:SS
   * @example
   * sumar45MinutosHHMM(700, 1)  // returns "07:45:00"
   * sumar45MinutosHHMM(700, 2)  // returns "08:30:00"
   */
  sumar45MinutosHHMM: (horaMilitar, multiplicar) => {
    const tiempo = parseInt(horaMilitar, 10);
    const horas = Math.floor(tiempo / 100);
    const minutos = tiempo % 100;
    const totalMinutos = horas * 60 + minutos;
    const nuevoTotalMinutos = totalMinutos + 45 * multiplicar;

    let nuevasHoras = Math.floor(nuevoTotalMinutos / 60);
    const nuevosMinutos = nuevoTotalMinutos % 60;

    // Manejar overflow de horas (más de 24 horas)
    if (nuevasHoras >= 24) {
      nuevasHoras = nuevasHoras % 24;
    }

    // Formatear correctamente a HH:MM
    const horasFormateadas = nuevasHoras.toString().padStart(2, "0");
    const minutosFormateados = nuevosMinutos.toString().padStart(2, "0");

    const resultado = `${horasFormateadas}:${minutosFormateados}:00`;

    console.log("Resultado formateado:", resultado);
    return resultado;
  },

  /**
   * Formatea una hora militar (HHMM) a formato 12-horas con AM/PM
   * @param {number} horaMilitar - Hora en formato HHMM
   * @returns {string} Hora formateada (ej: "7:00 AM", "2:30 PM")
   * @example
   * formatearHora(700)   // returns "7:00 AM"
   * formatearHora(1430)  // returns "2:30 PM"
   * formatearHora(0)     // returns "12:00 AM"
   */
  formatearHora: (horaMilitar) => {
    const horas = Math.floor(horaMilitar / 100);
    const minutos = horaMilitar % 100;
    const periodo = horas >= 12 ? "PM" : "AM";
    const horas12 = horas > 12 ? horas - 12 : horas === 0 ? 12 : horas;

    return `${horas12}:${String(minutos).padStart(2, "0")} ${periodo}`;
  },

  /**
   * Formatea una hora militar (HHMM) a formato HH:MM:SS en sistema 12-horas
   * @param {number} horaMilitar - Hora en formato HHMM
   * @returns {string} Hora formateada (ej: "07:00:00", "02:30:00")
   * @example
   * formatearHoraMilitar(700)  // returns "07:00:00"
   * formatearHoraMilitar(1430) // returns "02:30:00"
   */
  formatearHoraMilitar: (horaMilitar) => {
    const horas = Math.floor(horaMilitar / 100);
    const minutos = horaMilitar % 100;
    const horas12 = horas > 12 ? horas - 12 : horas === 0 ? 12 : horas;
    const ceroAñadido = horas > 9 ? "" : "0";

    return `${ceroAñadido}${horas12}:${String(minutos).padStart(2, "0")}:00`;
  },

  /**
   * Convierte una hora en formato HH:MM:SS a formato militar numérico (HHMM)
   * @param {string} hora24 - Hora en formato "HH:MM:SS" o "HH:MM"
   * @returns {number} Hora en formato militar HHMM
   * @example
   * deshacerHora24("07:00:00") // returns 700
   * deshacerHora24("14:30:00") // returns 1430
   * deshacerHora24("00:30:00") // returns 30
   */
  deshacerHora24: (hora24) => {
    // Dividimos el string por los dos puntos para obtener las partes
    const [horas, minutos] = hora24.split(":");

    // Convertimos a número: (horas * 100) + minutos
    // Usamos Number() para asegurar que la suma sea aritmética y no una concatenación
    return Number(horas) * 100 + Number(minutos);
  },

  /**
   * Formatea una hora militar (HHMM) a formato 24-horas HH:MM:SS
   * @param {number} horaMilitar - Hora en formato HHMM
   * @returns {string} Hora formateada en 24-horas
   * @example
   * formatearHora24(700)   // returns "07:00:00"
   * formatearHora24(1430)  // returns "14:30:00"
   * formatearHora24(30)    // returns "00:30:00"
   */
  formatearHora24: (horaMilitar) => {
    const horas = Math.floor(horaMilitar / 100);
    const minutos = horaMilitar % 100;
    const horasStr = horas.toString().padStart(2, "0");
    const minutosStr = minutos.toString().padStart(2, "0");
    return `${horasStr}:${minutosStr}:00`;
  },

  /**
   * Convierte un trayecto romano (I, II, III, etc.) a número arábigo
   * @param {string} trayecto - Trayecto en números romanos
   * @returns {number} Número del trayecto o 1 por defecto
   * @example
   * obtenerTrayectoNumero("I")    // returns 1
   * obtenerTrayectoNumero("IV")   // returns 4
   * obtenerTrayectoNumero("VII")  // returns 1 (no existe)
   */
  obtenerTrayectoNumero(trayecto) {
    const trayectos = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6 };
    return trayectos[trayecto] || 1;
  },

  /**
   * Convierte horas y minutos a minutos totales
   * @param {number|string} h - Horas
   * @param {number|string} m - Minutos
   * @returns {number} Minutos totales
   * @example
   * horasMinutos(1, 30) // returns 90
   * horasMinutos("2", "15") // returns 135
   */
  horasMinutos(h, m) {
    return parseInt(h) * 60 + parseInt(m);
  },

  /**
   * Convierte minutos totales a formato HHMM
   * @param {number} minutos - Minutos totales
   * @returns {number} Hora en formato HHMM
   * @example
   * calcularHorasHHMM(90)   // returns 130 (1:30)
   * calcularHorasHHMM(135)  // returns 215 (2:15)
   * calcularHorasHHMM(60)   // returns 100 (1:00)
   */
  calcularHorasHHMM(minutos) {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return h * 100 + m;
  },

  /**
   * Expande un rango de horas en bloques individuales de 45 minutos, excluyendo horas marcadas como "ignorar"
   * @param {number} inicio_hora - Hora de inicio en formato HHMM
   * @param {number} fin_hora - Hora de fin en formato HHMM
   * @returns {number[]} Array de horas HHMM disponibles en el rango
   * @example
   * RangoHorasSeguidasDisponibilidad(700, 930)
   * // returns [700, 745, 845] (excluye 830 que es "ignorar")
   */
  RangoHorasSeguidasDisponibilidad(inicio_hora, fin_hora) {
    const bloques = [];

    Object.keys(UTILS.initialHours).forEach((hora) => {
      // Verificar que la hora esté dentro del rango Y no sea "ignorar"
      if (
        hora >= inicio_hora &&
        hora < fin_hora &&
        typeof UTILS.initialHours[hora] !== "string"
      ) {
        bloques.push(hora);
      }
    });

    return bloques;
  },

  /**
   * @constant {string[]} horariosAcademicos - Lista de horarios académicos en formato HH:MM
   * Representa todos los posibles inicios de bloques de 45 minutos en el sistema
   */
  horariosAcademicos: [
    "07:00",
    "07:45",
    "08:30",
    "08:45",
    "09:30",
    "10:15",
    "10:20",
    "11:05",
    "11:50",
    "13:00",
    "13:45",
    "14:00",
    "14:10",
    "14:55",
    "15:40",
    "15:50",
    "16:35",
    "17:20",
    "17:30",
    "18:15",
    "19:00",
    "19:45",
    "20:30",
  ],

  /**
   * @constant {string[]} diasSemana - Nombres de los días de la semana laboral
   */
  diasSemana: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],

  /**
   * @constant {Object} initialHours - Mapa de horas académicas con su estado
   * @property {null|"ignorar"} value - null: hora disponible, "ignorar": hora no disponible para clases
   * @description Estructura que define todas las horas académicas del sistema.
   * Las horas marcadas como "ignorar" representan espacios entre bloques académicos
   * que no pueden ser utilizados para programar clases (ej: recesos, cambios de turno).
   */
  initialHours: {
    700: null,
    745: null,
    830: "Desayuno",
    845: null,
    930: null,
    1015: "Receso",
    1020: null,
    1105: null,
    1150: "Almuerzo",
    1300: null,
    1345: null,
    1400: "Receso",
    1410: null,
    1455: null,
    1540: "Receso",
    1550: null,
    1635: null,
    1720: "Receso",
    1730: null,
    1815: null,
    1900: null,
    1945: null,
    2030: null,
  },

  /**
   * Encuentra la hora final después de saltar un número específico de bloques, omitiendo horas "ignorar"
   * @param {number} horaInicial - Hora de inicio en formato HHMM
   * @param {number} bloquesNecesarios - Número de bloques de clase necesarios
   * @returns {number|null} Última hora ocupada en formato HHMM o null si no hay suficientes horas
   * @example
   * obtenerSiguienteHoraValida(700, 2)
   * // returns 845 (700 → 745 → [830 ignorar] → 845)
   */
  obtenerSiguienteHoraValida: (horaInicial, bloquesNecesarios) => {
    const horasOrdenadas = Object.keys(UTILS.initialHours)
      .map(Number)
      .sort((a, b) => a - b);

    // Encontrar el índice de la hora inicial
    let indiceInicio = horasOrdenadas.indexOf(horaInicial);
    if (indiceInicio === -1) return null;

    // Contar bloques necesarios, saltando horas "ignorar"
    let contadorBloques = 0;
    let indiceActual = indiceInicio;

    while (
      contadorBloques < bloquesNecesarios &&
      indiceActual < horasOrdenadas.length - 1
    ) {
      const horaActual = horasOrdenadas[indiceActual];

      // Si la hora actual no es "ignorar", contar como bloque válido
      if (UTILS.initialHours[horaActual] !== typeof String) {
        contadorBloques++;
      }

      // Pasar a la siguiente hora
      indiceActual++;
    }

    // Si encontramos suficientes bloques, retornar la hora final
    if (contadorBloques === bloquesNecesarios) {
      return horasOrdenadas[indiceActual - 1]; // Última hora ocupada
    }

    return null; // No hay suficientes horas disponibles
  },

  /**
   * Calcula la hora de finalización de una clase considerando horas "ignorar"
   * @param {number} hora_inicio - Hora de inicio en formato HHMM
   * @param {number} bloques_necesarios - Número de bloques de clase
   * @returns {number} Hora de fin en formato HHMM
   * @example
   * calcularHoraFinConIgnorar(700, 2)
   * // returns 930 (700-745-[830 ignorar]-845 +45 = 930)
   */
  calcularHoraFinConIgnorar: (hora_inicio, bloques_necesarios) => {
    const siguienteHoraValida = UTILS.obtenerSiguienteHoraValida(
      hora_inicio,
      bloques_necesarios,
    );

    if (!siguienteHoraValida) {
      // Si no hay hora válida, usar la lógica anterior
      return UTILS.sumar45Minutos(hora_inicio, bloques_necesarios);
    }

    // Convertir a formato HHMM y sumar 45 minutos a la última hora
    const horas = Math.floor(siguienteHoraValida / 100);
    const minutos = siguienteHoraValida % 100;
    const totalMinutos = horas * 60 + minutos + 45;

    const nuevasHoras = Math.floor(totalMinutos / 60);
    const nuevosMinutos = totalMinutos % 60;

    return nuevasHoras * 100 + nuevosMinutos;
  },

  /**
   * Obtiene todas las horas que ocupará una clase, excluyendo las marcadas como "ignorar"
   * @param {number} hora_inicio - Hora de inicio en formato HHMM
   * @param {number} bloques_necesarios - Número de bloques de clase
   * @returns {number[]} Array de horas HHMM que ocupará la clase
   * @example
   * obtenerHorasOcupadas(700, 2)
   * // returns [700, 745] (excluye 830 que es "ignorar")
   */
  obtenerHorasOcupadas: (hora_inicio, bloques_necesarios) => {
    const horasOcupadas = [];
    const horasOrdenadas = Object.keys(UTILS.initialHours)
      .map(Number)
      .sort((a, b) => a - b);

    let indiceInicio = horasOrdenadas.indexOf(hora_inicio);
    if (indiceInicio === -1) return horasOcupadas;

    let contadorBloques = 0;
    let indiceActual = indiceInicio;

    while (
      contadorBloques < bloques_necesarios &&
      indiceActual < horasOrdenadas.length
    ) {
      const horaActual = horasOrdenadas[indiceActual];

      if (typeof UTILS.initialHours[horaActual] !== "string") {
        horasOcupadas.push(horaActual);
        contadorBloques++;
      }

      indiceActual++;
    }

    return horasOcupadas;
  },

  /**
   * Convierte un string de hora en formato HH:MM a número HHMM
   * @param {string} horaString - Hora en formato "HH:MM", "HH:MM:SS" o "H:MM"
   * @returns {number|null} Hora en formato HHMM o null si es inválida
   * @example
   * convertirHoraStringAHHMM("07:00")   // returns 700
   * convertirHoraStringAHHMM("14:30:00") // returns 1430
   * convertirHoraStringAHHMM("7:30")     // returns 730
   */
  convertirHoraStringAHHMM: (horaString) => {
    try {
      if (!horaString || typeof horaString !== "string") {
        console.warn("Hora string no válida:", horaString);
        return null;
      }

      const partes = horaString.split(":");

      let horas = 0;
      let minutos = 0;

      if (partes.length >= 2) {
        horas = parseInt(partes[0], 10);
        minutos = parseInt(partes[1], 10);
      } else if (partes.length === 1) {
        horas = parseInt(partes[0], 10);
        minutos = 0;
      }

      if (isNaN(horas) || isNaN(minutos)) {
        console.warn("Hora contiene valores no numéricos:", horaString);
        return null;
      }

      if (horas < 0 || horas > 23 || minutos < 0 || minutos > 59) {
        console.warn("Hora fuera de rango:", horaString);
        return null;
      }

      return horas * 100 + minutos;
    } catch (error) {
      console.error("Error al convertir hora string:", error, horaString);
      return null;
    }
  },

  /**
   * Verifica si un array de horas es consecutivo en el horario académico
   * @param {number[]} horasArray - Array de horas en formato HHMM
   * @returns {boolean} true si las horas son consecutivas, false en caso contrario
   * @example
   * sonHorasConsecutivas([700, 745])     // returns true
   * sonHorasConsecutivas([700, 830])     // returns false (falta 745)
   */
  sonHorasConsecutivas: (horasArray) => {
    if (!Array.isArray(horasArray) || horasArray.length === 0) {
      return false;
    }

    if (horasArray.length === 1) {
      return true;
    }

    const horasOrdenadasGlobal = Object.keys(UTILS.initialHours)
      .map(Number)
      .sort((a, b) => a - b);

    if (!horasArray.every((hora) => horasOrdenadasGlobal.includes(hora))) {
      return false;
    }

    for (let i = 0; i < horasArray.length - 1; i++) {
      const horaActual = horasArray[i];
      const horaSiguiente = horasArray[i + 1];

      const indexActual = horasOrdenadasGlobal.indexOf(horaActual);
      const indexSiguiente = horasOrdenadasGlobal.indexOf(horaSiguiente);

      if (indexSiguiente !== indexActual + 1) {
        return false;
      }
    }

    return true;
  },

  /**
   * Obtiene un número específico de horas consecutivas a partir de una hora inicial
   * @param {number} horaInicio - Hora inicial en formato HHMM
   * @param {number} cantidadBloques - Número de bloques/horas necesarios
   * @returns {number[]} Array de horas consecutivas o array vacío si no hay suficientes
   * @example
   * obtenerHorasConsecutivasDesde(700, 2)
   * // returns [700, 745] (excluye automáticamente horas "ignorar")
   */
  obtenerHorasConsecutivasDesde: (horaInicio, cantidadBloques) => {
    const horasOrdenadas = Object.keys(UTILS.initialHours)
      .map(Number)
      .sort((a, b) => a - b);

    const indiceInicio = horasOrdenadas.indexOf(horaInicio);
    if (indiceInicio === -1) {
      return [];
    }

    const horasConsecutivas = [];
    let indiceActual = indiceInicio;
    let bloquesEncontrados = 0;

    while (
      bloquesEncontrados < cantidadBloques &&
      indiceActual < horasOrdenadas.length
    ) {
      const horaActual = horasOrdenadas[indiceActual];

      if (typeof UTILS.initialHours[horaActual] === "string") {
        horasConsecutivas.push(horaActual);
        bloquesEncontrados++;
      }

      indiceActual++;

      if (indiceActual < horasOrdenadas.length) {
        const horaSiguiente = horasOrdenadas[indiceActual];
        const indexActualEnArray = horasOrdenadas.indexOf(horaActual);
        const indexSiguienteEnArray = horasOrdenadas.indexOf(horaSiguiente);

        if (indexSiguienteEnArray !== indexActualEnArray + 1) {
          break;
        }
      }
    }

    return horasConsecutivas.length === cantidadBloques
      ? horasConsecutivas
      : [];
  },

  /**
   * Calcula el número real de filas que ocupará una clase en la tabla HTML
   * Considera que las horas "ignorar" también ocupan filas visuales
   * @param {number} horaInicio - Hora inicial en formato HHMM
   * @param {number} bloquesNecesarios - Número de bloques de clase
   * @returns {number} Número de filas necesarias para mostrar la clase
   * @example
   * calcularFilasReales(700, 2)
   * returns 3 (700, 745, [830 ignorar] = 3 filas)
   */
  calcularFilasReales: (horaInicio, bloquesNecesarios) => {
    const horasOrdenadas = Object.keys(UTILS.initialHours)
      .map(Number)
      .sort((a, b) => a - b);

    const indiceInicio = horasOrdenadas.indexOf(horaInicio);
    if (indiceInicio === -1) {
      return bloquesNecesarios; // Fallback
    }

    let filas = 0;
    let bloques = 0;
    let indiceActual = indiceInicio;

    while (
      bloques < bloquesNecesarios &&
      indiceActual < horasOrdenadas.length
    ) {
      const horaActual = horasOrdenadas[indiceActual];
      filas++;

      if (typeof UTILS.initialHours[horaActual] !== "string") {
        bloques++;
      }

      indiceActual++;
    }

    return filas;
  },
};

import dns from "dns/promises";

/**
 * Verifica si hay conexión a internet
 * @returns {Promise<boolean>} True si hay conexión, false si no
 */
export async function verificarConexionInternet() {
  try {
    // Intentar resolver un dominio confiable
    await dns.resolve("google.com");
    return true;
  } catch (error) {
    console.error("❌ Sin conexión a internet:", error.message);
    return false;
  }
}
