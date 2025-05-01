import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'public', // Cambia la carpeta de salida a 'public'
    rollupOptions: {
      input: {
        // Puntos de entrada: cada página .tsx tendrá su HTML
        main: resolve(__dirname, 'index.html'),  // Punto de entrada principal
        login: resolve(__dirname, 'src/pages/Login.tsx'),  // Componente como entrada
       },
    },
  },
});