import { IDataService } from "./IDataService";

/**
 * Implementación de WebSocket del servicio de datos
 *
 * Desacoplado de Redux - solo se encarga de la comunicación
 */
export class WebSocketService extends IDataService {
  constructor() {
    super();
    this.ws = null;
    this.url = null;
    this.listeners = {
      message: [],
      connect: [],
      disconnect: [],
      error: [],
      reconnect: [],
    };
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 2000; // 2 segundos
    this.reconnectTimer = null;
    this.isManualDisconnect = false;
  }

  /**
   * Conectar al WebSocket
   */
  async connect(url, options = {}) {
    this.url = url;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
    this.reconnectDelay = options.reconnectDelay || 2000;
    this.isManualDisconnect = false;

    return new Promise((resolve, reject) => {
      try {
        console.log("🔌 Connecting to WebSocket:", url);
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          console.log("✅ WebSocket connected");
          this.reconnectAttempts = 0;
          this._emit("connect");
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this._emit("message", data);
          } catch (error) {
            console.error("❌ Error parsing WebSocket message:", error);
            this._emit("error", { type: "parse_error", error });
          }
        };

        this.ws.onerror = (error) => {
          console.error("❌ WebSocket error:", error);
          this._emit("error", { type: "connection_error", error });
          reject(error);
        };

        this.ws.onclose = (event) => {
          console.log("🔌 WebSocket closed:", event.code, event.reason);
          this._emit("disconnect", { code: event.code, reason: event.reason });

          // Intentar reconectar si no fue manual
          if (
            !this.isManualDisconnect &&
            this.reconnectAttempts < this.maxReconnectAttempts
          ) {
            this._scheduleReconnect();
          }
        };
      } catch (error) {
        console.error("❌ Error creating WebSocket:", error);
        this._emit("error", { type: "connection_error", error });
        reject(error);
      }
    });
  }

  /**
   * Programar reconexión
   */
  _scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    const delay =
      this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1); // Backoff exponencial

    console.log(
      `🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    this._emit("reconnect", {
      attempt: this.reconnectAttempts,
      maxAttempts: this.maxReconnectAttempts,
      delay,
    });

    this.reconnectTimer = setTimeout(() => {
      this.connect(this.url);
    }, delay);
  }

  /**
   * Desconectar
   */
  disconnect() {
    this.isManualDisconnect = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000, "Client disconnect");
      this.ws = null;
    }

    console.log("🔌 WebSocket manually disconnected");
  }

  /**
   * Suscribirse a eventos
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      console.warn(`⚠️ Unknown event: ${event}`);
      return;
    }

    this.listeners[event].push(callback);
  }

  /**
   * Desuscribirse de eventos
   */
  off(event, callback) {
    if (!this.listeners[event]) {
      return;
    }

    this.listeners[event] = this.listeners[event].filter(
      (cb) => cb !== callback
    );
  }

  /**
   * Enviar mensaje
   */
  send(data) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn("⚠️ WebSocket not connected, cannot send message");
      return false;
    }

    try {
      const message = typeof data === "string" ? data : JSON.stringify(data);
      this.ws.send(message);
      return true;
    } catch (error) {
      console.error("❌ Error sending message:", error);
      this._emit("error", { type: "send_error", error });
      return false;
    }
  }

  /**
   * Obtener estado
   */
  getStatus() {
    if (!this.ws) {
      return "disconnected";
    }

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return "connecting";
      case WebSocket.OPEN:
        return "connected";
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
        return "disconnected";
      default:
        return "disconnected";
    }
  }

  /**
   * Verificar si está conectado
   */
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Emitir evento a listeners
   */
  _emit(event, data) {
    if (!this.listeners[event]) {
      return;
    }

    this.listeners[event].forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`❌ Error in ${event} listener:`, error);
      }
    });
  }

  /**
   * Limpiar todos los listeners
   */
  removeAllListeners() {
    Object.keys(this.listeners).forEach((event) => {
      this.listeners[event] = [];
    });
  }
}

// Singleton instance
let instance = null;

export const getWebSocketService = () => {
  if (!instance) {
    instance = new WebSocketService();
  }
  return instance;
};
