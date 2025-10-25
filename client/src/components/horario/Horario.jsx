import React, { useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  useTheme,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  ConstructionOutlined,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";

// Hooks
import useHorarioState from "./hooks/useHorarioState";
import useHorarioData from "./hooks/useHorarioData";
import useClassMovement from "./hooks/useClassMovement";
import useSlotManagement from "./hooks/useSlotManagement";
import useHorarioEffects from "./hooks/useHorarioEffects";

// Components
import HorarioTable from "./components/HorarioTable";
import ClassForm from "./components/ClassForm";
import StatusMessages from "./components/StatusMessages";
import TableOverlay from "./components/TableOverlay";

// Utils
import { UTILS } from "../../utils/utils";
import useApi from "../../hook/useApi";

const Horario = ({
  PNF,
  Trayecto,
  Seccion,
  Horario: initialHorario,
  Turno,
  Custom = true,
}) => {
  const theme = useTheme();
  const axios = useApi();

  // Props para pasar a los hooks
  const props = {
    PNF,
    Trayecto,
    Seccion,
    Horario: initialHorario,
    Turno,
    Custom,
  };

  // 1. Estado principal
  const {
    // Estados
    tableHorario,
    selectedClass,
    availableSlots,
    unidadesCurriculares,
    profesores,
    aulas,
    loading,
    classToMove,
    overlayVisible,

    // Setters individuales
    setOverlayVisible,

    // Agrupados
    state,
    stateSetters,
  } = useHorarioState();

  // 2. Datos
  useHorarioData(axios, props, state, stateSetters, Custom);

  // 3. Movimiento de clases
  const movementActions = useClassMovement(state, stateSetters, UTILS);

  // 4. Gestión de slots
  const slotActions = useSlotManagement(
    state,
    stateSetters,
    UTILS,
    movementActions
  );

  // 5. Efectos
  useHorarioEffects(
    props,
    state,
    { ...movementActions, ...slotActions },
    stateSetters
  );

  // Handlers para los componentes
  const handleUnidadChange = useCallback(
    (unidadId) => {
      const unidad = unidadesCurriculares.find(
        (u) => u.id_unidad_curricular === unidadId
      );
      console.log("Esta es la unidad nueva:", unidad);
      stateSetters.setUnidadCurricularSelected(unidad);
    },
    [unidadesCurriculares, stateSetters]
  );

  const handleProfesorChange = useCallback(
    (profesorId) => {
      const profesor = profesores.find((p) => p.id_profesor === profesorId);
      stateSetters.setProfesorSelected(profesor);
      stateSetters.setAulaSelected({});
    },
    [profesores, stateSetters]
  );

  const handleAulaChange = useCallback(
    (aulaId) => {
      const aula = aulas.find((a) => a.id_aula === aulaId);
      console.log(aula);
      stateSetters.setAulaSelected(aula);
    },
    [aulas, stateSetters]
  );

  /*
const handleSave = useCallback(async () => {
  try {
    setLoading(true);
    // Aquí iría la lógica para guardar el horario
    console.log("Guardando horario...", tableHorario);
    // await dataFetchers.saveHorario(tableHorario);
    alert("Horario guardado exitosamente");
  } catch (error) {
    console.error("Error guardando horario:", error);
    alert("Error al guardar el horario");
  } finally {
    setLoading(false);
  }
}, [tableHorario, setLoading]);

*/
  /*const handleDelete = useCallback(() => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar el horario actual?")
    ) {
      setTableHorario(
        ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"].map(
          (dia) => ({ dia, horas: { ...initialHours } })
        )
      );
      setSelectedClass(null);
      setClassToMove(null);
      setAvailableSlots([]);
      setNewClass({ profesor: null, unidad: null, aula: null });
      alert("Horario eliminado");
    }
  }, [
    setTableHorario,
    setSelectedClass,
    setClassToMove,
    setAvailableSlots,
    setNewClass,
  ]);*/

  const handleEditMode = useCallback(() => {
    setOverlayVisible(false);
    // Lógica adicional para modo edición si es necesaria
    console.log("Activando modo edición");
  }, [setOverlayVisible]);

  const handlePrint = useCallback(async () => {
    console.log("🖨 handlePrint ejecutado"); // <-- prueba directa
    try {
      setOverlayVisible(false);
      const idSeccion = Seccion?.id_seccion;

      console.log(`📥 Descargando horario PDF para sección ${idSeccion}...`);

      const response = await axios.get(`/exportar/${idSeccion}`, {
        responseType: "blob",
      });

      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `Horario_${idSeccion}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      console.log("✅ Archivo PDF descargado correctamente.");
    } catch (error) {
      console.error("❌ Error al descargar el horario:", error);
    }
  }, [axios, Seccion, setOverlayVisible]);

  const handleCloseOverlay = useCallback(() => {
    setOverlayVisible(false);
  }, [setOverlayVisible]);

  // Handler para activar el overlay con botón
  /*const handleShowOverlay = useCallback(() => {
    if (Custom) {
      console.log("🔘 Botón - mostrando overlay");
      setOverlayVisible(true);
    }
  }, [Custom, setOverlayVisible]);

  const handleClearSelection = useCallback(() => {
    setSelectedClass(null);
    setClassToMove(null);
    setAvailableSlots([]);
    setNewClass({ profesor: null, unidad: null, aula: null });
  }, [setSelectedClass, setClassToMove, setAvailableSlots, setNewClass]);
  */

  return (
    <Container maxWidth="xl" sx={{ py: 4, position: "relative" }}>
      {/* CONTENEDOR PRINCIPAL CORREGIDO - SIN DUPLICADOS */}
      <Box sx={{ position: "relative", minHeight: "400px" }}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "flex-start",
          }}
        >
          {/* Tabla del horario */}
          <Box
            sx={{
              flex: 1,
              position: "relative", // 👈 Asegura el contexto para el overlay
              border: overlayVisible
                ? `2px solid ${theme.palette.primary.main}`
                : "2px solid transparent",
              borderRadius: 2,
              transition: "border 0.3s ease",
              minHeight: "500px",
              zIndex: 1, // 👈 Asegura que esté por encima de otros contenedores
              overflow: "hidden", // 👈 Evita que el overlay se salga del borde redondeado
            }}
            onDoubleClick={() => setOverlayVisible((prev) => !prev)}
          >
            {/* Tabla siempre interactiva */}
            <HorarioTable
              tableHorario={tableHorario}
              availableSlots={availableSlots}
              isSlotAvailable={slotActions.isSlotAvailable}
              handleSlotClick={slotActions.handleSlotClick}
              handleMoveRequest={movementActions.handleMoveRequest}
              selectedClass={selectedClass}
              classToMove={classToMove}
              Custom={Custom}
              PNF={PNF}
              Trayecto={Trayecto}
              Seccion={Seccion}
            />

            {/* Overlay */}
            <TableOverlay
              isVisible={overlayVisible}
              Custom={Custom}
              onEdit={handleEditMode}
              onPrint={handlePrint}
              onClose={handleCloseOverlay}
              title={`Horario - ${PNF} ${
                Trayecto ? `Trayecto ${Trayecto}` : ""
              } ${Seccion?.seccion ? `Sección ${Seccion.seccion}` : ""}`}
            />
          </Box>
        </Box>

        {/* Formulario para nueva clase - SOLO UNA VEZ */}
        {Custom && (
          <Box sx={{ mt: 3 }}>
            <ClassForm
              unidadesCurriculares={unidadesCurriculares}
              unidadCurricularSelected={state.unidadCurricularSelected}
              profesores={profesores}
              profesorSelected={state.profesorSelected}
              aulas={aulas}
              aulaSelected={state.aulaSelected}
              onUnidadChange={handleUnidadChange}
              onProfesorChange={handleProfesorChange}
              onAulaChange={handleAulaChange}
              Custom={Custom}
              loading={loading}
              errors={{}}
            />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Horario;
