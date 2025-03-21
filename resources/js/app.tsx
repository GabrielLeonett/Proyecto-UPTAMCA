import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { createTheme, ThemeProvider } from '@mui/material/styles'; // Importa createTheme y ThemeProvider
import { CssBaseline } from '@mui/material';

// Define el tema usando createTheme
const Theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1c75ba',
    },
    secondary: {
      main: '#fe8012',
    },
    background: {
      default: '#f3f3f3',
    },
  },
  typography: {
    fontFamily: 'Poppins',
    fontStyle: 'normal', // Establece el fontStyle global como 'normal'
    h1: {
      fontSize: 48,
      fontWeight: 700,
      fontStyle: 'normal', // Asegura que el fontStyle sea normal
    },
    h2: {
      fontSize: 40,
      fontWeight: 700,
      fontStyle: 'normal',
    },
    h3: {
      fontWeight: 700,
      fontSize: 32,
      fontStyle: 'normal',
    },
    h4: {
      fontSize: 28,
      fontWeight: 700,
      fontStyle: 'normal',
    },
    h5: {
      fontSize: 24,
      fontWeight: 700,
      fontStyle: 'normal',
    },
    subtitle1: {
      fontSize: 18,
      fontWeight: 600,
      fontStyle: 'normal',
    },
    subtitle2: {
      fontSize: 16,
      fontWeight: 600,
      fontStyle: 'normal',
    },
    body1: {
      fontSize: 16,
      fontWeight: 400,
      fontStyle: 'normal',
    },
    body2: {
      fontSize: 16,
      fontWeight: 500,
      fontStyle: 'normal',
    },
    button: {
      fontSize: 14,
      fontWeight: 600,
      fontStyle: 'normal',
    },
    caption: {
      fontSize: 12,
      fontWeight: 300,
      fontStyle: 'normal',
    },
    overline: {
      fontSize: 12,
      fontWeight: 300,
      fontStyle: 'normal',
    },
  },
});

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
  title: (title) => `${title} - ${appName}`,
  resolve: (name) =>
    resolvePageComponent(
      `./pages/${name}.tsx`,
      import.meta.glob('./pages/**/*.tsx')
    ),
  setup({ el, App, props }) {
    const root = createRoot(el);

    root.render(
      <ThemeProvider theme={Theme}>
        <CssBaseline />
        <App {...props} />
      </ThemeProvider>
    );
  },
  progress: {
    color: '#4B5563',
  },
});