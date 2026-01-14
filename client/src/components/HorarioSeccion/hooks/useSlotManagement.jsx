import { useCallback } from "react";
import useSweetAlert from "../../../hook/useSweetAlert";

// Gestión de slots y disponibilidad
const useSlotManagement = (state, stateSetters, utils, actions) => {
  const {
    availableSlots,
    selectedClass,
    classToMove,
    profesorSelected,
    aulaSelected,
    unidadCurricularSelected,
    Custom,
  } = state;

  const {
    setSelectedClass,
    setClassToMove,
    setAvailableSlots,
    setAulaSelected,
    setProfesorSelected,
    setUnidadCurricularSelected,
    setTableHorario,
  } = stateSetters;

  const { completarMovimiento } = actions;
  const alert = useSweetAlert();

  // Función para limpiar todos los estados de selección
  const limpiarSelecciones = useCallback(() => {
    setSelectedClass(null);
    setClassToMove(null);
    setProfesorSelected(null);
    setAulaSelected(null);
    setUnidadCurricularSelected(null);
    setAvailableSlots([]);
  }, [
    setSelectedClass,
    setClassToMove,
    setProfesorSelected,
    setAulaSelected,
    setUnidadCurricularSelected,
    setAvailableSlots,
  ]);

  // Mover clase al horario - DEFINIR PRIMERO
  const MoverClassEnHorario = useCallback(
    (slot) => {
      const { dia_index, hora_inicio, bloques_necesarios } = slot;

      setTableHorario((prev) => {
        const nuevaMatriz = prev.map((item) => ({
          ...item,
          horas: { ...item.horas },
        }));

        // Crear la clase con formato correcto
        const nuevaClase = {
          ...classToMove,
          hora_inicio: `${Math.floor(hora_inicio / 100)}:${String(
            hora_inicio % 100
          ).padStart(2, "0")}`,
          horaFin: utils.sumar45Minutos(hora_inicio, bloques_necesarios),
        };

        // Ocupar los bloques necesarios
        for (let i = 0; i < bloques_necesarios; i++) {
          const minutosExtra = i * 45;
          const minutosTotales =
            Math.floor(hora_inicio / 100) * 60 +
            (hora_inicio % 100) +
            minutosExtra;

          const nuevasHoras = Math.floor(minutosTotales / 60);
          const nuevosMinutos = minutosTotales % 60;
          const horaHHMM = nuevasHoras * 100 + nuevosMinutos;

          nuevaMatriz[dia_index].horas[horaHHMM] = {
            ocupado: true,
            datos_clase: nuevaClase,
            bloque: i,
            bloques_totales: bloques_necesarios,
          };
        }

        return nuevaMatriz;
      });

      // Limpiar selección después de agregar
      setProfesorSelected(null);
      setUnidadCurricularSelected(null);
      setAulaSelected(null);
      setSelectedClass([]);
      setAvailableSlots([]);

      // Usar la nueva función de limpieza
      limpiarSelecciones();

      // ALERTA AGREGADA
      alert.success(
        "Clase Programada",
        `Clase programada exitosamente para ${utils.obtenerDiaNombre(
          dia_index
        )} a ${utils.formatearHora(hora_inicio)}`
      );
    },
    [
      limpiarSelecciones,
      classToMove,
      setTableHorario,
      setUnidadCurricularSelected,
      setProfesorSelected,
      setAulaSelected,
      setSelectedClass,
      setAvailableSlots,
      utils,
      alert, // ALERTA AGREGADA
    ]
  );

  // Verificar si un slot está disponible
  const isSlotAvailable = useCallback(
    (dia_index, hora) => {
      return availableSlots.some(
        (slot) =>
          slot.dia_index === dia_index &&
          hora >= slot.hora_inicio &&
          hora <
            parseInt(
              utils.sumar45Minutos(slot.hora_inicio, slot.bloques_necesarios)
            )
      );
    },
    [availableSlots, utils]
  );

  // Manejar click en slots disponibles
  const handleSlotClick = useCallback(
    async (dia_index, hora_inicio) => {
      if (!selectedClass && !classToMove) {
        alert.warning("Advertencia", "No hay clase seleccionada");
        return;
      }

      // Buscar el slot específico
      const slot = availableSlots.find(
        (slot) =>
          slot.dia_index === dia_index && slot.hora_inicio === hora_inicio
      );

      if (!slot) {
        alert.error("Error", "Este horario ya no está disponible");
        return;
      }

      if (classToMove) {
        const result = await alert.confirm(
          "Mover Clase",
          `¿Mover ${
            classToMove.nombre_unidad_curricular
          } a ${utils.obtenerDiaNombre(dia_index)} a ${utils.formatearHora(
            hora_inicio
          )}?`,
          {
            confirmButtonText: "Mover",
            cancelButtonText: "Cancelar",
          }
        );

        if (result) {
          completarMovimiento(slot);
        } else {
          alert.info("Información", "Movimiento cancelado");
        }
      } else {
        const result = await alert.confirm(
          "Programar Clase",
          `¿Programar ${
            selectedClass.nombre_unidad_curricular
          } en ${utils.obtenerDiaNombre(dia_index)} a ${utils.formatearHora(
            hora_inicio
          )}?`,
          {
            confirmButtonText: "Programar",
            cancelButtonText: "Cancelar",
          }
        );

        if (result) {
          // ✅ CORREGIDO: result es booleano, no tiene isConfirmed
          MoverClassEnHorario(slot);
        } else {
          alert.info("Información", "Programación cancelada");
        }
      }
    },
    [
      selectedClass,
      availableSlots,
      classToMove,
      completarMovimiento,
      MoverClassEnHorario,
      utils,
      alert,
    ]
  );

  // Crear nueva clase en el estado
  const crearClaseEnHorario = useCallback(
    (numClasesTotales, indexActual, horas_clase) => {
      // ✅ VERIFICAR SI YA EXISTE UN PROFESOR ASIGNADO PARA ESTA UNIDAD
      const verificarProfesorExistente = () => {
        const idUnidad = unidadCurricularSelected.id_unidad_curricular;
        let profesorAsignado = null;

        // Buscar en el horario actual si ya hay esta unidad curricular con profesor
        state.tableHorario.forEach((dia) => {
          Object.values(dia.horas).forEach((hora_actual) => {
            if (
              hora_actual?.datos_clase?.id_unidad_curricular === idUnidad &&
              hora_actual.bloque === 0
            ) {
              profesorAsignado = hora_actual.datos_clase.id_profesor;
            }
          });
        });

        return profesorAsignado;
      };

      const profesorExistente = verificarProfesorExistente();

      // ✅ SI YA HAY PROFESOR ASIGNADO, VERIFICAR QUE SEA EL MISMO
      if (
        profesorExistente &&
        profesorExistente !== profesorSelected.id_profesor
      ) {
        alert.error(
          "Error de consistencia",
          `La unidad curricular "${unidadCurricularSelected.nombre_unidad_curricular}" ya está asignada al profesor actual. No puede cambiar de profesor para horas adicionales.`
        );
        return; // No crear la clase
      }
      if (!profesorSelected || !aulaSelected || !unidadCurricularSelected) {
        alert.error("Error", "Datos incompletos para crear la clase");
        return;
      }

      // Crear un ID único que incluya timestamp y índice
      const nuevaClase = {
        id: `${Date.now()}_${indexActual}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        id_profesor: profesorSelected.id_profesor,
        id_aula: aulaSelected.id_aula,
        id_unidad_curricular: unidadCurricularSelected.id_unidad_curricular,
        nombre_profesor: profesorSelected.nombres,
        codigo_aula: aulaSelected.codigo_aula,
        apellido_profesor: profesorSelected.apellidos,
        nombre_unidad_curricular:
          unidadCurricularSelected.nombre_unidad_curricular,
        horas_clase: horas_clase,
        nueva_clase: true,
        indiceClase: indexActual + 1,
        totalClases: numClasesTotales,
      };

      // Establecer la nueva clase como seleccionada
      setSelectedClass({ ...nuevaClase });
      setClassToMove({ ...nuevaClase });

      // Si es la última clase, limpiar TODOS los estados
      if (indexActual === numClasesTotales - 1) {
        // IMPORTANTE: Limpiar en este orden para evitar problemas
        setProfesorSelected(null);
        setAulaSelected(null);
        setUnidadCurricularSelected(null);

        alert.success(
          "Éxito",
          `Todas las clases (${numClasesTotales}) creadas correctamente`
        );
      }
    },
    [
      state.tableHorario,
      profesorSelected,
      aulaSelected,
      unidadCurricularSelected,
      setSelectedClass,
      setClassToMove,
      setProfesorSelected,
      setAulaSelected,
      setUnidadCurricularSelected,
      alert,
    ]
  );

  return {
    isSlotAvailable,
    handleSlotClick,
    crearClaseEnHorario,
    MoverClassEnHorario,
  };
};

export default useSlotManagement;
