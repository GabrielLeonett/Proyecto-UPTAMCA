import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";
import CustomButton from "./customButton";
import CustomLabel from "./customLabel";
import { useState, useEffect } from "react";
import trayectoSchema from "../schemas/trayecto.schema";
import useApi from "../hook/useApi";

export default function ModalEditarCampoTrayecto({
  open,
  onClose,
  campo,
  valorActual,
  onGuardar,
}) {
  const axios = useApi();
  const [valor, setValor] = useState(valorActual || "");
  const [error, setError] = useState("");
  const [pnfs, setPnfs] = useState([]);

  // 🔄 Resetear el valor al abrir el modal
  useEffect(() => {
    setValor(valorActual || "");
    setError("");
  }, [valorActual, open]);

  // 📥 Cargar catálogos (por ejemplo, PNF si el trayecto tiene relación)
  useEffect(() => {
    const fetchPnfs = async () => {
      try {
        const data = await axios.get("/pnf");
        setPnfs(data || []);
      } catch (err) {
        console.error("Error cargando PNF:", err);
      }
    };

    fetchPnfs();
  }, [axios]);

  // 💾 Guardar cambios con validación
  const handleGuardar = () => {
    try {
      const campoSchema = trayectoSchema.pick({ [campo]: true });
      campoSchema.parse({ [campo]: valor });
      onGuardar(campo, valor);
      setError("");
      onClose();
    } catch (err) {
      setError(err.errors?.[0]?.message || "Error validando campo.");
    }
  };

  // 🧠 Render dinámico según el campo
  const renderCampo = () => {
    // Si el campo es una relación con PNF
    if (campo === "id_pnf") {
      return (
        <TextField
          select
          fullWidth
          label="Seleccione el PNF"
          variant="outlined"
          value={valor || ""}
          onChange={(e) => setValor(e.target.value)}
          error={!!error}
          helperText={error || " "}
        >
          {pnfs.map((p) => (
            <MenuItem key={p.id_pnf} value={p.id_pnf}>
              {p.nombre_pnf}
            </MenuItem>
          ))}
        </TextField>
      );
    }

    // Si el campo es numérico (por ejemplo duración o número)
    if (["numero_trayecto", "duracion_trayectos"].includes(campo)) {
      return (
        <CustomLabel
          fullWidth
          type="number"
          margin="normal"
          label={`Nuevo valor de ${String(campo).replace(/_/g, " ")}`}
          variant="outlined"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          error={!!error}
          helperText={error || " "}
        />
      );
    }

    // Si el campo es de texto (nombre, descripción, etc.)
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
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textTransform: "capitalize" }}>
        Editar {String(campo).replace(/_/g, " ")}
      </DialogTitle>

      <DialogContent>{renderCampo()}</DialogContent>

      <DialogActions sx={{ padding: "16px" }}>
        <CustomButton onClick={onClose} tipo="secondary">
          Cancelar
        </CustomButton>
        <CustomButton onClick={handleGuardar}>Guardar</CustomButton>
      </DialogActions>
    </Dialog>
  );
}
