import { createSlice } from "@reduxjs/toolkit";
import parseCandleStickData from "../../utils/dataParserToCandleStick";

const MAX_CANDLES = 1000; // Límite de velas en memoria

const chartsRealtimeSlice = createSlice({
  name: "chartsRealtime",
  initialState: {
    data: [],
    operations: [],
    connectionStatus: "disconnected", // 'disconnected' | 'connecting' | 'connected' | 'error' | 'reconnecting'
    lastUpdate: null,
    reconnectAttempts: 0,
    error: null,
  },
  reducers: {
    // Gestión de conexión
    setConnectionStatus: (state, action) => {
      state.connectionStatus = action.payload.status;
      if (action.payload.error) {
        state.error = action.payload.error;
      }
      if (action.payload.status === "connected") {
        state.error = null;
        state.reconnectAttempts = 0;
      }
    },

    incrementReconnectAttempts: (state) => {
      state.reconnectAttempts += 1;
    },

    resetReconnectAttempts: (state) => {
      state.reconnectAttempts = 0;
    },

    // Carga inicial de datos históricos
    setInitialData: (state, action) => {
      const { charts, operations } = action.payload;
      state.data = parseCandleStickData(charts);
      state.operations = operations || [];
      state.lastUpdate = Date.now();
      console.log("📊 Realtime - Initial Data Loaded:", state.data.length, "candles");
    },

    // Actualizar última vela (mismo timestamp)
    updateLastCandle: (state, action) => {
      const newCandle = action.payload;
      
      if (state.data.length === 0) {
        // Si no hay datos, añadir como primera vela
        state.data.push(newCandle);
      } else {
        const lastCandle = state.data[state.data.length - 1];
        
        // Si es el mismo timestamp, actualizar
        if (lastCandle.x === newCandle.x) {
          state.data[state.data.length - 1] = newCandle;
        } else {
          // Nuevo timestamp, añadir nueva vela
          state.data.push(newCandle);
          
          // Limitar tamaño del array
          if (state.data.length > MAX_CANDLES) {
            state.data = state.data.slice(-MAX_CANDLES);
          }
        }
      }
      
      state.lastUpdate = Date.now();
    },

    // Añadir nueva vela (nuevo timestamp)
    addNewCandle: (state, action) => {
      const newCandle = action.payload;
      state.data.push(newCandle);
      
      // Limitar tamaño del array
      if (state.data.length > MAX_CANDLES) {
        state.data = state.data.slice(-MAX_CANDLES);
      }
      
      state.lastUpdate = Date.now();
      console.log("🕯️ New candle added:", new Date(newCandle.x).toISOString());
    },

    // Actualizar batch de velas (para carga inicial o resync)
    updateBatchCandles: (state, action) => {
      const candles = action.payload;
      state.data = parseCandleStickData(candles);
      
      // Limitar tamaño
      if (state.data.length > MAX_CANDLES) {
        state.data = state.data.slice(-MAX_CANDLES);
      }
      
      state.lastUpdate = Date.now();
      console.log("📊 Batch update:", state.data.length, "candles");
    },

    // Añadir/actualizar operación
    addOperation: (state, action) => {
      const operation = action.payload;
      state.operations.push(operation);
      state.lastUpdate = Date.now();
      console.log("💼 Operation added:", operation.operation, operation.profit || 0);
    },

    updateOperation: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.operations.findIndex(op => op.id === id);
      if (index !== -1) {
        state.operations[index] = { ...state.operations[index], ...updates };
        state.lastUpdate = Date.now();
      }
    },

    // Limpiar datos al desconectar
    resetRealtimeData: (state) => {
      state.data = [];
      state.operations = [];
      state.lastUpdate = null;
      state.error = null;
      console.log("🧹 Realtime data cleared");
    },

    // Establecer error
    setError: (state, action) => {
      state.error = action.payload;
      state.connectionStatus = "error";
    },
  },
});

export const {
  setConnectionStatus,
  incrementReconnectAttempts,
  resetReconnectAttempts,
  setInitialData,
  updateLastCandle,
  addNewCandle,
  updateBatchCandles,
  addOperation,
  updateOperation,
  resetRealtimeData,
  setError,
} = chartsRealtimeSlice.actions;

export default chartsRealtimeSlice.reducer;
