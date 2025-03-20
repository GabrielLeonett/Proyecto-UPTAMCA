import { createTheme } from '@mui/material/styles';

export const Theme = createTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#1C75BA',
          light: '#5eabe7',
          dark: '#114974',
          contrastText: '#000000'
        },
        secondary: {
          main: '#FE8012',
          light: '#fea04d',
          dark: '#cb5f01',
          contrastText: '#000000'
        },
        background: {
          paper: '#0000ff'
        }
      },
    },
    dark:{
      palette:{
        primary: {
          main: '#0c324f',
          light: '#124c79',
          dark: '#061725',
          contrastText: '#000000'
        },
        secondary: {
          main: '#FE8012',
          light: '#fea04d',
          dark: '#cb5f01',
          contrastText: '#000000'
        },
        background: {
          paper: '#061725'
        }
      }
    }
  },
  typography: {
    fontFamily: ['Poppins', 'serif'].join(','),
    fontWeightBold: 'bold',
    fontWeightLight: 'light',
    fontWeightMedium: 'medium',
    fontWeightRegular: 'regular',
    h1: {
      fontSize: '3rem', // 48px
      fontWeight: 'bold',
      lineHeight: '3.625rem', // 68px
    },
    h2: {
      fontSize: '2.5rem', // 40px
      fontWeight: 'bold',
      lineHeight: '3rem', // 48px
    },
    h3: {
      fontSize: '2rem', // 32px
      fontWeight: 'bold',
      lineHeight: '2.375rem', // 38px
    },
    h4: {
      fontSize: '1.75rem', // 28px
      fontWeight: 'bold',
      lineHeight: '2.125rem', // 34px
    },
    h5: {
      fontSize: '1.5rem', // 24px
      fontWeight: 'bold',
      lineHeight: '1.75rem', // 28px
    },
    h6: {
      fontSize: '1.25rem', // 20px (ajustado según necesidades)
      fontWeight: 'bold',
      lineHeight: '1.5rem', // 24px (ajustado según necesidades)
    },
    subtitle1: {
      fontSize: '1.125rem', // 18px
      fontWeight: 'bold',
      lineHeight: '1.75rem', // 28px
    },
    subtitle2: {
      fontSize: '1rem', // 16px
      fontWeight: 'bold',
      lineHeight: '1.5rem', // 24px
    },
    body1: {
      fontSize: '1rem', // 16px
      fontWeight: 'regular',
      lineHeight: '1.5rem', // 24px
    },
    body2: {
      fontSize: '0.875rem', // 14px
      fontWeight: 'regular',
      lineHeight: '1.25rem', // 20px
    },
    button: {
      fontSize: '1rem', // 16px (ajustado según necesidades)
      fontWeight: 'regular',
      lineHeight: '1.5rem', // 24px (ajustado según necesidades)
      textTransform: 'none', // Para evitar que el texto se convierta en mayúsculas
    },
    caption: {
      fontSize: '0.75rem', // 12px
      fontWeight: 'regular',
      lineHeight: '1rem', // 16px
    },
    overline: {
      fontSize: '0.625rem', // 10px
      fontWeight: 'medium',
      lineHeight: '0.875rem', // 14px
      textTransform: 'uppercase', // Los overlines suelen estar en mayúsculas
    },
  }
});
