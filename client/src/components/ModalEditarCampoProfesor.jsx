import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  TextField,
  Autocomplete,
  Box,
  Chip,
} from "@mui/material";
import CustomButton from "./customButton";
import CustomLabel from "./customLabel";
import CustomChip from "./CustomChip";
import { useState, useEffect } from "react";
import { profesorSchema } from "../schemas/profesor.schema";
import useApi from "../hook/useApi";
import useSweetAlert from "../hook/useSweetAlert";

export default function ModalEditarCampoProfesor({
  open,
  onClose,
  campo,
  valorActual,
  onGuardar,
}) {
  const axios = useApi();
  const alert = useSweetAlert();
  const [valor, setValor] = useState(valorActual || []);
  const [error, setError] = useState("");
  const [preGrado, setPreGrado] = useState([]);
  const [posGrado, setPosGrado] = useState([]);
  const [areaConocimiento, setAreaConocimiento] = useState([]);
  const [cargando, setCargando] = useState(false);

  // Resetear el valor al abrir
  useEffect(() => {
    const initialValue = Array.isArray(valorActual) ? valorActual : [];
    setValor(initialValue);
    setError("");
  }, [valorActual, open]);

  // Cargar catálogos SOLO cuando sea necesario según el campo
  useEffect(() => {
    const fetchCatalogosNecesarios = async () => {
      if (!open) return;

      setCargando(true);
      try {
        if (campo === "pre_grados") {
          const pre = await axios.get("/catalogos/pregrados");
          setPreGrado(pre || []);
        } else if (campo === "pos_grados") {
          const pos = await axios.get("/catalogos/posgrados");
          setPosGrado(pos || []);
        } else if (campo === "areas_de_conocimiento") {
          const area = await axios.get("/catalogos/areas-conocimiento");
          setAreaConocimiento(area?.areas_conocimiento || []);
        }
        // Para otros campos no cargamos nada
      } catch (err) {
        console.error("Error cargando catálogos:", err);
      } finally {
        setCargando(false);
      }
    };

    fetchCatalogosNecesarios();
  }, [campo, open, axios]);

const handleGuardar = async () => {
  try {
    // ✅ Confirmar antes de guardar cambios
    const confirm = await alert.confirm(
      "¿Desea guardar los cambios?",
      "El valor actual del campo será reemplazado por el nuevo."
    );
    if (!confirm) return;

    // ✅ Validar campo con esquema de Zod
    const campoSchema = profesorSchema.pick({ [campo]: true });
    campoSchema.parse({ [campo]: valor });

    // ✅ Si pasa validación → guardar cambios
    onGuardar(campo, valor);
    setError("");

    // 🔽 Aquí va el toast de éxito
    alert.toast({
      title: "Campo actualizado",
      message: "El valor se guardó correctamente.",
      config: { icon: "success" },
    });

    onClose();
  } catch (err) {
    console.error("❌ ERROR en handleGuardar:", err);

    // ⚠️ Si hay errores de validación de Zod → mostrar con toast
    if (err.errors && Array.isArray(err.errors)) {
      err.errors.forEach((e) => {
        // 🔽 Aquí van los toast de advertencia de validación
        alert.toast({
          title: "Validación",
          message: e.message,
          config: { icon: "warning" },
        });
      });
      setError(err.errors?.[0]?.message || "Error validando campo.");
    } else {
      // 🔽 Aquí va el toast de error general
      alert.toast({
        title: "Error al guardar",
        message: err.message || "El valor ingresado no es válido.",
        config: { icon: "error" },
      });

      setError("Error validando campo.");
    }
  }
};


  // Función para eliminar un item
  const handleDeleteItem = (indexToDelete) => {
    if (Array.isArray(valor)) {
      const newValue = valor.filter((_, index) => index !== indexToDelete);
      setValor(newValue);
    }
  };

  // Render dinámico según el campo
  const renderCampo = () => {
    if (campo === "pre_grados") {
      return (
        <Box>
          <CustomLabel
            selected
            label="Pre Grados"
            fullWidth
            disabled={cargando}
            onChange={(e) => {
              const selectedValue = e.target.value;
              if (selectedValue === "Otro") {
                alert("Abrir modal para nuevo pregrado");
              } else if (selectedValue && Array.isArray(valor)) {
                const exists = valor.some(
                  (item) => item.nombre_pre_grado === selectedValue
                );
                if (!exists) {
                  const pregradoCompleto = preGrado.find(
                    (pg) => pg.nombre_pre_grado === selectedValue
                  );
                  if (pregradoCompleto) {
                    setValor([...valor, ...pregradoCompleto]);
                  }
                }
              }
            }}
            value=""
          >
            <MenuItem value="">
              {cargando ? "Cargando..." : "Seleccione un pregrado"}
            </MenuItem>
            {Array.isArray(preGrado) &&
              preGrado.map((pg) => (
                <MenuItem key={pg.id_pre_grado} value={pg.nombre_pre_grado}>
                  {pg.tipo_pre_grado} {pg.nombre_pre_grado}
                </MenuItem>
              ))}
            <MenuItem value="Otro">Otro</MenuItem>
          </CustomLabel>

          {/* CustomChips para mostrar seleccionados */}
          {Array.isArray(valor) && valor.length > 0 && (
            <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
              {valor.map((pregrado, index) => (
                <CustomChip
                  key={pregrado.id_pre_grado || index}
                  label={`${pregrado.tipo_pre_grado} ${pregrado.nombre_pre_grado}`}
                  color="primary"
                  deletable
                  variant="outlined"
                  onDelete={() => handleDeleteItem(index)}
                  size="small"
                />
              ))}
            </Box>
          )}
        </Box>
      );
    }

    if (campo === "pos_grados") {
      return (
        <Box>
          <CustomLabel
            select
            label="Pos Grados"
            fullWidth
            disabled={cargando}
            onChange={(e) => {
              const selectedValue = e.target.value;
              if (selectedValue === "Otro") {
                alert("Abrir modal para nuevo posgrado");
              } else if (selectedValue && Array.isArray(valor)) {
                const exists = valor.some(
                  (item) => item.nombre_pos_grado === selectedValue
                );
                if (!exists) {
                  const posgradoCompleto = posGrado.find(
                    (pg) => pg.nombre_pos_grado === selectedValue
                  );
                  if (posgradoCompleto) {
                    setValor([...valor, ...posgradoCompleto]);
                  }
                }
              }
            }}
            value=""
          >
            <MenuItem value="">
              {cargando ? "Cargando..." : "Seleccione un posgrado"}
            </MenuItem>
            {Array.isArray(posGrado) &&
              posGrado.map((pg) => (
                <MenuItem key={pg.id_pos_grado} value={pg.nombre_pos_grado}>
                  {pg.tipo_pos_grado} {pg.nombre_pos_grado}
                </MenuItem>
              ))}
            <MenuItem value="Otro">Otro</MenuItem>
          </CustomLabel>

          {/* CustomChips para posgrados seleccionados */}
          {Array.isArray(valor) && valor.length > 0 && (
            <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
              {valor.map((posgrado, index) => (
                <CustomChip
                  variant="outlined"
                  key={posgrado.id_pos_grado || index}
                  label={`${posgrado.tipo_pos_grado} ${posgrado.nombre_pos_grado}`}
                  color="primary"
                  deletable
                  onDelete={() => handleDeleteItem(index)}
                  size="small"
                />
              ))}
            </Box>
          )}
        </Box>
      );
    }

    if (campo === "areas_de_conocimiento") {
      return (
        <Box>
          <CustomLabel
            select
            label="Áreas de Conocimiento"
            fullWidth
            disabled={cargando}
            onChange={(e) => {
              const selectedValue = e.target.value;
              if (selectedValue === "Otro") {
                alert("Abrir modal para nueva área");
              } else if (selectedValue && Array.isArray(valor)) {
                const exists = valor.some(
                  (item) => item.nombre === selectedValue
                );
                if (!exists) {
                  const areaCompleta = areaConocimiento.find(
                    (a) => a.nombre_area_conocimiento === selectedValue
                  );
                  if (areaCompleta) {
                    setValor([...valor, areaCompleta]);
                  }
                }
              }
            }}
            value=""
          >
            <MenuItem value="">
              {cargando ? "Cargando..." : "Seleccione un área"}
            </MenuItem>
            {Array.isArray(areaConocimiento) &&
              areaConocimiento.map((a) => (
                <MenuItem
                  key={a.id_area_conocimiento}
                  value={a.nombre_area_conocimiento}
                >
                  {a.nombre_area_conocimiento}
                </MenuItem>
              ))}
            <MenuItem value="Otro">Otro</MenuItem>
          </CustomLabel>

          {/* CustomChips para áreas seleccionadas */}
          {Array.isArray(valor) && valor.length > 0 && (
            <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
              {valor.map((area, index) => (
                <CustomChip
                  variant="outlined"
                  key={area.id_area_conocimiento || index}
                  label={area.nombre_area_conocimiento}
                  color="primary"
                  size="small"
                  deletable
                  onDelete={() => handleDeleteItem(index)}
                />
              ))}
            </Box>
          )}
        </Box>
      );
    }

    if (campo === "categoria") {
      return (
        <CustomLabel
          select
          id="categoria"
          label="Categoría"
          variant="outlined"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          error={!!error}
          helperText={error}
          fullWidth
        >
          <MenuItem value="Instructor">Instructor</MenuItem>
          <MenuItem value="Asistente">Asistente</MenuItem>
          <MenuItem value="Asociado">Asociado</MenuItem>
          <MenuItem value="Agregado">Agregado</MenuItem>
          <MenuItem value="Titular">Titular</MenuItem>
        </CustomLabel>
      );
    }

    if (campo === "dedicacion") {
      return (
        <CustomLabel
          select
          id="dedicacion"
          label="Dedicación"
          variant="outlined"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          error={!!error}
          helperText={error}
          fullWidth
        >
          <MenuItem value="Convencional">Convencional</MenuItem>
          <MenuItem value="Medio Tiempo">Medio Tiempo</MenuItem>
          <MenuItem value="Tiempo Completo">Tiempo Completo</MenuItem>
          <MenuItem value="Exclusivo">Exclusivo</MenuItem>
        </CustomLabel>
      );
    }

    // Default: campo de texto normal (no carga ningún catálogo)
    return (
      <CustomLabel
        fullWidth
        margin="normal"
        label={`Nuevo valor de ${String(campo).replace(/_/g, " ")}`}
        variant="outlined"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        error={!!error}
        helperText={error || " "}
      />
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ textTransform: "capitalize" }}>
        Editar {String(campo).replace(/_/g, " ")}
      </DialogTitle>

      <DialogContent>{renderCampo()}</DialogContent>

      <DialogActions sx={{ padding: "16px" }}>
        <CustomButton onClick={onClose} tipo="secondary">
          Cancelar
        </CustomButton>
        <CustomButton onClick={handleGuardar} disabled={cargando}>
          {cargando ? "Cargando..." : "Guardar"}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
}