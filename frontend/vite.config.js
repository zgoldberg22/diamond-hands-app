import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react',
          'react-dom',
          'react-router-dom',
          'bootstrap',
          'react-bootstrap',
          'react-plotly.js',
          'ag-grid-react',
          '@ag-grid-community/client-side-row-model',
          '@ag-grid-enterprise/column-tool-panel',
          '@ag-grid-enterprise/menu',
          '@ag-grid-enterprise/set-filter']
        },
      },
    },
  },
})
