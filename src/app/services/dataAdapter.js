/**
 * Data Adapter - Transforma datos del socket/TCP al formato esperado por Redux
 *
 * Esta capa permite cambiar el protocolo de transporte (WebSocket, TCP, etc.)
 * sin afectar la lógica de negocio en Redux.
 */

/**
 * Adapta un mensaje de vela (candle) del socket al formato de Redux
 * @param {Object} socketData - Datos crudos del socket
 * @returns {Object} Datos en formato {x: timestamp, y: [open, high, low, close]}
 */
export const adaptSocketCandle = (socketData) => {
  try {
    // El formato del socket debe ser igual al JSON actual:
    // { open, high, low, close, time }
    const { open, high, low, close, time } = socketData;

    if (
      !time ||
      open === undefined ||
      high === undefined ||
      low === undefined ||
      close === undefined
    ) {
      console.warn("⚠️ Invalid candle data received:", socketData);
      return null;
    }

    return {
      x: time,
      y: [open, high, low, close],
    };
  } catch (error) {
    console.error("❌ Error adapting candle data:", error, socketData);
    return null;
  }
};

/**
 * Adapta un mensaje de operación del socket al formato de Redux
 * @param {Object} socketData - Datos crudos del socket
 * @returns {Object} Datos de operación formateados
 */
export const adaptSocketOperation = (socketData) => {
  try {
    // Asumiendo que el formato es el mismo que en traderLogOperations
    return {
      id: socketData.id || `op_${Date.now()}`,
      operation: socketData.operation, // 'entry' o 'exit'
      profit: socketData.profit || 0,
      time: socketData.time,
      price: socketData.price,
      holdingPeriod: socketData.holdingPeriod,
      ...socketData, // Spread del resto de propiedades
    };
  } catch (error) {
    console.error("❌ Error adapting operation data:", error, socketData);
    return null;
  }
};

/**
 * Adapta un batch completo de datos (carga inicial)
 * @param {Object} socketData - Objeto con {charts, traderLogOperations}
 * @returns {Object} {charts: [], operations: []}
 */
export const adaptSocketBatch = (socketData) => {
  try {
    return {
      charts: socketData.charts || [],
      operations: socketData.traderLogOperations || [],
    };
  } catch (error) {
    console.error("❌ Error adapting batch data:", error);
    return { charts: [], operations: [] };
  }
};

/**
 * Valida que un mensaje del socket tenga la estructura esperada
 * @param {Object} message - Mensaje del socket
 * @returns {boolean}
 */
export const validateSocketMessage = (message) => {
  if (!message || typeof message !== "object") {
    return false;
  }

  // Debe tener un tipo de mensaje
  if (!message.type) {
    console.warn("⚠️ Message without type:", message);
    return false;
  }

  return true;
};

/**
 * Determina el tipo de mensaje y lo procesa
 * @param {Object} message - Mensaje del socket
 * @returns {Object} {type: string, data: any}
 */
export const parseSocketMessage = (message) => {
  if (!validateSocketMessage(message)) {
    return null;
  }

  switch (message.type) {
    case "candle":
    case "candle_update":
      return {
        type: "candle",
        data: adaptSocketCandle(message.data),
      };

    case "operation":
      return {
        type: "operation",
        data: adaptSocketOperation(message.data),
      };

    case "batch":
    case "initial_data":
      return {
        type: "batch",
        data: adaptSocketBatch(message.data),
      };

    case "status":
      return {
        type: "status",
        data: message.data,
      };

    default:
      console.warn("⚠️ Unknown message type:", message.type);
      return null;
  }
};
