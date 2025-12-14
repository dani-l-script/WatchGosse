# 🚀 Implementación de Datos en Tiempo Real - Guía de Uso

## ✅ Cambios Implementados

### 📁 Estructura de Archivos Creados/Modificados

```
src/
  app/
    features/
      slices/
        ✅ chartsRealtimeSlice.js (NUEVO - Redux slice para tiempo real)
    services/
      ✅ IDataService.js (NUEVO - Interfaz abstracta)
      ✅ WebSocketService.js (NUEVO - Implementación WebSocket)
      ✅ dataAdapter.js (NUEVO - Adaptador de datos)
    components/
      ✅ ConnectionStatus.jsx (NUEVO - Indicador de conexión)
      ✅ connectionStatus.sass (NUEVO - Estilos)
      ✨ CandleCharts.jsx (MODIFICADO - Soporte para ambos modos)
    Layouts/
      HomeLive/
        ✅ HomeLive.jsx (NUEVO - Vista en tiempo real)
        ✅ homeLive.sass (NUEVO - Estilos)
    ✨ store.js (MODIFICADO - Registrado chartsRealtimeSlice)
  ✨ App.jsx (MODIFICADO - Añadida ruta /live)

mockedServer/
  ✨ server.cjs (MODIFICADO - Soporte WebSocket)

✨ package.json (MODIFICADO - Dependencia ws)
✨ .env (MODIFICADO - Variables WebSocket)
✅ .env.example (NUEVO)
```

---

## 🎯 Arquitectura Implementada

### **Dos Vistas Independientes**

1. **Vista Estática** (`/`) - `Home.jsx`

   - Datos cargados desde HTTP/JSON
   - Redux slice: `chartsSlice`
   - Carga completa al inicio

2. **Vista en Tiempo Real** (`/live`) - `HomeLive.jsx`
   - Datos por WebSocket
   - Redux slice: `chartsRealtimeSlice`
   - Stream continuo de datos

### **Capa de Servicios Desacoplada**

```
┌─────────────────────────────────────────┐
│  IDataService (Interfaz abstracta)      │
└─────────────────┬───────────────────────┘
                  │
      ┌───────────┴────────────┐
      │                        │
WebSocketService         (Futuro: TCPService)
      │
      └──> dataAdapter.js ──> Redux Actions
```

- **Fácil cambio de protocolo**: Solo implementar `IDataService`
- **Independiente de Redux**: Los servicios no conocen Redux
- **Adaptador unificado**: `dataAdapter.js` normaliza datos

---

## 📦 Instalación

### 1. Instalar dependencias

```bash
npm install
```

Esto instalará la nueva dependencia `ws` (WebSocket para el servidor).

### 2. Verificar archivo `.env`

El archivo `.env` debe contener:

```env
VITE_CANDLE_CHARTS=http://localhost:3000/api/data
VITE_WEBSOCKET_URL=ws://localhost:8080
PORT=3000
WS_PORT=8080
```

---

## 🚀 Cómo Ejecutar

### **Opción 1: Dos Terminales (Recomendado)**

**Terminal 1 - Servidor (HTTP + WebSocket):**

```bash
npm run start-fs
```

Verás:

```
📡 HTTP Server running on port 3000
   ✅ Static data endpoint: http://localhost:3000/api/data
🚀 WebSocket Server running on ws://localhost:8080
   ✅ Streaming data: 1 candle per second
   ✅ Total candles available: XXX
```

**Terminal 2 - Cliente (React + Vite):**

```bash
npm start
```

### **Opción 2: Un Solo Comando (Futuro)**

Puedes añadir a `package.json`:

```json
"scripts": {
  "dev:all": "concurrently \"npm run start-fs\" \"npm start\""
}
```

Requiere: `npm install -D concurrently`

---

## 🌐 Navegación

### Vista Estática (Datos desde JSON)

```
http://localhost:8080/
```

- Carga completa al inicio
- Datos históricos
- No requiere WebSocket

### Vista en Tiempo Real (Datos por WebSocket)

```
http://localhost:8080/live
```

- **Indicador de conexión**: 🟢 LIVE / 🟡 Connecting / 🔴 Disconnected
- Datos llegan uno por segundo
- Actualización automática del gráfico
- Operaciones en tiempo real

---

## 🔧 Funcionamiento del Servidor WebSocket

### **Flujo de Datos**

1. **Cliente conecta**: Recibe primeros 50 candles (batch inicial)
2. **Stream continuo**: 1 candle por segundo desde el índice 51
3. **Operaciones**: Enviadas cuando coinciden con el timestamp del candle
4. **Loop infinito**: Al terminar el JSON, reinicia desde el principio

### **Mensajes Enviados por el Servidor**

#### Batch Inicial (al conectar)

```json
{
  "type": "batch",
  "data": {
    "charts": [...], // Primeros 50 candles
    "traderLogOperations": [...]
  }
}
```

#### Candle Individual (cada 1 segundo)

```json
{
  "type": "candle",
  "data": {
    "open": 50000,
    "high": 51000,
    "low": 49500,
    "close": 50500,
    "time": 1634567890000
  }
}
```

#### Operación

