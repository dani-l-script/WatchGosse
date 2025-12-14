/**
 * Interfaz abstracta para servicios de datos
 * 
 * Permite cambiar fácilmente entre WebSocket, TCP, o cualquier otro protocolo
 * sin modificar el código que consume los datos.
 */

export class IDataService {
  /**
   * Conectar al servicio de datos
   * @param {string} url - URL de conexión
   * @param {Object} options - Opciones de conexión
   * @returns {Promise<void>}
   */
  async connect(url, options = {}) { // eslint-disable-line no-unused-vars
    throw new Error("Method 'connect' must be implemented");
  }

  /**
   * Desconectar del servicio
   * @returns {void}
   */
  disconnect() {
    throw new Error("Method 'disconnect' must be implemented");
  }

  /**
   * Subscribirse a eventos
   * @param {string} event - Nombre del evento ('message', 'connect', 'disconnect', 'error')
   * @param {Function} callback - Función a ejecutar cuando ocurre el evento
   * @returns {void}
   */
  on(event, callback) { // eslint-disable-line no-unused-vars
    throw new Error("Method 'on' must be implemented");
  }

  /**
   * Remover listener de evento
   * @param {string} event - Nombre del evento
   * @param {Function} callback - Función a remover
   * @returns {void}
   */
  off(event, callback) { // eslint-disable-line no-unused-vars
    throw new Error("Method 'off' must be implemented");
  }

  /**
   * Enviar mensaje al servidor
   * @param {any} data - Datos a enviar
   * @returns {void}
   */
  send(data) { // eslint-disable-line no-unused-vars
    throw new Error("Method 'send' must be implemented");
  }

  /**
   * Obtener estado de la conexión
   * @returns {string} 'connected' | 'connecting' | 'disconnected' | 'error'
   */
  getStatus() {
    throw new Error("Method 'getStatus' must be implemented");
  }

  /**
   * Verificar si está conectado
   * @returns {boolean}
   */
  isConnected() {
    throw new Error("Method 'isConnected' must be implemented");
  }
}
