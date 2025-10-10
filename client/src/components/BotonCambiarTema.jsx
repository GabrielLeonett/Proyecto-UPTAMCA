import Button from '@mui/material/Button';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';

export default function BotonCambiarTema({ setMode, mode }) {
  const theme = useTheme();

  return (
    <Tooltip title={mode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
      <Button
        onClick={() => {
          console.log('Modo actual:', mode);
          setMode(!mode);
        }}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          minWidth: 'auto',
          width: 48,
          height: 48,
          borderRadius: '50%',
          backgroundColor: theme.palette.primary.light,
          color: theme.palette.text.primary,
          boxShadow: theme.shadows[4],
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
            boxShadow: theme.shadows[6]
          },
          zIndex: 9999
        }}
        aria-label="Cambiar tema"
      >
        {mode ? (
          <LightModeIcon fontSize="medium" />
        ) : (
          <DarkModeIcon fontSize="medium" />
        )}
      </Button>
    </Tooltip>
  );
}