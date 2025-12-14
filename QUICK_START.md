# 🚀 Scripts de Ayuda Rápida

## Iniciar Todo el Sistema

### Opción 1: Manualmente (2 terminales)

**Terminal 1 - Servidor:**
```bash
npm run start-fs
```

**Terminal 2 - Cliente:**
```bash
npm start
```

---

### Opción 2: Automático (1 terminal)

Primero instala `concurrently`:
```bash
npm install -D concurrently
```

Añade a `package.json` en `scripts`:
```json
"dev:all": "concurrently \"npm run start-fs\" \"npm start\" --names \"SERVER,CLIENT\" --prefix-colors \"blue,green\""
```

Luego ejecuta:
```bash
npm run dev:all
```

---

## Comandos Útiles

### Instalar dependencias
```bash
npm install
```

### Limpiar node_modules y reinstalar
```bash
# PowerShell
Remove-Item -Recurse -Force node_modules
npm install
```

### Ver logs del servidor
```bash
npm run start-fs
# Verás:
# 📡 HTTP Server running on port 3000
# 🚀 WebSocket Server running on ws://localhost:8080
```

### Build para producción
```bash
npm run build
```

### Preview del build
```bash
npm run preview
```

### Lint
```bash
npm run lint
```

---

## Testing Manual

### 1. Verificar servidor HTTP
```bash
# PowerShell
curl http://localhost:3000/api/data
# Debería devolver JSON con charts y traderLogOperations
```

### 2. Verificar WebSocket
Abrir DevTools en el navegador → Console:
```javascript
const ws = new WebSocket('ws://localhost:8080');
ws.onmessage = (e) => console.log(JSON.parse(e.data));
ws.onopen = () => console.log('Connected!');
```

### 3. Verificar vistas
- Estática: `http://localhost:8080/`
- Realtime: `http://localhost:8080/live`

---

## Variables de Entorno

### Cambiar puerto del WebSocket

Editar `.env`:
```env
VITE_WEBSOCKET_URL=ws://localhost:9999
WS_PORT=9999
```

Reiniciar servidor y cliente.

### Cambiar puerto HTTP

Editar `.env`:
```env
VITE_CANDLE_CHARTS=http://localhost:4000/api/data
PORT=4000
```

---

## Troubleshooting

### "Cannot find module 'ws'"
```bash
npm install
```

### "Port already in use"
```bash
# PowerShell - Encontrar proceso en puerto 8080
netstat -ano | findstr :8080

# Matar proceso (reemplazar PID)
taskkill /PID <PID> /F
```

### "WebSocket connection failed"
1. Verificar que `npm run start-fs` está corriendo
2. Verificar puerto en `.env`
3. Verificar firewall

### "Redux state is undefined"
Verificar que `store.js` tenga registrado `chartsRealtimeSlice`:
```javascript
reducer: {
  dataCharts: chartsSlice,
  dataChartsRealtime: chartsRealtimeSlice, // ← Debe estar
}
```

---

## Atajos de Desarrollo

### Reiniciar servidor rápido
```bash
# Ctrl+C en terminal del servidor
npm run start-fs
```

### Ver Redux DevTools
1. Instalar extensión Redux DevTools en Chrome/Edge
2. Abrir aplicación
3. Ver tab Redux en DevTools
4. Monitorear acciones en tiempo real

### Hot Module Replacement
- Vite HMR está activo por defecto
- Cambios en archivos `.jsx`, `.sass` se aplican sin reload
- Cambios en `server.cjs` requieren reiniciar servidor

---

## Git

### Commit de cambios
```bash
git add .
git commit -m "feat: implementación de datos en tiempo real con WebSocket"
git push origin feat/socket-info-feeding
```

### Ver cambios
```bash
git status
git diff
```

---

## Producción

### Build optimizado
```bash
npm run build
# Genera carpeta dist/
```

### Servir build
```bash
npm run preview
# O usar servidor estático:
npx serve dist
```

### Configurar servidor producción
Asegúrate de que el servidor tenga:
- Node.js instalado
- Variables de entorno configuradas
- Puertos 3000 y 8080 abiertos

---

## Próximos Pasos

1. ✅ Probar la implementación
2. ⏳ Añadir tests unitarios
3. ⏳ Implementar TCPService
4. ⏳ Añadir funcionalidades extra (pause, speed control)
5. ⏳ Optimización de rendimiento
6. ⏳ Deploy a producción

---

**¡Todo listo para empezar! 🚀**
