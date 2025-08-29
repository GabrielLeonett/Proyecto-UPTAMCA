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

// Utilidades
const UTILS = {
  obtenerDiaId: (dia) => {
    const dias = [
      "lunes",
      "martes",
      "miercoles",
      "jueves",
      "viernes",
      "sabado",
    ];
    return dias.indexOf(dia.toLowerCase());
  },

  obtenerDiaNombre: (id) => {
    const dias = [
      "lunes",
      "martes",
      "miercoles",
      "jueves",
      "viernes",
      "sabado",
    ];
    return dias[id] || "";
  },

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

  formatearHora: (horaMilitar) => {
    const horas = Math.floor(horaMilitar / 100);
    const minutos = horaMilitar % 100;
    const periodo = horas >= 12 ? "PM" : "AM";
    const horas12 = horas > 12 ? horas - 12 : horas === 0 ? 12 : horas;

    return `${horas12}:${String(minutos).padStart(2, "0")} ${periodo}`;
  },
};

function obtenerDiaId(dia) {
  const dias = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
  return dias.indexOf(dia.toLowerCase());
}

function obtenerTrayectoNumero(trayecto) {
  const trayectos = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6 };
  return trayectos[trayecto] || 1;
}

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

const horasMinutos = (h, m) => parseInt(h) * 60 + parseInt(m);

