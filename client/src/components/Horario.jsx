import Clase from "./ui/clase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableContainer,
  TableRow,
  CircularProgress,
  Box,
  MenuItem,
  Typography,
  Button,
} from "@mui/material";
import CustomLabel from "./customLabel";
import { useState, useEffect, useCallback } from "react";
import axios from "../apis/axios.js";
import { UTILS } from "../utils/utils.js";

const initialHours = {
  700: null,
  745: null,
  830: null,
  915: null,
  1000: null,
  1045: null,
  1130: null,
  1215: null,
  1300: null,
  1345: null,
  1430: null,
  1515: null,
  1600: null,
  1645: null,
  1730: null,
  1815: null,
  1900: null,
  1945: null,
  2030: null,
};

export default function Horario({
  PNF,
  Trayecto,
  Seccion,
  Horario,
  Turno,
  Custom,
}) {
  //Estados
  //Estado de la clase seleccionada
  const [selectedClass, setSelectedClass] = useState(null);
  //Estado de los Slots que esta habilitados para un posible movimiento
  const [availableSlots, setAvailableSlots] = useState([]);
  //Estado para la nueva clase que se pueda crear
  const [newClass, setNewClass] = useState({
    profesor: null,
    unidad: null,
    aula: null,
  });
  //Estado para las unidades curriculares
  const [unidadesCurriculares, setUnidadesCurriculares] = useState([]);
  //Estados para los profesores
  const [profesores, setProfesores] = useState([]);
  //Estados para las aulas
  const [aulas, setAulas] = useState([]);
  //Estados para los horarios de los profesores
  const [profesoresHorarios, setProfesoresHorarios] = useState([]);
  //Estado para si se esta ejecutando algo que utilize un cargador
  const [loading, setLoading] = useState(false);
  //Estado para la clase que se esta por mover
  const [classToMove, setClassToMove] = useState(null);
  //Estado para slot original de una clase que se desea mover
  const [originalSlot, setOriginalSlot] = useState(null);

  //Estado de la tabla de horario
  const [tableHorario, setTableHorario] = useState(
    ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"].map(
      (dia) => ({ dia, horas: { ...initialHours } })
    )
  );

  /*
    Flujo del componente el componente es inteligente en cuanto a las siguientes cosas:
    1. Ejecucion de los horarios que ya estan establecidos y fisicamente en la base de datos
    1.1. Ejecuta la funcion de 
  */

  const obtenerTurno = (Turno) => {
    const [horaInicio, minInicio] = Turno.horaInicio.split(":");
    const [horaFin, minFin] = Turno.horaFin.split(":");

    const MinutosInicio = UTILS.horasMinutos(horaInicio, minInicio);
    const MinutosFin = UTILS.horasMinutos(horaFin, minFin);

    const horaInicioHHMM = UTILS.calcularHorasHHMM(MinutosInicio);
    const horaFinHHMM = UTILS.calcularHorasHHMM(MinutosFin);

    return { horaInicioHHMM, horaFinHHMM };
  };

  // Función para encontrar el slot original de una clase
  const findOriginalSlot = useCallback(
    (clase) => {
      console.log("Buscando slot original para clase:", clase.id); // ← DEBUG
      for (let diaIndex = 0; diaIndex < tableHorario.length; diaIndex++) {
        const dia = tableHorario[diaIndex];
        const horas = Object.keys(dia.horas);

        for (const hora of horas) {
          const celda = dia.horas[hora];
          if (celda?.ocupado && celda.datosClase.id === clase.id) {
            console.log("Slot encontrado:", {
              diaIndex,
              horaInicio: parseInt(hora),
            }); // ← DEBUG
            const bloquesNecesarios = celda.bloquesTotales;
            return {
              diaIndex,
              horaInicio: parseInt(hora),
              bloquesNecesarios,
            };
          }
        }
      }
      console.log("Slot NO encontrado"); // ← DEBUG
      return null;
    },
    [tableHorario]
  );

  // Función para verificar disponibilidad del profesor
  const verificarDisponibilidadProfesor = useCallback(
    (profesorId, diaIndex, horaInicio, bloquesNecesarios) => {
      const horarioProfesor = profesoresHorarios.find(
        (profesor) => profesor.idProfesor === profesorId
      );

      if (!horarioProfesor || !horarioProfesor.dias) return true;

      // Calcular hora fin
      const horaFin = parseInt(
        UTILS.sumar45Minutos(horaInicio, bloquesNecesarios)
      );

      // Verificar si el profesor ya tiene clase en este día y rango de horas
      return !horarioProfesor.dias.some((dias) => {
        if (UTILS.obtenerDiaId(dias.nombre) !== diaIndex) return false;

        dias.clases.forEach((clase) => {
          const [claseHoraIni, claseMinIni] = clase.horaInicio.split(":");
          const [claseHoraFin, claseMinFin] = clase.horaFin.split(":");

          const claseInicioMinutos =
            parseInt(claseHoraIni) * 60 + parseInt(claseMinIni);
          const claseFinMinutos =
            parseInt(claseHoraFin) * 60 + parseInt(claseMinFin);

          const nuevaInicioMinutos =
            Math.floor(horaInicio / 100) * 60 + (horaInicio % 100);
          const nuevaFinMinutos =
            Math.floor(horaFin / 100) * 60 + (horaFin % 100);

          // Verificar superposición de horarios
          return (
            nuevaInicioMinutos < claseFinMinutos &&
            nuevaFinMinutos > claseInicioMinutos
          );
        });
      });
    },
    [profesoresHorarios]
  );

  // Función para calcular horarios disponibles para ina clase
  const calcularHorariosDisponibles = useCallback(
    (clase) => {
      // Validaciones iniciales
      if (!clase || !clase.idProfesor || !clase.horasClase) {
        console.warn("Datos de clase incompletos");
        setAvailableSlots([]);
        return;
      }

      const bloquesNecesarios = parseInt(clase.horasClase);
      if (isNaN(bloquesNecesarios) || bloquesNecesarios <= 0) {
        console.warn("Duración de clase inválida");
        setAvailableSlots([]);
        return;
      }

      const slotsDisponibles = [];
      const disponibilidadDocente = [];

      // Obtener datos de profesores si no existen
      if (!profesores || profesores.length === 0) {
        console.log("Obteniendo datos de profesores...");
        getDataProfesores(clase.horasClase);
        setAvailableSlots([]);
        return;
      }

      // Buscar profesor y su disponibilidad
      const profesor = profesores.find(
        (prof) => prof.id_profesor === clase.idProfesor
      );

      if (!profesor) {
        console.warn(`Profesor con ID ${clase.idProfesor} no encontrado`);
        setAvailableSlots([]);
        return;
      }

      if (!profesor.disponibilidad || profesor.disponibilidad.length === 0) {
        console.warn("Profesor no tiene disponibilidad definida");
        setAvailableSlots([]);
        return;
      }

      disponibilidadDocente.push(...profesor.disponibilidad);

      // Procesar cada bloque de disponibilidad
      disponibilidadDocente.forEach((disponibilidad) => {
        if (
          !disponibilidad.dia_semana ||
          !disponibilidad.hora_inicio ||
          !disponibilidad.hora_fin
        ) {
          console.warn("Disponibilidad con datos incompletos", disponibilidad);
          return;
        }

        try {
          const [horaInicio, minutoInicio] = disponibilidad.hora_inicio
            .split(":")
            .map(Number);
          const [horaFin, minutoFin] = disponibilidad.hora_fin
            .split(":")
            .map(Number);

          if (
            isNaN(horaInicio) ||
            isNaN(minutoInicio) ||
            isNaN(horaFin) ||
            isNaN(minutoFin)
          ) {
            console.warn("Formato de hora inválido", disponibilidad);
            return;
          }

          const diaDisponibilidad = UTILS.obtenerDiaId(
            disponibilidad.dia_semana
          );
          if (diaDisponibilidad === null || diaDisponibilidad === undefined) {
            console.warn("Día de semana inválido", disponibilidad.dia_semana);
            return;
          }

          const horaHHMMInicio = UTILS.calcularHorasHHMM(
            UTILS.horasMinutos(horaInicio, minutoInicio)
          );
          const horaHHMMFin = UTILS.calcularHorasHHMM(
            UTILS.horasMinutos(horaFin, minutoFin)
          );

          if (horaHHMMInicio >= horaHHMMFin) {
            console.warn(
              "Hora de inicio mayor o igual que hora fin",
              disponibilidad
            );
            return;
          }

          // Filtrar horas dentro del rango disponible
          const horasFiltradas = Object.keys(initialHours)
            .map(Number)
            .filter(
              (horaHHMM) =>
                horaHHMM >= horaHHMMInicio && horaHHMM <= horaHHMMFin
            )
            .sort((a, b) => a - b);

          if (horasFiltradas.length < bloquesNecesarios) {
            return; // No hay suficientes horas disponibles
          }

          // Buscar bloques consecutivos
          for (let i = 0; i <= horasFiltradas.length - bloquesNecesarios; i++) {
            // Verificar que las horas están en posiciones consecutivas en el array
            const esConsecutivo = () => {
              for (let j = 0; j < bloquesNecesarios - 1; j++) {
                const indexActual = i + j;
                const indexSiguiente = i + j + 1;

                // Verificar que están en posiciones adyacentes en el array
                // Esto asume que el array está ordenado cronológicamente
                if (indexSiguiente >= horasFiltradas.length) return false;
                if (
                  horasFiltradas[indexSiguiente] <= horasFiltradas[indexActual]
                )
                  return false;
              }
              return true;
            };

            if (!esConsecutivo) continue;

            // Verificar disponibilidad en horario
            const horasBloque = horasFiltradas.slice(i, i + bloquesNecesarios);
            const esDisponible = horasBloque.every(
              (hora) => tableHorario[diaDisponibilidad]?.horas?.[hora] === null
            );

            if (!esDisponible) continue;

            // Verificar disponibilidad del profesor
            const idProfesor =
              newClass.profesor?.idProfesor || clase.idProfesor;
            console.log("id del profesor: ", idProfesor);
            const profesorDisponible = verificarDisponibilidadProfesor(
              idProfesor,
              diaDisponibilidad,
              horasFiltradas[i],
              bloquesNecesarios
            );
            console.log(
              "Este profesor esta disponible en el horario:",
              profesorDisponible
            );

            if (profesorDisponible) {
              slotsDisponibles.push({
                diaIndex: diaDisponibilidad,
                horaInicio: horasFiltradas[i],
                bloquesNecesarios,
              });
            }
          }
        } catch (error) {
          console.error(
            "Error procesando disponibilidad:",
            error,
            disponibilidad
          );
        }
      });
      console.log("Slots disponibles para colocar la clase:", slotsDisponibles);
      setAvailableSlots(slotsDisponibles);
    },
    [
      profesores,
      tableHorario,
      newClass.profesor,
      verificarDisponibilidadProfesor,
    ]
  );

  // Función para manejar la solicitud de mover clase
  const handleMoveRequest = useCallback(
    (clase) => {
      setClassToMove(clase);

      // Encontrar el slot original de esta clase
      const original = findOriginalSlot(clase);
      setOriginalSlot(original);

      // Calcular nuevos horarios disponibles
      if (original) {
        calcularHorariosDisponibles(clase, original);
      }
    },
    [findOriginalSlot, calcularHorariosDisponibles]
  );

  // Función para cancelar el movimiento
  const cancelarMovimiento = useCallback(() => {
    setClassToMove(null);
    setOriginalSlot(null);
    setAvailableSlots([]);
    setSelectedClass(null);
  }, []);

  // Función para completar el movimiento de una clase
  const completarMovimiento = useCallback(
    (nuevoSlot) => {
      if (!classToMove || !originalSlot) return;

      console.log("Ejecutando completarMovimiento"); // ← DEBUG
      console.log("Original slot:", originalSlot); // ← DEBUG
      console.log("Nuevo slot:", nuevoSlot); // ← DEBUG

      setTableHorario((prev) => {
        const nuevaMatriz = prev.map((item) => ({
          ...item,
          horas: { ...item.horas },
        }));

        // 1. Liberar slot original CORREGIDO
        for (let i = 0; i < originalSlot.bloquesNecesarios; i++) {
          const minutosExtra = i * 45;
          const minutosTotales =
            Math.floor(originalSlot.horaInicio / 100) * 60 +
            (originalSlot.horaInicio % 100) +
            minutosExtra;

          const nuevasHoras = Math.floor(minutosTotales / 60);
          const nuevosMinutos = minutosTotales % 60;
          const horaHHMM = nuevasHoras * 100 + nuevosMinutos;

          console.log(
            `Liberando hora ${horaHHMM} en día ${originalSlot.diaIndex}`
          ); // ← DEBUG
          nuevaMatriz[originalSlot.diaIndex].horas[horaHHMM] = null;
        }

        // 2. Ocupar nuevo slot
        const { diaIndex, horaInicio, bloquesNecesarios } = nuevoSlot;

        for (let i = 0; i < bloquesNecesarios; i++) {
          const minutosExtra = i * 45;
          const minutosTotales =
            Math.floor(horaInicio / 100) * 60 +
            (horaInicio % 100) +
            minutosExtra;

          const nuevasHoras = Math.floor(minutosTotales / 60);
          const nuevosMinutos = minutosTotales % 60;
          const horaHHMM = nuevasHoras * 100 + nuevosMinutos;

          console.log(`Ocupando hora ${horaHHMM} en día ${diaIndex}`); // ← DEBUG
          nuevaMatriz[diaIndex].horas[horaHHMM] = {
            ocupado: true,
            datosClase: classToMove, // ← Mantener la clase original
            bloque: i,
            bloquesTotales: bloquesNecesarios,
          };
        }

        return nuevaMatriz;
      });

      // Limpiar estados COMPLETAMENTE
      setClassToMove(null);
      setOriginalSlot(null);
      setAvailableSlots([]);
      setSelectedClass(null);

      // Mostrar mensaje de éxito
      alert(
        `Clase movida exitosamente a ${UTILS.obtenerDiaNombre(
          nuevoSlot.diaIndex
        )} ${UTILS.formatearHora(nuevoSlot.horaInicio)}`
      );
    },
    [classToMove, originalSlot]
  );

  // Función para verificar si un slot está disponible
  const isSlotAvailable = useCallback(
    (diaIndex, hora) => {
      return availableSlots.some(
        (slot) =>
          slot.diaIndex === diaIndex &&
          hora >= slot.horaInicio &&
          hora <
            parseInt(
              UTILS.sumar45Minutos(slot.horaInicio, slot.bloquesNecesarios)
            )
      );
    },
    [availableSlots]
  );

  // Función para manejar la selección de clase
  const handleClassSelect = useCallback(
    (clase) => {
      setSelectedClass(clase);
      calcularHorariosDisponibles(clase);
    },
    [tableHorario, newClass.profesor]
  );

  // Función para agregar clase al horario
  const agregarClaseAlHorario = useCallback(
    (slot) => {
      setTableHorario((prev) => {
        const nuevaMatriz = prev.map((item) => ({
          ...item,
          horas: { ...item.horas },
        }));

        const { diaIndex, horaInicio, bloquesNecesarios } = slot;

        // DIFERENCIAR ENTRE CLASE NUEVA Y CLASE MOVIDA
        const nuevaClase = classToMove
          ? {
              ...classToMove, // Mantener todos los datos originales
              horaInicio: `${Math.floor(horaInicio / 100)}:${String(
                horaInicio % 100
              ).padStart(2, "0")}`,
              horaFin: UTILS.sumar45Minutos(horaInicio, bloquesNecesarios),
            }
          : {
              id: Date.now(), // Solo nuevo ID para clases nuevas
              horasClase: bloquesNecesarios,
              nombreUnidadCurricular:
                newClass.unidad?.nombre_unidad_curricular ||
                selectedClass.nombreUnidadCurricular,
              nombreProfesor:
                newClass.profesor?.nombres || selectedClass.nombreProfesor,
              apellidoProfesor:
                newClass.profesor?.apellidos || selectedClass.apellidoProfesor,
              profesorId:
                newClass.profesor?.id_profesor || selectedClass.profesorId,
              aulaId: newClass.aula?.id_aula || selectedClass.aulaId,
              horaInicio: `${Math.floor(horaInicio / 100)}:${String(
                horaInicio % 100
              ).padStart(2, "0")}`,
              horaFin: UTILS.sumar45Minutos(horaInicio, bloquesNecesarios),
            };

        for (let i = 0; i < bloquesNecesarios; i++) {
          const minutosExtra = i * 45;
          const minutosTotales =
            Math.floor(horaInicio / 100) * 60 +
            (horaInicio % 100) +
            minutosExtra;

          const nuevasHoras = Math.floor(minutosTotales / 60);
          const nuevosMinutos = minutosTotales % 60;
          const horaHHMM = nuevasHoras * 100 + nuevosMinutos;

          nuevaMatriz[diaIndex].horas[horaHHMM] = {
            ocupado: true,
            datosClase: nuevaClase,
            bloque: i,
            bloquesTotales: bloquesNecesarios,
          };
        }

        // Limpiar selección después de agregar
        setSelectedClass(null);
        setAvailableSlots([]);
        setNewClass({ profesor: null, unidad: null });

        return nuevaMatriz;
      });
    },
    [selectedClass, newClass.profesor, classToMove] // Agregar classToMove a las dependencias
  );

  // Función para manejar click en slots disponibles
  const handleSlotClick = useCallback(
    (diaIndex, horaInicio) => {
      if (!selectedClass) return;

      console.log("classToMove:", classToMove); // ← DEBUG
      console.log("selectedClass:", selectedClass); // ← DEBUG

      const slot = availableSlots.find(
        (slot) => slot.diaIndex === diaIndex && slot.horaInicio === horaInicio
      );

      if (slot) {
        if (classToMove) {
          console.log("Moviendo clase existente"); // ← DEBUG
          if (
            window.confirm(
              `¿Mover ${
                classToMove.nombre_unidad_curricular
              } a ${UTILS.obtenerDiaNombre(diaIndex)} a ${UTILS.formatearHora(
                horaInicio
              )}?`
            )
          ) {
            completarMovimiento(slot);
          }
        } else {
          console.log("Agregando clase nueva"); // ← DEBUG
          if (
            window.confirm(
              `¿Programar ${
                selectedClass.nombre_unidad_curricular
              } en ${UTILS.obtenerDiaNombre(diaIndex)} a ${UTILS.formatearHora(
                horaInicio
              )}?`
            )
          ) {
            agregarClaseAlHorario(slot);
          }
        }
      }
    },
    [
      selectedClass,
      availableSlots,
      classToMove,
      completarMovimiento,
      agregarClaseAlHorario,
    ]
  );

  // Efecto para recalcular cuando cambia la clase seleccionada
  useEffect(() => {
    if (selectedClass && !classToMove) {
      calcularHorariosDisponibles(selectedClass);
    }
  }, [selectedClass, calcularHorariosDisponibles, classToMove]);

  // Cargar horario inicial
  useEffect(() => {
    const obtenerClases = (Dias) => {
      setTableHorario((prev) => {
        const { horaInicioHHMM, horaFinHHMM } = obtenerTurno(Turno);

        // Filtrar horas dentro del turno (ya están en formato HHMM)
        const horasFiltradas = {};
        Object.keys(initialHours).forEach((key) => {
          const horaHHMM = Number(key);
          if (horaHHMM >= horaInicioHHMM && horaHHMM <= horaFinHHMM) {
            horasFiltradas[key] = initialHours[key];
          }
        });

        const nuevaMatriz = prev.map((item) => ({
          dia: item.dia,
          horas: { ...horasFiltradas }, // Usar las horas filtradas
        }));

        Dias.forEach((dia) => {
          let idDia = UTILS.obtenerDiaId(dia.nombre.toLowerCase());
          if (idDia === -1) return;

          dia.clases.forEach((clase) => {
            const [hIni, mIni] = clase.horaInicio.split(":");
            const [hFin, mFin] = clase.horaFin.split(":");
            const inicio = UTILS.horasMinutos(hIni, mIni);
            const fin = UTILS.horasMinutos(hFin, mFin);
            const bloques = Math.ceil((fin - inicio) / 45);

            for (let i = 0; i < bloques; i++) {
              const minutosActual = inicio + i * 45;
              const h = Math.floor(minutosActual / 60);
              const m = minutosActual % 60;
              const horaHHMM = h * 100 + m;

              // Verificar si la hora existe en las horas filtradas
              if (horasFiltradas[horaHHMM] !== undefined) {
                nuevaMatriz[idDia].horas[horaHHMM] = {
                  ocupado: true,
                  datosClase: { ...clase, horasClase: bloques },
                  bloque: i,
                  bloquesTotales: bloques,
                };
              }
            }
          });
        });
        return nuevaMatriz;
      });
    };
    if (Horario) obtenerClases(Horario);
  }, [Horario, Turno]); // Añadir Turno como dependencia

  const getDataProfesores = async (horasClase) => {
    try {
      const profs = await axios.get(
        `/Profesores/to/Horarios?horasNecesarias=${horasClase}`
      );
      setProfesores(profs.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  // Cargar datos de profesores y unidades curriculares
  useEffect(() => {
    const getDataUnidades = async () => {
      try {
        const unidades = await axios.get(
          `/Trayecto/Unidades-Curriculares?Trayecto=${UTILS.obtenerTrayectoNumero(
            Trayecto
          )}`
        );
        setUnidadesCurriculares(unidades.data.data);
      } catch (error) {
        console.error(error);
      }
    };

    const getDataAulas = async () => {
      try {
        const aulas = await axios.get(`/Aulas/to/Horarios?pnf=${PNF}`);
        setAulas(aulas.data.data);
      } catch (error) {
        console.error(error);
      }
    };

    if (Custom) {
      getDataUnidades();
      if (newClass.unidad) {
        getDataProfesores(newClass.unidad.horas_clase);
        if (newClass.profesor) {
          getDataAulas();
        }
      }
    }
  }, [Trayecto, Custom, newClass, PNF]);

  // Cargar horarios de profesores
  useEffect(() => {
    const loadProfesorHorarios = async () => {
      if (profesores.length > 0) {
        setLoading(true);
        try {
          const horariosPromises = profesores.map((profesor) => {
            return axios.get(
              `/Horarios/Profesores?Profesor=${profesor.id_profesor}`
            );
          });
          const responses = await Promise.all(horariosPromises);
          const horarios = responses.map((response) => response.data.data);
          setProfesoresHorarios(horarios);
        } catch (error) {
          console.error("Error loading profesor schedules:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadProfesorHorarios();
  }, [profesores]);

  // Cambia el valor de profesor en la nueva clase
  const handleProfesorChange = (profesorId) => {
    const profesor = profesores.find((p) => p.id_profesor === profesorId);
    setNewClass((prev) => ({ ...prev, profesor }));
  };

  // Cambia el valor de la aula en la nueva clase
  const handleAulaChange = (aulaId) => {
    const aula = aulas.find((p) => p.id_aula === aulaId);
    setNewClass((prev) => ({ ...prev, aula }));
  };

  // Cambia el valor de la unidad curricular en la nueva clase
  const handleUnidadChange = (unidadId) => {
    const unidad = unidadesCurriculares.find(
      (u) => u.id_unidad_curricular === unidadId
    );
    setNewClass((prev) => ({ ...prev, unidad }));
    if (unidad) {
      handleClassSelect(unidad);
    }
  };

  //Pide los horarios de los profesores que son seleccionados
  const getProfesoresHorarios = useCallback(async (id) => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/Horarios/Profesores?Profesor=${id}`);
      setProfesoresHorarios((prev) => [...prev, ...data.data]);
    } catch (error) {
      console.error("Error fetching profesor horarios:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  //Funcion para mostrar los profesores seleccionados
  const mostrarProfesorSeleccionado = useCallback(
    (id_profesor) => {
      // Buscar el profesor directamente
      const buscarHorarioProfesor = profesoresHorarios.find(
        (profesor) => profesor.idProfesor === id_profesor
      );

      // Verificar si NO se encontró el profesor
      if (!buscarHorarioProfesor) {
        getProfesoresHorarios(id_profesor);
      }
    },
    [profesoresHorarios, getProfesoresHorarios]
  );

  const horasOrdenadas = Object.keys(tableHorario[0].horas)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <Box component={"div"}>
      {Custom && (
        <form>
          <Box
            sx={{
              display: "flex",
              gap: "50px",
              m: 2,
              justifyContent: "center",
            }}
          >
            <CustomLabel
              select
              label="Unidad Curricular"
              helperText="Seleccione una unidad curricular"
              value={newClass.unidad?.id_unidad_curricular || ""}
              onChange={(e) => handleUnidadChange(e.target.value)}
            >
              {unidadesCurriculares.length > 0 ? (
                unidadesCurriculares.map((unidad) => (
                  <MenuItem
                    key={unidad.id_unidad_curricular}
                    value={unidad.id_unidad_curricular}
                  >
                    {unidad.nombre_unidad_curricular} ({unidad.horas_clase}h)
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>Cargando...</MenuItem>
              )}
            </CustomLabel>
            {newClass.unidad ? (
              <CustomLabel
                select
                label="Profesor"
                helperText="Seleccione un profesor"
                value={newClass.profesor?.id_profesor || ""}
                onChange={(e) => handleProfesorChange(e.target.value)}
              >
                {profesores.length > 0 ? (
                  profesores.map((profesor) => (
                    <MenuItem
                      key={profesor.id_profesor}
                      value={profesor.id_profesor}
                    >
                      <Typography variant="body2">
                        {profesor.nombres} {profesor.apellidos}
                      </Typography>
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>Cargando...</MenuItem>
                )}
              </CustomLabel>
            ) : null}
            {newClass.profesor ? (
              <CustomLabel
                select
                label="Aula"
                helperText="Seleccione una Aula"
                value={newClass.aula?.id_aula || ""}
                onChange={(e) => handleAulaChange(e.target.value)}
              >
                {aulas.length > 0 ? (
                  aulas.map((aula) => (
                    <MenuItem key={aula.id_aula} value={aula.id_aula}>
                      <Typography variant="body2">
                        {aula.codigo_aula}
                      </Typography>
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>Cargando...</MenuItem>
                )}
              </CustomLabel>
            ) : null}
          </Box>
        </form>
      )}

      {selectedClass && !classToMove && (
        <Box
          sx={{
            padding: "8px",
            backgroundColor: "#e8f5e8",
            border: "2px solid #28a745",
            borderRadius: "4px",
            margin: "10px",
            textAlign: "center",
          }}
        >
          <Typography variant="body2" color="green">
            ✓ Seleccionada: {selectedClass.nombre_unidad_curricular}
          </Typography>
          <Typography variant="caption">
            Haz click en los slots verdes para programar la clase
          </Typography>
        </Box>
      )}

      {classToMove && (
        <Box
          sx={{
            padding: "8px",
            backgroundColor: "#fff3cd",
            border: "2px solid #ffc107",
            borderRadius: "4px",
            margin: "10px",
            textAlign: "center",
          }}
        >
          <Typography variant="body2" color="#856404">
            Moviendo: {classToMove.nombre_unidad_curricular}
          </Typography>
          <Typography variant="caption">
            Selecciona un nuevo horario disponible (resaltado en verde)
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={cancelarMovimiento}
            sx={{ ml: 2 }}
          >
            Cancelar
          </Button>
        </Box>
      )}

      <TableContainer>
        {loading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1000,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        <Table sx={{ border: "1px solid black", width: "1000px" }}>
          <TableHead>
            <TableRow>
              <TableCell colSpan={7} align="center">
                {PNF ? PNF : ""} {Trayecto ? `Trayecto ${Trayecto}` : ""}{" "}
                {Seccion ? `Sección ${Seccion}` : ""}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                sx={{ backgroundColor: "#c4c4c4ff", border: "1px solid black" }}
              >
                Hora
              </TableCell>
              {tableHorario.map((columna) => (
                <TableCell
                  key={columna.dia}
                  align="center"
                  sx={{ border: "1px solid black" }}
                >
                  {columna.dia.charAt(0).toUpperCase() + columna.dia.slice(1)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {horasOrdenadas.map((hora) => (
              <TableRow key={hora}>
                <TableCell
                  sx={{
                    backgroundColor: "#c4c4c4ff",
                    border: "1px solid black",
                    whiteSpace: "nowrap",
                  }}
                >
                  {UTILS.formatearHora(hora)}
                </TableCell>

                {tableHorario.map((columna, diaIndex) => {
                  const celda = columna.horas[hora];
                  const cellKey = `${columna.dia}-${hora}`;
                  const disponible =
                    selectedClass && isSlotAvailable(diaIndex, hora);

                  if (celda?.ocupado && celda.bloque !== 0) {
                    return null;
                  }

                  return (
                    <TableCell
                      key={cellKey}
                      rowSpan={celda?.ocupado ? celda.bloquesTotales : 1}
                      sx={{
                        padding: 0,
                        verticalAlign: "top",
                        height: celda?.ocupado
                          ? `${celda.bloquesTotales * 50}px`
                          : "50px",
                        border: "1px solid black",
                        minWidth: 120,
                        backgroundColor: disponible ? "#e8f5e8" : "transparent",
                        position: "relative",
                        "&:hover": disponible
                          ? {
                              backgroundColor: "#d4edda",
                              cursor: "pointer",
                            }
                          : {},
                      }}
                      onClick={() =>
                        disponible && handleSlotClick(diaIndex, hora)
                      }
                    >
                      {celda?.ocupado ? (
                        <Clase
                          clase={celda.datosClase}
                          mostrarProfesorSeleccionado={
                            mostrarProfesorSeleccionado
                          }
                          onSelect={handleClassSelect}
                          onMoveRequest={handleMoveRequest}
                          isSelected={
                            selectedClass?.id === celda.datosClase?.id
                          }
                        />
                      ) : (
                        disponible && (
                          <div
                            style={{
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#28a745",
                              fontWeight: "bold",
                              fontSize: "12px",
                            }}
                          >
                            ✓
                          </div>
                        )
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
