import { TextField } from "@mui/material";
import {useTheme} from "@mui/material";

export default function CustomLabel({ ...props }) {
  const theme = useTheme();
  return (
    <TextField
      sx={{
        "& .MuiInputLabel-root": {
          // Estilo para la etiqueta
          borderColor: theme.palette.primary.main, // Color del borde al pasar el mouse
          color: theme.palette.text.primary
        },
        "& .MuiInputLabel-shrink": {
          // Estilo para la etiqueta cuando el campo está enfocado o tiene valor
          borderColor: theme.palette.primary.main, // Color del borde al pasar el mouse
          color: theme.palette.text.primary
        },
        "& .MuiOutlinedInput-root": {
          // Estilo para el campo de entrada
          "& fieldset": {
            borderColor: theme.palette.primary.light, // Color del borde del campo
            color: theme.palette.text.primary
          },
          "&:hover fieldset": {
            borderColor: theme.palette.primary.main, // Color del borde al pasar el mouse
            color: theme.palette.text.primary
          },
          "&.Mui-focused fieldset": {
            borderColor: theme.palette.primary.main, // Color del borde cuando está enfocado
            color: theme.palette.text.primary
          },
        },
      }}
      {...props}
    />
  );
}
