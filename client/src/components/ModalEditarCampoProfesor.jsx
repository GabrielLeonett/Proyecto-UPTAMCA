import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  TextField,
  Autocomplete,
} from "@mui/material";
import CustomButton from "./customButton";
import CustomLabel from "./customLabel";
import { useState, useEffect } from "react";
import { profesorSchema } from "../schemas/profesor.schema";
import useApi from "../hook/useApi";

export default function ModalEditarCampoProfesor({
  open,
  onClose,
  campo,
  valorActual,
  onGuardar,
}) {
  const axios = useApi();
  const [valor, setValor] = useState(valorActual || "");
  const [error, setError] = useState("");
  const [preGrado, setPreGrado] = useState([]);
  const [posGrado, setPosGrado] = useState([]);
  const [areaConocimiento, setAreaConocimiento] = useState([]);

  // Resetear el valor al abrir
  useEffect(() => {
    setValor(valorActual || "");
    setError("");
  }, [valorActual, open]);

  // Cargar catálogos
  useEffect(() => {
    const fetchCatalogos = async () => {
      try {
        const [pre, pos, area] = await Promise.all([
          axios.get("/catalogos/pregrados"),
          axios.get("/catalogos/posgrados"),
          axios.get("/catalogos/areas-conocimiento"),
        ]);
        console.log(pre, pos, area.areas_conocimiento)

        setPreGrado(pre || []);
        setPosGrado(pos || []);
        setAreaConocimiento(area?.areas_conocimiento || []);
      } catch (err) {
        console.error("Error cargando catálogos:", err);
      }
    };

    fetchCatalogos();
  }, []);

  const handleGuardar = () => {
    try {
      const campoSchema = profesorSchema.pick({ [campo]: true });
      campoSchema.parse({ [campo]: valor });
      onGuardar(campo, valor);
      setError("");
      onClose();
    } catch (err) {
      setError(err.errors?.[0]?.message || "Error validando campo.");
    }
  };

  // Render dinámico según el campo
  const renderCampo = () => {
    if (campo === "pre_grados") {
      return (
        <Autocomplete
          multiple
          options={[
            ...preGrado.map((pg) => ({
              id: pg.id_pre_grado,
              nombre: pg.nombre_pre_grado,
              tipo: pg.tipo_pre_grado,
            })),
            { id: "otro", nombre: "Otro", tipo: "Otros" },
          ]}
          groupBy={(opt) => opt.tipo}
          getOptionLabel={(opt) => opt.nombre}
          value={Array.isArray(valor) ? valor : []}
          onChange={(_, newValue) => {
            if (newValue.some((v) => v.nombre === "Otro")) {
              <ModalRegisterPreGrado />;
              alert("Abrir modal de registro de nuevo pregrado");
              newValue = newValue.filter((v) => v.nombre !== "Otro");
            }
            setValor(newValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Seleccione pregrado"
              variant="outlined"
              error={!!error}
              helperText={error || " "}
            />
          )}
        />
      );
    }

    if (campo === "pos_grados") {
      return (
        <Autocomplete
          multiple
          options={[
            ...posGrado.map((pg) => ({
              id: pg.id_pos_grado,
              nombre: pg.nombre_pos_grado,
              tipo: pg.tipo_pos_grado,
            })),
            { id: "otro", nombre: "Otro", tipo: "Otros" },
          ]}
          groupBy={(opt) => opt.tipo}
          getOptionLabel={(opt) => opt.nombre}
          value={Array.isArray(valor) ? valor : []}
          onChange={(_, newValue) => {
            if (newValue.some((v) => v.nombre === "Otro")) {
              alert("Abrir modal de registro de nuevo posgrado");
              newValue = newValue.filter((v) => v.nombre !== "Otro");
            }
            setValor(newValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Seleccione posgrado"
              variant="outlined"
              error={!!error}
              helperText={error || " "}
            />
          )}
        />
      );
    }

    if (campo === "areas_de_conocimiento") {
      return (
        <Autocomplete
          multiple
          options={[
            ...areaConocimiento.map((a) => ({
              id: a.id_area_conocimiento,
              nombre: a.nombre_area_conocimiento,
            })),
            { id: "otro", nombre: "Otro" },
          ]}
          getOptionLabel={(opt) => opt.nombre}
          value={Array.isArray(valor) ? valor : []}
          onChange={(_, newValue) => {
            if (newValue.some((v) => v.nombre === "Otro")) {
              alert("Abrir modal de registro de nueva área");
              newValue = newValue.filter((v) => v.nombre !== "Otro");
            }
            setValor(newValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Seleccione área de conocimiento"
              variant="outlined"
              error={!!error}
              helperText={error || " "}
            />
          )}
        />
      );
    }

    // Default: campo de texto normal
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
