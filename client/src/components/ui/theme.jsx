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
  shape: {
    borderRadius: 2,
  },
  spacing: 10,
  shadows: [
    'none',
    '0px 2px 4px rgba(0,0,0,0.1)',
    '0px 4px 8px rgba(0,0,0,0.12)',
    '0px 8px 16px rgba(0,0,0,0.14)',
    '0px 12px 24px rgba(0,0,0,0.16)',
    '0px 16px 32px rgba(0,0,0,0.18)',
    '0px 20px 40px rgba(0,0,0,0.20)',
    '0px 24px 48px rgba(0,0,0,0.22)',
    '0px 28px 56px rgba(0,0,0,0.24)',
    '0px 32px 64px rgba(0,0,0,0.26)',
    '0px 36px 72px rgba(0,0,0,0.28)',
    '0px 40px 80px rgba(0,0,0,0.30)',
    '0px 44px 88px rgba(0,0,0,0.32)',
    '0px 48px 96px rgba(0,0,0,0.34)',
    '0px 52px 104px rgba(0,0,0,0.36)',
    '0px 56px 112px rgba(0,0,0,0.38)',
    '0px 60px 120px rgba(0,0,0,0.40)',
    '0px 64px 128px rgba(0,0,0,0.42)',
    '0px 68px 136px rgba(0,0,0,0.44)',
    '0px 72px 144px rgba(0,0,0,0.46)',
    '0px 76px 152px rgba(0,0,0,0.48)',
    '0px 80px 160px rgba(0,0,0,0.50)',
    '0px 84px 168px rgba(0,0,0,0.52)',
    '0px 88px 176px rgba(0,0,0,0.54)',
    '0px 92px 184px rgba(0,0,0,0.56)',
  ],
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
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
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
      50: '#EAF4FC',
      contrastText: '#ffffff',
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
      50: '#FFF3E9',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a202c',
      secondary: '#718096',
      disabled: '#a0aec0',
    },
    divider: '#e2e8f0',
    action: {
      active: '#1C75BA',
      hover: 'rgba(28, 117, 186, 0.04)',
      selected: 'rgba(28, 117, 186, 0.08)',
      disabled: '#a0aec0',
      disabledBackground: 'rgba(0, 0, 0, 0.12)',
    },
    grey: {
      50: '#f7fafc',
      100: '#edf2f7',
      200: '#e2e8f0',
      300: '#cbd5e0',
      400: '#a0aec0',
      500: '#718096',
      600: '#4a5568',
      700: '#2d3748',
      800: '#1a202c',
      900: '#171923',
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
      50: '#1C2226',
      contrastText: '#ffffff',
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
      50: '#FFF3E9',
      contrastText: '#ffffff',
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
      disabled: '#666666',
    },
    divider: '#333333',
    action: {
      active: '#1C75BA',
      hover: 'rgba(28, 117, 186, 0.08)',
      selected: 'rgba(28, 117, 186, 0.16)',
      disabled: '#666666',
      disabledBackground: 'rgba(255, 255, 255, 0.12)',
    },
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
  },
});

// Exporta un tema por defecto (opcional)
export default lightTheme;