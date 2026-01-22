import { useCallback } from "react";
import { useProfessorAvailability } from "./useProfessorAvailability";
import { useAulaAvailability } from "./useAulaAvailability";
import { useSlotCalculations } from "./useSlotCalculations";
import {
  findOriginalSlot,
  liberarSlotOriginal,
  ocuparNuevoSlot,
} from "../utils/movementUtils";
import useSweetAlert from "../../../hook/useSweetAlert";

const useClassMovement = (state, stateSetters, utils, actionData) => {
  const alert = useSweetAlert();
  const {
    tableHorario,
    profesorSelected,
    profesorHorario,
    aulaHorario,
    classToMove,
    originalSlot,
  } = state;

  const {
    setUnidadCurricularSelected,
    setTableHorario,
    setClassToMove,
    setOriginalSlot,
    setSelectedClass,
    setAvailableSlots,
    setAulaSelected,
    setProfesorSelected,
    setHayCambios,
    setHorariosEliminados,
  } = stateSetters;

  const {
    fetchProfesoresHorario,
    fetchProfesorCompleto,
    fetchAulaCompleta,
    fetchAulaHorario,
  } = actionData;

  const { verificarDisponibilidadProfesor } = useProfessorAvailability();
  const { verificarDisponibilidadAula } = useAulaAvailability();

  const { procesarDisponibilidadDocente, validarDatosClase } =
    useSlotCalculations();

  const handleCancelMoveRequest = useCallback(() => {
    setClassToMove(null);
    setSelectedClass(null);
    setAulaSelected(null);
    setProfesorSelected(null);
    setUnidadCurricularSelected(null);
    setOriginalSlot(null);
  }, [
    setAulaSelected,
    setClassToMove,
    setOriginalSlot,
    setProfesorSelected,
    setSelectedClass,
    setUnidadCurricularSelected,
  ]);

  // Cancelar movimiento
  const cancelarMovimiento = useCallback(() => {
    setClassToMove(null);
    setOriginalSlot(null);
    setAvailableSlots([]);
    setSelectedClass(null);
  }, [setClassToMove, setOriginalSlot, setAvailableSlots, setSelectedClass]);

  const handleDeleteClass = useCallback(
    async (clase) => {
      // Agregar async aquí
      if (!clase) return;

      // Mostrar confirmación antes de eliminar
      const result = await alert.confirm(
        // Agregar await aquí
        "Eliminar Clase",
        `¿Estás seguro de que quieres eliminar esta clase de ${clase.nombre_unidad_curricular}?`,
        {
          confirmButtonText: "Eliminar",
          cancelButtonText: "Cancelar",
        }
      );

      if (result) {
        setTableHorario((prev) => {
          let nuevaMatriz = [...prev];

          // Buscar y liberar el slot donde está la clase
          const slotOriginal = findOriginalSlot(clase, nuevaMatriz);
          if (slotOriginal) {
            nuevaMatriz = liberarSlotOriginal(slotOriginal, nuevaMatriz);
            // ✅ CORREGIDO: Usar id_horario en lugar de id
            if (!clase.nueva_clase && clase.id) {
              setHorariosEliminados((prev) => {
                if (!prev.includes(clase.id)) {
                  return [...prev, clase.id];
                }
                console.log("Guardado para eliminar mas tarde: ", prev)
                return prev;
              });
            }
          }

          return nuevaMatriz;
        });

        // Limpiar estados si la clase eliminada es la seleccionada
        if (classToMove && classToMove.id_clase === clase.id_clase) {
          cancelarMovimiento();
        }

        setHayCambios(true);
        alert.success(
          "Clase Eliminada",
          "La clase ha sido eliminada exitosamente del horario"
        );
      } else {
        // ALERTA AGREGADA
        alert.info("Información", "Eliminación cancelada");
      }
    },
    [
      alert,
      setTableHorario,
      classToMove,
      cancelarMovimiento,
      setHayCambios,
      setHorariosEliminados,
    ]
  );

  // Eliminar clase actual seleccionada
  const handleDeleteSelectedClass = useCallback(() => {
    if (classToMove) {
      handleDeleteClass(classToMove);
    } else {
      alert.info("Sin Clase", "No hay clase seleccionada para eliminar");
    }
  }, [classToMove, handleDeleteClass, alert]);

  // Calcular horarios disponibles
  const calcularHorariosDisponibles = useCallback(
    (clase) => {
      const bloques_necesarios = validarDatosClase(clase);
      if (!bloques_necesarios) {
        setAvailableSlots([]);
        return;
      }

      if (!profesorSelected) {
        setAvailableSlots([]);
        return;
      }

      if (
        !profesorSelected.disponibilidades ||
        profesorSelected.disponibilidades.length === 0
      ) {
        setAvailableSlots([]);
        return;
      }


      const slotsDisponibles = [];

      profesorSelected.disponibilidades.forEach((disponibilidad) => {
        const slots = procesarDisponibilidadDocente(
          disponibilidad,
          bloques_necesarios,
          tableHorario,
          (profesor_id, dia_index, hora_inicio, bloques) => {
            const profesorDisponible = verificarDisponibilidadProfesor(
              profesor_id,
              dia_index,
              hora_inicio,
              bloques,
              profesorHorario,
              clase // ✅ Pasar la clase actual
            );

            return profesorDisponible;
          },
          (dia_index, hora_inicio, bloques) => {
            const aulaDisponible = verificarDisponibilidadAula(
              clase.id_aula,
              dia_index,
              hora_inicio,
              bloques,
              aulaHorario,
              clase // ✅ Pasar la clase actual
            );

            return aulaDisponible;
          },
          clase
        );

        slotsDisponibles.push(...slots);
      });

      setAvailableSlots(slotsDisponibles);
    },
    [
      aulaHorario,
      profesorSelected,
      tableHorario,
      profesorHorario,
      setAvailableSlots,
      validarDatosClase,
      procesarDisponibilidadDocente,
      verificarDisponibilidadProfesor,
      verificarDisponibilidadAula,
    ]
  );

  // Manejar solicitud de movimiento
  const handleMoveRequest = useCallback(
    async (clase) => {
      setUnidadCurricularSelected(null);
      setProfesorSelected(null);
      setAulaSelected(null);
      setClassToMove(clase);

      const original = findOriginalSlot(clase, tableHorario);
      setOriginalSlot(original);
      if (original) {
        setSelectedClass(clase);

        try {
          // CARGAR DATOS COMPLETOS EN PARALELO
          const [profesorData, aulaData] = await Promise.all([
            // 1. Cargar datos COMPLETOS del profesor con disponibilidades
            fetchProfesorCompleto({ id_profesor: clase.id_profesor }),

            // 2. Cargar datos COMPLETOS del aula con horarios
            fetchAulaCompleta({ id_aula: clase.id_aula }),

            // 3. Cargar horario actual del profesor
            fetchProfesoresHorario({ id_profesor: clase.id_profesor }),

            // 4. Cargar horario actual del aula
            fetchAulaHorario({ id_aula: clase.id_aula }),
          ]);

          if (!profesorData || !aulaData) {
            throw new Error("No se pudieron cargar los datos necesarios");
          }

          // Actualizar estados con los datos cargados
          setProfesorSelected(profesorData);
          setAulaSelected(aulaData);

          // Ahora calcular disponibilidades con TODOS los datos cargados
          calcularHorariosDisponibles(clase);
        } catch (error) {
          console.error("Error al manejar la solicitud de movimiento:", error);
          alert.error(
            "Error",
            "No se pudieron cargar los datos necesarios para el movimiento"
          );
        }
      }
    },
    [
      alert,
      calcularHorariosDisponibles,
      fetchAulaCompleta,
      fetchAulaHorario,
      fetchProfesorCompleto,
      fetchProfesoresHorario,
      setAulaSelected,
      setClassToMove,
      setOriginalSlot,
      setUnidadCurricularSelected,
      setSelectedClass,
      setProfesorSelected,
      tableHorario,
    ]
  );

  // Completar movimiento
  const completarMovimiento = useCallback(
    (nuevoSlot) => {
      // Verificar si tenemos los datos mínimos necesarios
      if (!classToMove) {
        return;
      }
      
      setTableHorario((prev) => {
        let nuevaMatriz = [...prev];

        // Liberar el slot original si existe (sin importar si es clase nueva o no)
        if (originalSlot) {
          nuevaMatriz = liberarSlotOriginal(originalSlot, nuevaMatriz);
        }
        
        // Ocupar el nuevo slot
        nuevaMatriz = ocuparNuevoSlot(nuevoSlot, classToMove, nuevaMatriz);
        return nuevaMatriz;
      });
      // Limpiar estados
      cancelarMovimiento();

      //Notificar cambio
      setHayCambios(true);

      // Determinar el tipo de operación para el mensaje
      let tipoOperacion, mensaje;

      if (classToMove.nueva_clase && !originalSlot) {
        // Primera vez que se coloca una clase nueva
        tipoOperacion = "Clase Agregada";
        mensaje = `Clase agregada exitosamente a ${utils.obtenerDiaNombre(
          nuevoSlot.dia_index
        )} ${utils.formatearHora(nuevoSlot.hora_inicio)}`;
      } else if (classToMove.nueva_clase && originalSlot) {
        // Moviendo una clase nueva que ya estaba colocada
        tipoOperacion = "Clase Reubicada";
        mensaje = `Clase reubicada a ${utils.obtenerDiaNombre(
          nuevoSlot.dia_index
        )} ${utils.formatearHora(nuevoSlot.hora_inicio)}`;
      } else {
        // Moviendo una clase existente (no nueva)
        tipoOperacion = "Clase Movida";
        mensaje = `Clase movida exitosamente a ${utils.obtenerDiaNombre(
          nuevoSlot.dia_index
        )} ${utils.formatearHora(nuevoSlot.hora_inicio)}`;
      }

      alert.success(tipoOperacion, mensaje);
    },
    [
      classToMove,
      originalSlot,
      setTableHorario,
      cancelarMovimiento,
      utils,
      alert,
      setHayCambios,
    ]
  );

  return {
    handleMoveRequest,
    cancelarMovimiento,
    completarMovimiento,
    calcularHorariosDisponibles,
    handleCancelMoveRequest,
    // Métodos de eliminación
    handleDeleteClass,
    handleDeleteSelectedClass,
    verificarDisponibilidadProfesor: (
      profesor_id,
      dia_index,
      hora_inicio,
      bloques_necesarios
    ) =>
      verificarDisponibilidadProfesor(
        profesor_id,
        dia_index,
        hora_inicio,
        bloques_necesarios,
        profesorHorario
      ),
  };
};

export default useClassMovement;
