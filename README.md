# 🦆 WatchGoose - Real-time Trading Data Viewer

Aplicación React para visualización de datos de trading con soporte para datos estáticos y en tiempo real.

## ✨ Características

- 📊 **Vista Estática**: Carga completa de datos desde JSON/HTTP
- 📡 **Vista en Tiempo Real**: Stream de datos por WebSocket (1 candle/segundo)
- 🔄 **Reconexión Automática**: Hasta 5 intentos con backoff exponencial
- 🎨 **UI Moderna**: Gráficos interactivos con ApexCharts
- 🟢 **Indicador de Conexión**: Estado visual en tiempo real
- 🏗️ **Arquitectura Desacoplada**: Fácil migración a TCP u otros protocolos

---

## 🚀 Quick Start

### 1. Instalación

```bash
npm install
```

### 2. Iniciar Servidor (Terminal 1)

```bash
npm run start-fs
```

Esto inicia:
- **HTTP Server** en puerto 3000 (datos estáticos)
- **WebSocket Server** en puerto 8080 (datos en tiempo real)

### 3. Iniciar Cliente (Terminal 2)

```bash
npm start
```

### 4. Navegar

- **Vista Estática**: http://localhost:8080/
- **Vista en Tiempo Real**: http://localhost:8080/live

---

## 📚 Documentación

- [**QUICK_START.md**](./QUICK_START.md) - Scripts y comandos útiles
- [**IMPLEMENTATION_GUIDE.md**](./IMPLEMENTATION_GUIDE.md) - Guía completa de implementación
- [**IMPLEMENTATION_SUMMARY.md**](./IMPLEMENTATION_SUMMARY.md) - Resumen ejecutivo
- [**STRUCTURE.md**](./STRUCTURE.md) - Estructura del proyecto
- [**TESTING_CHECKLIST.md**](./TESTING_CHECKLIST.md) - Guía de testing

---

## 🏗️ Arquitectura

```
Frontend (React + Redux)
    ↓
┌─────────────────────┐     ┌──────────────────────┐
│   Home (/)          │     │   HomeLive (/live)   │
│   Datos Estáticos   │     │   Datos Realtime     │
└──────────┬──────────┘     └──────────┬───────────┘
           │                           │
           │                           │
      chartsSlice            chartsRealtimeSlice
           │                           │
      HTTP/Axios                WebSocketService
           │                           │
           └──────────┬────────────────┘
                      ↓
              Backend (Node.js)
         HTTP (3000) + WebSocket (8080)
```

---

## 🛠️ Tecnologías

- **Frontend**: React 18, Redux Toolkit, React Router, ApexCharts
- **Backend**: Node.js, Express, WebSocket (ws)
- **Build**: Vite
- **Styling**: Sass

---

## 📦 Scripts

```bash
npm start        # Iniciar cliente (Vite dev server)
npm run start-fs # Iniciar servidor (HTTP + WebSocket)
npm run build    # Build para producción
npm run preview  # Preview del build
npm run lint     # Linter
```

---

## ⚙️ Configuración

Variables de entorno en `.env`:

```env
# HTTP API
VITE_CANDLE_CHARTS=http://localhost:3000/api/data
PORT=3000

# WebSocket
VITE_WEBSOCKET_URL=ws://localhost:8080
WS_PORT=8080
```

---

## 🎯 Características de la Implementación

### Dos Vistas Independientes
- **`/`**: Vista estática con carga completa al inicio
- **`/live`**: Vista en tiempo real con WebSocket streaming

### Capa de Servicios Desacoplada
- **IDataService**: Interfaz abstracta
- **WebSocketService**: Implementación actual
- **TCPService**: Futuro (fácil de añadir)

### Redux Slices Separados
- **chartsSlice**: Datos estáticos (HTTP)
- **chartsRealtimeSlice**: Datos tiempo real (WebSocket)

### Servidor Dual
- **HTTP Server (3000)**: Endpoint `/api/data` con JSON completo
- **WebSocket Server (8080)**: Stream de datos 1 candle/segundo

---

## 🧪 Testing

Sigue la guía completa en [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)

**Tests básicos:**
1. Verificar vista estática en `/`
2. Verificar vista realtime en `/live`
3. Probar reconexión (detener servidor y reiniciar)
4. Verificar Redux DevTools
5. Verificar Network tab (WebSocket messages)

---

## 🔄 Migración a TCP

Gracias a la arquitectura desacoplada:

1. Crear `src/app/services/TCPService.js` implementando `IDataService`
2. Cambiar import en `HomeLive.jsx`
3. ¡Listo! Sin tocar Redux ni componentes

---

## 📊 Estado Redux

### chartsRealtimeSlice
```javascript
{
  data: [],                    // Velas (max 1000)
  operations: [],              // Operaciones
  connectionStatus: 'connected', // Estado conexión
  lastUpdate: timestamp,       // Último update
  reconnectAttempts: 0,        // Intentos reconexión
  error: null                  // Error actual
}
```

---

## 🐛 Troubleshooting

### "WebSocket connection failed"
- Verificar que `npm run start-fs` está corriendo
- Revisar puerto en `.env`: `WS_PORT=8080`

### "Gráfico no se actualiza"
- Abrir Redux DevTools y verificar acciones
- Verificar Console para logs de candles
- Asegurar que `isRealtime={true}` está en `<CandleCharts />`

### "Port already in use"
```bash
# PowerShell
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

Más detalles en [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)

---

## 🎓 Próximos Pasos

- [ ] Implementar TCPService
- [ ] Añadir botón Pause/Resume
- [ ] Selector de velocidad (1x, 2x, 5x)
- [ ] Throttling de actualizaciones
- [ ] Tests unitarios y E2E
- [ ] Notificaciones de operaciones importantes

---

## 📄 Licencia

MIT

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**Desarrollado con ❤️ usando React, Redux y WebSockets**


Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Your Name - [@yourhandle](https://twitter.com/yourhandle) - email@example.com

Project Link: [https://github.com/yourusername/watchgoose](https://github.com/yourusername/watchgoose)
