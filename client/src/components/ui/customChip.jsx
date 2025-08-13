import React from "react";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import Swal from "sweetalert2";

export default function DeletableChips({ values = [], onChange }) {
  const handleDelete = (label) => {
    const newValues = values.filter((v) => v !== label);
    onChange(newValues);
  };

  const handleAdd = async () => {
    const { value: text } = await Swal.fire({
      title: "Agregar área",
      input: "text",
      inputLabel: "Nueva área de conocimiento",
      inputPlaceholder: "Escribe aquí...",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "Por favor ingresa un valor";
        }
        if (values.includes(value)) {
          return "Esta área ya está agregada";
        }
        return null;
      },
    });

    if (text) {
      onChange([...values, text]);
    }
  };

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
      {values.map((label) => (
        <Chip
          key={label}
          label={label}
          onDelete={() => handleDelete(label)}
          color={label === "Otro" ? "secondary" : "primary"}
          variant="outlined"
        />
      ))}
      <IconButton size="small" color="primary" onClick={handleAdd}>
        <AddIcon />
      </IconButton>
    </Stack>
  );
}
