import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .jsx, or .js files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  build: {
    rollupOptions: {
      output: {
        // Splits the big, rarely-changing libraries into their own vendor
        // chunks so an app-code deploy doesn't force users to re-download
        // React/recharts/etc, and so the main bundle drops under Vite's
        // 500KB warning threshold. Order matters — the first matching
        // branch wins, and react-router-dom's id also contains "react" so
        // it's checked as part of the same react bucket, not left to fall
        // through to the generic vendor chunk.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          // scheduler is react-dom's own internal dependency — bucketing it
          // separately (it doesn't match /react/) created a real cycle
          // (vendor-react -> vendor via scheduler, vendor -> vendor-react via
          // any other package's `import 'react'`), which Rollup warned about.
          if (
            id.includes('react-dom') ||
            id.includes('react-router') ||
            id.includes('/scheduler/') ||
            id.includes('\\scheduler\\') ||
            /[\\/]react[\\/]/.test(id)
          ) {
            return 'vendor-react'
          }
          if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts'
          if (id.includes('motion')) return 'vendor-motion'
          if (id.includes('lucide-react')) return 'vendor-icons'
          // posthog-js is loaded via a dynamic import() in analytics.js, not
          // a static one, so it's already excluded from the eager graph —
          // this just gives its own lazy chunk a readable name.
          if (id.includes('posthog-js')) return 'vendor-analytics'
          if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) return 'vendor-forms'
          if (id.includes('socket.io-client') || id.includes('engine.io-client')) return 'vendor-socket'
          return 'vendor'
        },
      },
    },
  },
})
