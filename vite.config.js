import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Custom Vite plugin to run Vercel Serverless Functions locally during 'npm run dev'
const localApiPlugin = () => ({
  name: 'local-api-middleware',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.url.startsWith('/api/')) {
        // Find the API file name
        const apiName = req.url.split('?')[0].replace('/api/', '')
        // We support both /api/fmcg-news and /api/interview/chat
        let filePath = path.join(__dirname, 'api', `${apiName}.js`)
        
        // Check if file exists, if not try subdirectories
        if (!fs.existsSync(filePath)) {
          filePath = path.join(__dirname, 'api', `${apiName}/index.js`)
        }
        
        if (fs.existsSync(filePath)) {
          try {
            // Read and parse POST request body if present
            let body = ''
            if (req.method === 'POST') {
              await new Promise((resolve) => {
                req.on('data', chunk => { body += chunk })
                req.on('end', resolve)
              })
              try {
                req.body = body ? JSON.parse(body) : {}
              } catch (e) {
                req.body = {}
              }
            } else {
              req.body = {}
            }

            // Mock Vercel response helper methods
            res.status = (code) => {
              res.statusCode = code
              return res
            }
            res.json = (data) => {
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(data))
            }

            // Clear cache for hot-reloading during development
            const moduleUrl = `${filePath}?update=${Date.now()}`
            const apiHandlerModule = await import(moduleUrl)
            const handler = apiHandlerModule.default || apiHandlerModule
            
            await handler(req, res)
          } catch (err) {
            console.error(`Error in local API handler for ${req.url}:`, err)
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }))
          }
          return
        }
      }
      next()
    })
  }
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localApiPlugin()],
  server: {
    port: 3000
  }
})
