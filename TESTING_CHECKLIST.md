# ✅ CHECKLIST DE PRUEBAS - Testing Guide

## 🎯 Objetivo

Verificar que la implementación de datos en tiempo real funciona correctamente.

---

## ⚙️ PRE-REQUISITOS

- [ ] Node.js instalado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Puerto 3000 disponible
- [ ] Puerto 8080 disponible
- [ ] Navegador moderno (Chrome, Edge, Firefox)

---

## 🧪 PRUEBAS PASO A PASO

### 1️⃣ VERIFICAR INSTALACIÓN

```bash
# Verificar que 'ws' está instalado
npm list ws
# Debe mostrar: ws@8.14.0 o similar
```

✅ **Esperado:** Debe mostrar la versión de ws instalada  
❌ **Si falla:** Ejecutar `npm install`

---

### 2️⃣ INICIAR SERVIDOR

**Terminal 1:**

```bash
npm run start-fs
```

✅ **Esperado:**

```
📡 HTTP Server running on port 3000
   ✅ Static data endpoint: http://localhost:3000/api/data
📊 Loaded XXX candles and YY operations
🚀 WebSocket Server running on ws://localhost:8080
   ✅ Streaming data: 1 candle per second
   ✅ Total candles available: XXX
```

❌ **Si falla:**

- Verificar que puerto 3000 y 8080 están libres
- Verificar que `realtest.json` existe
- Revisar logs de error

---

### 3️⃣ INICIAR CLIENTE

**Terminal 2:**

```bash
npm start
```

✅ **Esperado:**

```
VITE v4.4.5  ready in XXX ms

➜  Local:   http://localhost:8080/
➜  Network: use --host to expose
```

❌ **Si falla:**

- Verificar que puerto 8080 está libre
- Verificar que no hay errores de sintaxis
- Ejecutar `npm run lint`

---

### 4️⃣ PROBAR VISTA ESTÁTICA

1. Abrir navegador: `http://localhost:8080/`
2. Abrir DevTools (F12) → Console

**Verificaciones:**

- [ ] Página carga sin errores
- [ ] Gráfico de velas se muestra
- [ ] Datos de operaciones visibles
- [ ] No hay errores en consola
- [ ] Console muestra:
  ```
  📊 Chart Data: XXX points
  💼 Operations: YY operations
  ```

✅ **Esperado:** Gráfico completo con todas las velas  
❌ **Si falla:** Verificar endpoint HTTP en Network tab

---

### 5️⃣ PROBAR VISTA EN TIEMPO REAL

1. Navegar a: `http://localhost:8080/live`
2. Abrir DevTools (F12) → Console

**Verificaciones:**

#### 5.1 - Estado de Conexión

- [ ] Aparece indicador con icono 🟡 "Connecting..."
- [ ] Después de 1-2 seg, cambia a 🟢 "LIVE"
- [ ] Muestra "Last update: Just now"

✅ **Esperado:** Conexión exitosa  
❌ **Si falla:** Verificar que servidor está corriendo

---

#### 5.2 - Mensajes en Consola

Debe mostrar:

```
🔌 Connecting to WebSocket: ws://localhost:8080
✅ WebSocket connected
📊 Realtime - Initial Data Loaded: 50 candles
🕯️ New candle added: 2023-XX-XXTXX:XX:XX.XXXZ
🕯️ New candle added: 2023-XX-XXTXX:XX:XX.XXXZ
...
```

- [ ] Mensaje "Connecting to WebSocket"
- [ ] Mensaje "WebSocket connected"
- [ ] Mensaje "Initial Data Loaded: 50 candles"
- [ ] Mensajes "New candle added" cada segundo

✅ **Esperado:** Stream continuo de candles  
❌ **Si falla:** Verificar logs del servidor

---

#### 5.3 - Actualización del Gráfico

- [ ] Gráfico muestra primeros 50 candles inmediatamente
- [ ] Cada segundo se añade una nueva vela
- [ ] El gráfico se expande horizontalmente
- [ ] Operaciones aparecen como marcadores

