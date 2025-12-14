const express = require("express");
const { WebSocketServer } = require("ws");
const http = require("http");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const WS_PORT = process.env.WS_PORT || 8080;

// ============================================
// HTTP SERVER (Datos estáticos - JSON)
// ============================================
app.get("/api/data", (req, res) => {
  const filePath = path.join(__dirname, "realtest.json");
  const readStream = fs.createReadStream(filePath);

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, application/json");
  readStream.pipe(res);
});

app.listen(PORT, () => {
  console.log(`📡 HTTP Server running on port ${PORT}`);
  console.log(`   ✅ Static data endpoint: http://localhost:${PORT}/api/data`);
});

// ============================================
// WEBSOCKET SERVER (Datos en tiempo real)
// ============================================
const server = http.createServer();
const wss = new WebSocketServer({ server });

// Cargar datos del JSON
let jsonData = null;
try {
  const filePath = path.join(__dirname, "realtest.json");
  const rawData = fs.readFileSync(filePath, "utf8");
  jsonData = JSON.parse(rawData);
  console.log(
    `📊 Loaded ${jsonData.charts?.length || 0} candles and ${
      jsonData.traderLogOperations?.length || 0
    } operations`
  );
} catch (error) {
  console.error("❌ Error loading JSON data:", error);
  process.exit(1);
}

// Estado de clientes conectados
const clients = new Set();

wss.on("connection", (ws) => {
  console.log(
    "🔌 New WebSocket client connected. Total clients:",
    clients.size + 1
  );
  clients.add(ws);

  // Enviar datos iniciales (primeros 50 candles)
  const initialData = {
    type: "batch",
    data: {
      charts: jsonData.charts.slice(0, 50),
      traderLogOperations: jsonData.traderLogOperations.filter((op) => {
        const opTime = op.time;
        const lastCandleTime = jsonData.charts[49]?.time;
        return opTime <= lastCandleTime;
      }),
    },
  };

  ws.send(JSON.stringify(initialData));
  console.log("📤 Sent initial data to client (50 candles)");

  // Iniciar stream de datos en tiempo real (1 candle por segundo)
  let currentIndex = 50; // Empezar después de los datos iniciales
  const interval = setInterval(() => {
    if (currentIndex >= jsonData.charts.length) {
      console.log("✅ All candles sent, restarting from beginning...");
      currentIndex = 0; // Reiniciar al principio
    }

    if (ws.readyState === ws.OPEN) {
      const candle = jsonData.charts[currentIndex];

      // Enviar candle
      const candleMessage = {
        type: "candle",
        data: candle,
      };
      ws.send(JSON.stringify(candleMessage));

      // Verificar si hay operaciones en este timestamp
      const operations = jsonData.traderLogOperations.filter(
        (op) => op.time === candle.time
      );
      operations.forEach((op) => {
        const operationMessage = {
          type: "operation",
          data: op,
        };
        ws.send(JSON.stringify(operationMessage));
      });

      console.log(
        `📊 Sent candle #${currentIndex + 1}/${
          jsonData.charts.length
        } (${new Date(candle.time).toISOString()})`
      );
      currentIndex++;
    }
  }, 1000); // 1 segundo entre candles

  // Manejar mensajes del cliente
  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      console.log("📥 Received from client:", data);

      // Aquí puedes manejar comandos del cliente si es necesario
      // Por ejemplo: pause, resume, request_data, etc.
    } catch (error) {
      console.error("❌ Error parsing client message:", error);
    }
  });

  // Manejar desconexión
  ws.on("close", () => {
    console.log("🔌 Client disconnected. Total clients:", clients.size - 1);
    clients.delete(ws);
    clearInterval(interval);
  });

  // Manejar errores
  ws.on("error", (error) => {
    console.error("❌ WebSocket error:", error);
    clients.delete(ws);
    clearInterval(interval);
  });
});

server.listen(WS_PORT, () => {
  console.log(`🚀 WebSocket Server running on ws://localhost:${WS_PORT}`);
  console.log(`   ✅ Streaming data: 1 candle per second`);
  console.log(`   ✅ Total candles available: ${jsonData.charts?.length || 0}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down servers...");
  wss.close(() => {
    console.log("✅ WebSocket server closed");
    process.exit(0);
  });
});