export default function Horario({ PNF, Trayecto, Seccion, Horario, Custom=true }) {
  const [selectedClass, setSelectedClass] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [newClass, setNewClass] = useState({ profesor: null, unidad: null });
  const [unidadesCurriculares, setUnidadesCurriculares] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [profesoresHorarios, setProfesoresHorarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [classToMove, setClassToMove] = useState(null);
  const [originalSlot, setOriginalSlot] = useState(null);

  const [tableHorario, setTableHorario] = useState(
    ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"].map(
      (dia) => ({ dia, horas: { ...initialHours } })
    )
  );

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
        (p) => p.idProfesor === profesorId
      );

      if (!horarioProfesor || !horarioProfesor.dias) return true;

      // Calcular hora fin
      const horaFin = parseInt(
        UTILS.sumar45Minutos(horaInicio, bloquesNecesarios)
      );

      

      // Verificar si el profesor ya tiene clase en este día y rango de horas
      return !horarioProfesor.dias.some((dias) => {
        if (obtenerDiaId(dias.nombre) !== diaIndex) return false;

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

  // Función para calcular slots disponibles para mover una clase
  const calcularSlotsParaMover = useCallback(
    (clase, originalSlot) => {
      if (!clase || !originalSlot) return;

      const bloquesNecesarios = originalSlot.bloquesNecesarios;
      const slotsDisponibles = [];

      // Recorrer todos los días y horas
      tableHorario.forEach((dia, diaIndex) => {
        const horasDisponibles = Object.keys(dia.horas).map(Number).sort((a, b) => a - b);

        // Verificar slots consecutivos disponibles
        for (let i = 0; i <= horasDisponibles.length - bloquesNecesarios; i++) {
          const horaInicio = horasDisponibles[i];

          // Saltar si es el slot original (ya está ocupado por la clase que queremos mover)
          if (
            diaIndex === originalSlot.diaIndex &&
            horaInicio === originalSlot.horaInicio
          ) {
            continue;
          }

          const esDisponible = Array.from(
            { length: bloquesNecesarios },
            (_, j) => {
              const horaActual = horasDisponibles[i + j];
              // Verificar si el slot está disponible
              const slotLibre = dia.horas[horaActual] === null;

              // Verificar si no conflictúa con horario del profesor
              const sinConflicto = verificarDisponibilidadProfesor(
                clase.profesorId,
                diaIndex,
                horaInicio,
                bloquesNecesarios
              );

              return slotLibre && sinConflicto;
            }
          ).every(Boolean);

          if (esDisponible) {
            slotsDisponibles.push({
              diaIndex,
              horaInicio,
              bloquesNecesarios,
            });
          }
        }
      });

      setAvailableSlots(slotsDisponibles);
      setSelectedClass(clase); // Tratar como seleccionada para mostrar slots verdes
    },
    [tableHorario, profesoresHorarios, verificarDisponibilidadProfesor]
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
        calcularSlotsParaMover(clase, original);
      }
    },
    [findOriginalSlot, calcularSlotsParaMover]
  );

  // Función para cancelar el movimiento
  const cancelarMovimiento = useCallback(() => {
    setClassToMove(null);
    setOriginalSlot(null);
    setAvailableSlots([]);
    setSelectedClass(null);
  }, []);

  // Función para completar el movimiento de una clase
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

  // Función para calcular horarios disponibles para nuevas clases
  const calcularHorariosDisponibles = useCallback(
    (clase) => {
      if (!clase) return;
      const bloquesNecesarios = clase.horasClase;
      const slotsDisponibles = [];

      // Recorrer todos los días y horas
      tableHorario.forEach((dia, diaIndex) => {
        const horasDisponibles = Object.keys(dia.horas)
          .map(Number)
          .sort((a, b) => a - b);

        if (horasDisponibles.length < bloquesNecesarios) {
          return; // Saltar este día si no hay suficientes horas
        }

        // Verificar slots consecutivos disponibles
        for (let i = 0; i <= horasDisponibles.length - bloquesNecesarios; i++) {
          const horaInicio = horasDisponibles[i];

          const esDisponible = Array.from(
            { length: bloquesNecesarios },
            (_, j) => dia.horas[horasDisponibles[i + j]] === null
          ).every(Boolean);

          const idProfesor = newClass.profesor?.id_profesor || clase.idProfesor;

          // Verificar disponibilidad del profesor
          const profesorDisponible = verificarDisponibilidadProfesor(
            idProfesor,
            diaIndex,
            horaInicio,
            bloquesNecesarios
          );

          if (esDisponible && profesorDisponible) {
            slotsDisponibles.push({
              diaIndex,
              horaInicio: horasDisponibles[i],
              bloquesNecesarios,
            });
          }
        }
      });

      setAvailableSlots(slotsDisponibles);
    },
    [tableHorario, newClass.profesor, verificarDisponibilidadProfesor]
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
      console.log("Recalculando horarios disponibles para:", selectedClass); // ← DEBUG
      calcularHorariosDisponibles(selectedClass);
    }
  }, [selectedClass, calcularHorariosDisponibles, classToMove]);

  // Cargar horario inicial
  useEffect(() => {
    const obtenerClases = (Dias) => {
      setTableHorario((prev) => {
        const nuevaMatriz = prev.map((item) => ({
          dia: item.dia,
          horas: { ...initialHours },
        }));

        Dias.forEach((dia) => {
          let idDia = obtenerDiaId(dia.nombre.toLowerCase());
          if (idDia === -1) return;

          dia.clases.forEach((clase) => {
            const [hIni, mIni] = clase.horaInicio.split(":");
            const [hFin, mFin] = clase.horaFin.split(":");
            const inicio = horasMinutos(hIni, mIni);
            const fin = horasMinutos(hFin, mFin);
            const bloques = Math.ceil((fin - inicio) / 45);

            for (let i = 0; i < bloques; i++) {
              const minutosActual = inicio + i * 45;
              const h = Math.floor(minutosActual / 60);
              const m = minutosActual % 60;
              const horaHHMM = h * 100 + m;
              if (nuevaMatriz[idDia].horas[horaHHMM] !== undefined) {
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
  }, [Horario]);

  // Cargar datos de profesores y unidades curriculares
  useEffect(() => {
    const getData = async () => {
      try {
        const unidades = await axios.get(
          `/Trayecto/Unidades-Curriculares?Trayecto=${obtenerTrayectoNumero(
            Trayecto
          )}`
        );
        setUnidadesCurriculares(unidades.data.data);

        const profs = await axios.get(`/Profesores/to/Horarios`);
        setProfesores(profs.data.data);
      } catch (error) {
        console.error(error);
      }
    };

    if (Custom) {
      getData();
    }
  }, [Trayecto, Custom]);

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

  const handleProfesorChange = (profesorId) => {
    const profesor = profesores.find((p) => p.id_profesor === profesorId);
    setNewClass((prev) => ({ ...prev, profesor }));
  };

  const handleUnidadChange = (unidadId) => {
    const unidad = unidadesCurriculares.find(
      (u) => u.id_unidad_curricular === unidadId
    );
    setNewClass((prev) => ({ ...prev, unidad }));
    if (unidad) {
      handleClassSelect(unidad);
    }
  };

  const getProfesoresHorarios = useCallback(async (id) => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/Horarios/Profesores?Profesor=${id}`);
      console.log(data.data)
      setProfesoresHorarios((prev) => [...prev, ...data.data]);
    } catch (error) {
      console.error("Error fetching profesor horarios:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const mostrarProfesorSeleccionado = useCallback(
    (id_profesor) => {
      const buscarHorarioProfesor = profesoresHorarios.find(
        (profe) => profe.id_profesor === id_profesor
      );
      if (!buscarHorarioProfesor) {
        getProfesoresHorarios(id_profesor);
      }
    },
    [profesoresHorarios, getProfesoresHorarios]
  );

  const horasOrdenadas = Object.keys(initialHours)
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
