import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';

export default function CustomButton({ tipo = 'primary', ...props }) {
  const theme = useTheme();

  return (
    <Button
      sx={{
        // Estilos base (equivalente a %Botones)
        padding: '8px 16px',
        borderRadius: '4px',
        fontWeight: 500,
        textTransform: 'none',
        transition: 'all 0.5s ease',

        // Estilos dinámicos según el tipo
        ...(tipo === 'primary' && {
          backgroundColor: theme.palette.primary[500], // $Primary-500
          color: theme.palette.primary.contrastText,
          borderRadius: '12px',
          '&:hover': {
            backgroundColor: theme.palette.primary[700], // $Primary-900
          },
          '&:active': {
            backgroundColor: theme.palette.primary[800], // $Primary-700
          },
          // Estilos cuando está disabled
          '&.Mui-disabled': {
            backgroundColor: theme.palette.action.disabledBackground, // o un color personalizado
            color: theme.palette.action.disabled,
            // otras propiedades CSS que quieras cambiar
          }
        }),
        ...(tipo === 'secondary' && {
          backgroundColor: theme.palette.secondary[200], // $Secondary-100
          color: theme.palette.secondary[500], // $Secondary-700
          border: `1.5px solid ${theme.palette.secondary[500]}`, // $Secondary-500
          borderRadius: '12px',
          '&:hover': {
            backgroundColor: theme.palette.secondary[300], // $Secondary-400
          },
          '&:active': {
            backgroundColor: theme.palette.secondary[500], // $Secondary-800
          },
        }),
        ...(tipo === 'extra' && {
          backgroundColor: '#f5f5f5', // $Primary-50
          color: '#64b5f6', // $Primary-400
          border: '1px solid #53A6E5', // $Primary-200
          borderRadius: '12px',
          '&:hover': {
            backgroundColor: '#e0e0e0', // $Primary-700 (ajustado a gris)
          },
          '&:active': {
            backgroundColor: '#bdbdbd', // $Primary-800 (ajustado a gris)
          },
        }),
      }}
      {...props} // 👈 Pasa todas las props nativas de MUI Button (onClick, disabled, etc.)
    >
      {props.children}
    </Button>
  );
}