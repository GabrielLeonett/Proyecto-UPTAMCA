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
      900: '#1C75BA',
      800: '#1F82CF',
      700: '#298FDF',
      600: '#3E9AE2',
      500: '#53A6E5',
      400: '#69B1E8',
      300: '#7EBCEC',
      200: '#94C7EF',
      100: '#A9D2F2',
      50: 'EAF4FC',
      contrastText: '#ffffff', // Cambiado a blanco para mejor legibilidad
    },
    secondary: {
      main: '#FE8012',
      900: '#FE8012',
      800: '#FE8C28',
      700: '#FE973D',
      600: '#FEA353',
      500: '#FEAE68',
      400: '#FEBA7E',
      300: '#FFC593',
      200: '#FFD1A9',
      100: '#FFDCBE',
      50: 'FFF3E9',
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
      main: '#1C75BA',
      900: '#1C75BA',
      800: '#242B30',
      700: '#232A2F',
      600: '#22282E',
      500: '#21272D',
      400: '#20262B',
      300: '#1F252A',
      200: '#1E2429',
      100: '#1D2328',
      50: '1C2226',
      contrastText: '#ffffff', // Cambiado a blanco para mejor legibilidad
    },
    secondary: {
      main: '#FE8012',
      900: '#FE8012',
      800: '#FE8C28',
      700: '#FE973D',
      600: '#FEA353',
      500: '#FEAE68',
      400: '#FEBA7E',
      300: '#FFC593',
      200: '#FFD1A9',
      100: '#FFDCBE',
      50: 'FFF3E9',
      contrastText: '#ffffff', // Cambiado a blanco para mejor legibilidad
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
  },
});

// Exporta un tema por defecto (opcional)
export default lightTheme;