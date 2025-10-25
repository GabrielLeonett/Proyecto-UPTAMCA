// components/FiltroAcordeonHorario.jsx
import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Chip,
  CircularProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import useApi from "../hook/useApi";

export default function FiltroAcordeonHorario({
  onSeccionSelect,
  selectedSeccion,
}) {
  const [pnfs, setPnfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPnf, setExpandedPnf] = useState(null);
  const [expandedTrayectos, setExpandedTrayectos] = useState({});
  const axios = useApi();

  // Cargar PNFs
  useEffect(() => {
    const fetchPnfs = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/pnf");
        setPnfs(res.pnf || []);
      } catch (error) {
        console.error("Error cargando PNFs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPnfs();
  }, []);

  // Manejar expansión de PNF
  const handlePnfExpand = async (pnfId, pnfCodigo) => {
    setExpandedPnf(expandedPnf === pnfId ? null : pnfId);

    // Si se expande, cargar trayectos
    if (expandedPnf !== pnfId) {
      await fetchTrayectos(pnfId, pnfCodigo);
    }
  };

  // Manejar expansión de trayecto
  const handleTrayectoExpand = async (trayectoId, pnfId, pnfCodigo) => {
    setExpandedTrayectos((prev) => ({
      ...prev,
      [trayectoId]: !prev[trayectoId],
    }));

    // Si se expande, cargar secciones
    if (!expandedTrayectos[trayectoId]) {
      await fetchSecciones(trayectoId, pnfId, pnfCodigo);
    }
  };

  // Cargar trayectos de un PNF
  const fetchTrayectos = async (pnfId, pnfCodigo) => {
    try {
      const response = await axios.get(`/pnf/${pnfCodigo}/trayectos`);
      console.log("Trayectos recibidos:", response);

      setPnfs((prev) =>
        prev.map((pnf) =>
          pnf.id_pnf === pnfId
            ? { ...pnf, trayectos: response.trayectos || [] }
            : pnf
        )
      );
    } catch (error) {
      console.error("Error cargando trayectos:", error);
    }
  };

  // Cargar secciones de un trayecto
  const fetchSecciones = async (trayectoId, pnfId) => {
    try {
      const response = await axios.get(`/trayectos/${trayectoId}/secciones`);
      console.log("Secciones recibidas:", response.secciones);
      setPnfs((prev) =>
        prev.map((pnf) =>
          pnf.id_pnf === pnfId
            ? {
                ...pnf,
                trayectos:
                  pnf.trayectos?.map((trayecto) =>
                    trayecto.id_trayecto === trayectoId
                      ? { ...trayecto, secciones: response.secciones || [] }
                      : trayecto
                  ) || [],
              }
            : pnf
        )
      );
    } catch (error) {
      console.error("Error cargando secciones:", error);
    }
  };

  // Manejar selección de sección
  const handleSeccionClick = (seccion) => {
    if (onSeccionSelect) {
      onSeccionSelect(seccion);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", maxWidth: 800, margin: "0 auto" }}>
      {pnfs.map((pnf) => (
        <Accordion
          key={pnf.id_pnf}
          expanded={expandedPnf === pnf.id_pnf}
          onChange={() => handlePnfExpand(pnf.id_pnf, pnf.codigo_pnf)}
          sx={{ mb: 1 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
              <Typography sx={{ fontWeight: "bold", flex: 1 }}>
                {pnf.nombre_pnf}
              </Typography>
              <Chip
                label={pnf.codigo_pnf}
                size="small"
                variant="outlined"
                sx={{ ml: 1 }}
              />
              {pnf.tiene_coordinador && (
                <Chip
                  label="Con coordinador"
                  size="small"
                  color="primary"
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
          </AccordionSummary>

          <AccordionDetails sx={{ p: 0 }}>
            {pnf.trayectos?.map((trayecto) => (
              <Accordion
                key={trayecto.id_trayecto}
                expanded={expandedTrayectos[trayecto.id_trayecto] || false}
                onChange={() =>
                  handleTrayectoExpand(
                    trayecto.id_trayecto,
                    pnf.id_pnf,
                    pnf.codigo_pnf
                  )
                }
                sx={{
                  m: 0,
                  "&:before": { display: "none" },
                  boxShadow: "none",
                  border: "none",
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    backgroundColor: "grey.50",
                    borderBottom: "1px solid",
                    borderColor: "grey.200",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <Typography sx={{ fontWeight: "medium" }}>
                      Trayecto {trayecto.valor_trayecto}
                    </Typography>
                    <Chip
                      label={`${trayecto.poblacion_estudiantil} estudiantes`}
                      size="small"
                      variant="outlined"
                      sx={{ ml: 2 }}
                    />
                  </Box>
                </AccordionSummary>

                <AccordionDetails sx={{ p: 1, backgroundColor: "grey.25" }}>
                  {trayecto.secciones?.map((seccion) => (
                    <Box
                      key={seccion.id_seccion}
                      onClick={() => handleSeccionClick(seccion, pnf, trayecto)}
                      sx={{
                        p: 2,
                        m: 1,
                        border: "1px solid",
                        borderColor:
                          selectedSeccion?.id === seccion.id_seccion
                            ? "primary.main"
                            : "grey.300",
                        borderRadius: 1,
                        backgroundColor:
                          selectedSeccion?.id === seccion.id_seccion
                            ? "primary.light"
                            : "white",
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: "action.hover",
                        },
                        transition: "all 0.2s",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 1,
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight="medium">
                          Sección {seccion.valor_seccion}
                        </Typography>
                        <Chip
                          label={`${seccion.cupos_disponibles} cupos`}
                          size="small"
                          color={
                            seccion.cupos_disponibles > 0 ? "success" : "error"
                          }
                          variant="outlined"
                        />
                      </Box>

                      <Typography variant="body2" color="text.secondary">
                        Turno: {seccion.nombre_turno}
                      </Typography>

                      {/* Información adicional si existe */}
                      {seccion.aula && (
                        <Typography variant="body2" color="text.secondary">
                          Aula: {seccion.aula}
                        </Typography>
                      )}

                      {seccion.estado && (
                        <Chip
                          label={seccion.estado}
                          size="small"
                          color={
                            seccion.estado === "ACTIVA" ? "success" : "default"
                          }
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Box>
                  ))}

                  {(!trayecto.secciones || trayecto.secciones.length === 0) && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      textAlign="center"
                      sx={{ p: 2 }}
                    >
                      No hay secciones registradas para este trayecto
                    </Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}

            {(!pnf.trayectos || pnf.trayectos.length === 0) && (
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
                sx={{ p: 2 }}
              >
                No hay trayectos registrados para este PNF
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
      ))}

      {pnfs.length === 0 && (
        <Typography textAlign="center" color="text.secondary" sx={{ p: 3 }}>
          No hay PNFs registrados
        </Typography>
      )}
    </Box>
  );
}
