import { createTheme } from '@mui/material/styles';

const ThemeDefault = createTheme({
  palette: {
    mode: 'dark', // Modo oscuro
    primary: {
      main: '#ff5722', // Naranja
      light: '#ff8a50', // Naranja claro
      dark: '#c41c00',  // Naranja oscuro
    },
    secondary: {
      main: '#00bcd4', // Cyan
      light: '#62efff', // Cyan claro
      dark: '#008ba3',  // Cyan oscuro
    },
    background: {
      default: '#1a1a1a', // Fondo oscuro personalizado
      paper: '#262626',    // Superficie oscura personalizada
    },
    text: {
      primary: '#ffffff', // Texto blanco
      secondary: '#b3b3b3', // Texto gris claro
      disabled: '#666666',  // Texto deshabilitado
    }
  },
});

export default ThemeDefault;