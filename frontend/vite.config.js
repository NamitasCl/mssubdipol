import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        {
            name: 'redirect-missing-slash',
            configureServer(server) {
                server.middlewares.use((req, res, next) => {
                    if (req.url === '/turnos') {
                        res.writeHead(301, { Location: '/turnos/' });
                        res.end();
                    } else {
                        next();
                    }
                });
            }
        }
    ],
    base: '/turnos/',
    server: {
        proxy: {
            '/api/nodos': {
                target: 'http://nodos:8013',
                changeOrigin: true,
            },
            '/api': {
                target: 'http://sge-backend:8080', // sge-backend docker service
                changeOrigin: true,
            }
        }
    },
    resolve: {
        alias: {
            'react-bootstrap': path.resolve(__dirname, 'src/BootstrapShim.jsx'),
            'bootstrap/dist/css/bootstrap.min.css': path.resolve(__dirname, 'src/empty.css'),
            'bootstrap/js/src/toast.js': path.resolve(__dirname, 'src/empty-bootstrap.js'),
        }
    }
})