```json
{
  "type": "operation",
  "data": {
    "id": "op_123",
    "operation": "entry",
    "profit": 1250,
    "time": 1634567890000,
    ...
  }
}
```

---

## 🎨 Componente `ConnectionStatus`

Muestra el estado de la conexión WebSocket:

| Estado         | Icono | Color    | Descripción                  |
| -------------- | ----- | -------- | ---------------------------- |
| `connected`    | 🟢    | Verde    | Conectado y recibiendo datos |
| `connecting`   | 🟡    | Amarillo | Estableciendo conexión       |
| `disconnected` | 🔴    | Rojo     | Sin conexión                 |
| `error`        | ⚠️    | Rojo     | Error de conexión            |
| `reconnecting` | 🔄    | Amarillo | Reintentando conexión (X/5)  |

**Características:**

- Muestra último update: "Last update: 2s ago"
- Intentos de reconexión con contador
- Mensajes de error detallados

---

## 🔄 Reconexión Automática

El `WebSocketService` implementa:

- **Máximo 5 intentos**
- **Backoff exponencial**: 2s, 3s, 4.5s, 6.75s, 10.125s
- **Auto-stop**: No reintenta en desconexión manual
- **Limpieza**: Libera recursos al desmontar componente

---

## 🧪 Testing sin Servidor

Si el servidor WebSocket no está corriendo:

1. Navega a `/live`
2. Verás el placeholder:

   ```
   🔌 Not Connected
   Unable to connect to the live data server.
   Make sure the WebSocket server is running on ws://localhost:8080
   ```

3. El servicio intentará reconectar automáticamente 5 veces

---

## 🛠️ Cómo Adaptar a TCP

Gracias a la arquitectura desacoplada:

### 1. Crear `TCPService.js`

```javascript
import { IDataService } from "./IDataService";

export class TCPService extends IDataService {
  constructor() {
    super();
    this.socket = null;
  }

  async connect(host, port, options = {}) {
    // Implementar conexión TCP
    // Puede usar Node.js 'net' module o similar
  }

  // ... implementar métodos de IDataService
}
```

### 2. Modificar `HomeLive.jsx`

```javascript
// Cambiar de:
import { getWebSocketService } from "../../services/WebSocketService";
const wsService = getWebSocketService();

// A:
import { getTCPService } from "../../services/TCPService";
const tcpService = getTCPService();
```

### 3. Sin cambios en:

- Redux slices
- `dataAdapter.js`
- `ConnectionStatus.jsx`
- `CandleCharts.jsx`

---

## 📊 Gestión de Estado Redux

### **chartsRealtimeSlice**

**Estado:**

```javascript
{
  data: [],                    // Velas (max 1000)
  operations: [],              // Operaciones
  connectionStatus: 'disconnected',
  lastUpdate: null,
  reconnectAttempts: 0,
  error: null
}
```

**Acciones:**

- `setConnectionStatus` - Actualiza estado de conexión
- `setInitialData` - Carga batch inicial
- `updateLastCandle` - Actualiza última vela (mismo timestamp)
- `addNewCandle` - Añade nueva vela (nuevo timestamp)
- `addOperation` - Añade operación
- `resetRealtimeData` - Limpia datos al desconectar

---

## 🎯 Próximos Pasos Sugeridos

1. **Optimizaciones de Rendimiento**

   - [ ] Throttling de actualizaciones (máx. cada 500ms)
   - [ ] Memoización con `useMemo` y `useCallback`
   - [ ] Virtualización de listas largas

2. **Funcionalidades Adicionales**

   - [ ] Botón "Pause/Resume" en `/live`
   - [ ] Selector de velocidad (1x, 2x, 5x)
   - [ ] Exportar datos en vivo a CSV
   - [ ] Notificaciones de operaciones importantes

3. **UX Mejorada**

   - [ ] Navbar para cambiar entre vistas
   - [ ] Indicador de "buffering" durante lag
   - [ ] Sound/visual alert en operaciones
   - [ ] Dark/Light theme toggle

4. **Testing**
   - [ ] Unit tests para servicios
   - [ ] Integration tests para flujo completo
   - [ ] E2E tests con Cypress/Playwright

---

## 🐛 Troubleshooting

### Problema: "WebSocket connection failed"

- **Solución**: Verificar que `npm run start-fs` está ejecutándose
- Revisar puerto en `.env` (`WS_PORT=8080`)
- Verificar firewall no bloquea puerto 8080

### Problema: "Gráfico no se actualiza"

- Abrir DevTools → Console → Buscar mensajes `📊 Sent candle`
- Verificar que Redux DevTools muestra acciones `updateLastCandle`
- Revisar que `isRealtime={true}` está en `<CandleCharts />`

### Problema: "Datos no coinciden"

- Revisar `dataAdapter.js` → función `parseSocketMessage`
- Verificar formato JSON en `realtest.json`
- Comprobar logs del servidor

---

## 📚 Recursos

- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [ws Library (Node.js)](https://github.com/websockets/ws)
- [ApexCharts Docs](https://apexcharts.com/docs/)

---

**¡Implementación completa! 🎉**

Ahora puedes:

- Ver datos estáticos en `/`
- Ver datos en tiempo real en `/live`
- Cambiar fácilmente a TCP en el futuro
- Mantener ambas vistas funcionando independientemente
