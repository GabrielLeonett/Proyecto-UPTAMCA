import { createTheme } from '@mui/material/styles';

const baseTheme = {
  typography: {
    fontFamily: '"Poppins", "serif"',
    h1: {
      fontSize: '3rem',
      fontWeight: 'bold',
      lineHeight: '3.625rem',
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      lineHeight: '3rem',
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 'bold',
      lineHeight: '2.375rem',
    },
    h4: {
      fontSize: '1.75rem',
      fontWeight: 'bold',
      lineHeight: '2.125rem',
    },
    h5: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      lineHeight: '1.75rem',
    },
    h6: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      lineHeight: '1.5rem',
    },
    subtitle1: {
      fontSize: '1.125rem',
      fontWeight: 'bold',
      lineHeight: '1.75rem',
    },
    subtitle2: {
      fontSize: '1rem',
      fontWeight: 'bold',
      lineHeight: '1.5rem',
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 'regular',
      lineHeight: '1.5rem',
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 'regular',
      lineHeight: '1.25rem',
    },
    button: {
      fontSize: '0.8rem',
      fontWeight: 'regular',
      lineHeight: '1.5rem',
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 'regular',
      lineHeight: '1rem',
    },
    overline: {
      fontSize: '0.625rem',
      fontWeight: 'medium',
      lineHeight: '0.875rem',
      textTransform: 'uppercase',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '@font-face': {
          fontFamily: 'Poppins',
          fontStyle: 'normal',
          fontDisplay: 'swap',
        },
      },
    },
  },
};

export const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'light',
    primary: {
      main: '#1C75BA',
      light: '#5eabe7',
      dark: '#114974',
      contrastText: '#ffffff', // Cambiado a blanco para mejor legibilidad
    },
    secondary: {
      main: '#FE8012',
      light: '#fea04d',
      dark: '#cb5f01',
      contrastText: '#ffffff', // Cambiado a blanco para mejor legibilidad
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
});

export const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#0c324f',
      light: '#124c79',
      dark: '#061725',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#FE8012',
      light: '#fea04d',
      dark: '#cb5f01',
      contrastText: '#ffffff',
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
  },
});

// Exporta un tema por defecto (opcional)
export default lightTheme;