✅ **Esperado:** Actualización visual en tiempo real  
❌ **Si falla:** Verificar Redux DevTools

---

### 6️⃣ PROBAR RECONEXIÓN

**Simulación de desconexión:**

1. En la terminal del servidor (Terminal 1), presionar `Ctrl+C`
2. Observar el navegador en `/live`

**Verificaciones:**

- [ ] Indicador cambia a 🔴 "Disconnected"
- [ ] Aparece mensaje "🔄 Reconnecting in XXXXms (attempt 1/5)"
- [ ] Console muestra intentos de reconexión
- [ ] Después de 5 intentos, se detiene

**Reiniciar servidor:**

```bash
npm run start-fs
```

- [ ] Al detectar servidor, reconecta automáticamente
- [ ] Indicador vuelve a 🟢 "LIVE"
- [ ] Stream de datos se reanuda

✅ **Esperado:** Reconexión automática funcional  
❌ **Si falla:** Revisar lógica de reconexión en WebSocketService

---

### 7️⃣ PROBAR NAVEGACIÓN

**Entre vistas:**

1. Navegar de `/` a `/live`

   - [ ] Conexión WebSocket se establece
   - [ ] No hay memory leaks

2. Navegar de `/live` a `/`

   - [ ] Conexión WebSocket se cierra
   - [ ] Console muestra "🧹 Cleaning up HomeLive"
   - [ ] No hay errores

3. Navegar de nuevo a `/live`
   - [ ] Nueva conexión se establece
   - [ ] Datos frescos se cargan

✅ **Esperado:** Limpieza correcta de recursos  
❌ **Si falla:** Verificar cleanup en useEffect

---

### 8️⃣ REDUX DEVTOOLS

**Si tienes Redux DevTools instalado:**

1. Abrir Redux DevTools en el navegador
2. Navegar a `/live`

**Verificaciones:**

- [ ] State `dataChartsRealtime` existe
- [ ] Acciones disparadas:

  - `chartsRealtime/setConnectionStatus` (connecting)
  - `chartsRealtime/setConnectionStatus` (connected)
  - `chartsRealtime/setInitialData`
  - `chartsRealtime/updateLastCandle` (cada segundo)

- [ ] State se actualiza correctamente:
  ```javascript
  dataChartsRealtime: {
    data: [...],           // Array creciente
    operations: [...],
    connectionStatus: "connected",
    lastUpdate: timestamp,
    reconnectAttempts: 0,
    error: null
  }
  ```

✅ **Esperado:** Estado Redux actualizado en tiempo real  
❌ **Si falla:** Verificar dispatches en HomeLive.jsx

---

### 9️⃣ NETWORK TAB

**DevTools → Network:**

**Vista estática (`/`):**

- [ ] Request a `http://localhost:3000/api/data`
- [ ] Status: 200 OK
- [ ] Response: JSON completo

**Vista realtime (`/live`):**

- [ ] WebSocket connection a `ws://localhost:8080`
- [ ] Status: 101 Switching Protocols
- [ ] Messages tab muestra mensajes entrantes
- [ ] Mensaje tipo "batch" al inicio
- [ ] Mensajes tipo "candle" cada segundo

✅ **Esperado:** Tráfico de red correcto  
❌ **Si falla:** Verificar URLs en .env

---

### 🔟 RENDIMIENTO

**Vista `/live` después de 5 minutos:**

- [ ] Sin lag visible
- [ ] Gráfico responsive
- [ ] Sin errores en consola
- [ ] Uso de memoria estable

**Verificar límite de candles:**

- [ ] State tiene máximo 1000 candles (revisar Redux DevTools)
- [ ] Candles antiguos se eliminan automáticamente

✅ **Esperado:** Sin degradación de rendimiento  
❌ **Si falla:** Revisar lógica de límite en chartsRealtimeSlice

---

## 📊 TESTS ESPECÍFICOS DEL SERVIDOR

### Test 1: Endpoint HTTP

**PowerShell:**

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/data" | Select-Object -ExpandProperty Content | ConvertFrom-Json
```

✅ **Esperado:** JSON con `charts` y `traderLogOperations`

---

### Test 2: WebSocket Manualmente

**DevTools Console:**

```javascript
const ws = new WebSocket("ws://localhost:8080");

ws.onopen = () => console.log("✅ Connected");
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  console.log("📨", msg.type, msg.data);
};
ws.onerror = (e) => console.error("❌ Error", e);
ws.onclose = () => console.log("🔌 Closed");
```

✅ **Esperado:**

- Mensaje "Connected"
- Mensaje tipo "batch" con 50 candles
- Mensajes tipo "candle" cada segundo

---

### Test 3: Logs del Servidor

**Terminal del servidor debe mostrar:**

```
📊 Loaded 500 candles and 50 operations
🔌 New WebSocket client connected. Total clients: 1
📤 Sent initial data to client (50 candles)
📊 Sent candle #51/500 (2023-XX-XXTXX:XX:XX.XXXZ)
📊 Sent candle #52/500 (2023-XX-XXTXX:XX:XX.XXXZ)
...
```

✅ **Esperado:** Log por cada candle enviado

---

## 🎯 CRITERIOS DE ACEPTACIÓN

### ✅ FUNCIONALIDAD BÁSICA

- [x] Vista estática carga datos completos
- [x] Vista realtime conecta a WebSocket
- [x] Datos se actualizan en tiempo real
- [x] Indicador de conexión funciona

### ✅ ROBUSTEZ

- [x] Reconexión automática (hasta 5 intentos)
- [x] Limpieza de recursos al desmontar
- [x] Manejo de errores gracioso
- [x] Sin memory leaks

### ✅ UX

- [x] Placeholders informativos
- [x] Animaciones de carga
- [x] Feedback visual claro
- [x] Sin errores en consola

### ✅ ARQUITECTURA

- [x] Servicios desacoplados de Redux
- [x] Adaptador de datos funcional
- [x] Fácil migración a TCP
- [x] Código documentado

---

## 🐛 TROUBLESHOOTING COMÚN

### Problema: "WebSocket connection failed"

**Solución:**

1. Verificar servidor corriendo: `npm run start-fs`
2. Verificar URL en `.env`: `VITE_WEBSOCKET_URL=ws://localhost:8080`
3. Verificar puerto libre: `netstat -ano | findstr :8080`

---

### Problema: "Gráfico no se actualiza"

**Solución:**

1. Verificar Redux DevTools → State `dataChartsRealtime.data` crece
2. Verificar Console → Mensajes "New candle added"
3. Verificar prop `isRealtime={true}` en `CandleCharts`

---

### Problema: "Cannot read property 'data' of undefined"

**Solución:**

1. Verificar `store.js` tiene `dataChartsRealtime: chartsRealtimeSlice`
2. Reiniciar cliente: `Ctrl+C` → `npm start`

---

### Problema: "Reconexión infinita"

**Solución:**

1. Verificar servidor está corriendo
2. Verificar URL correcta en `.env`
3. Después de 5 intentos, debe detenerse automáticamente

---

## 📝 REPORTE DE RESULTADOS

### ✅ Test Exitoso

```
[✓] Vista estática funcional
[✓] Vista realtime funcional
[✓] Conexión WebSocket estable
[✓] Reconexión automática OK
[✓] Sin errores en consola
[✓] Rendimiento aceptable

🎉 ¡Implementación 100% funcional!
```

### ❌ Test Fallido

```
[✗] Problema detectado: [descripción]
[i] Pasos reproducción: [...]
[i] Logs relevantes: [...]
[i] Solución intentada: [...]
```

---

## 🎓 SIGUIENTE PASO

Si todos los tests pasan:

1. ✅ Marcar ticket como completo
2. ✅ Documentar cualquier issue conocido
3. ✅ Preparar demo para stakeholders
4. ✅ Planificar optimizaciones futuras

Si algún test falla:

1. ❌ Revisar logs de error
2. ❌ Verificar configuración
3. ❌ Consultar TROUBLESHOOTING
4. ❌ Reportar issue si persiste

---

**Happy Testing! 🧪✨**
