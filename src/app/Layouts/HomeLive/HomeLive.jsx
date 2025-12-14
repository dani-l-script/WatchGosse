import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import CandleCharts from "../../components/CandleCharts";
import ConnectionStatus from "../../components/ConnectionStatus";
import { getWebSocketService } from "../../services/WebSocketService";
import { parseSocketMessage } from "../../services/dataAdapter";
import {
  setConnectionStatus,
  setInitialData,
  updateLastCandle,
  addOperation,
  resetRealtimeData,
  setError,
  incrementReconnectAttempts,
} from "../../features/slices/chartsRealtimeSlice";
import "./homeLive.sass";

const WEBSOCKET_URL =
  import.meta.env.VITE_WEBSOCKET_URL || "ws://localhost:8080";

export default function HomeLive() {
  const dispatch = useDispatch();
  const connectionStatus = useSelector(
    (state) => state.dataChartsRealtime.connectionStatus
  );

  useEffect(() => {
    const wsService = getWebSocketService();

    // Handler para mensajes
    const handleMessage = (rawMessage) => {
      const parsed = parseSocketMessage(rawMessage);

      if (!parsed) {
        console.warn("⚠️ Could not parse message:", rawMessage);
        return;
      }

      switch (parsed.type) {
        case "candle":
          if (parsed.data) {
            dispatch(updateLastCandle(parsed.data));
          }
          break;

        case "operation":
          if (parsed.data) {
            dispatch(addOperation(parsed.data));
          }
          break;

        case "batch":
          if (parsed.data) {
            dispatch(setInitialData(parsed.data));
          }
          break;

        case "status":
          console.log("📊 Server status:", parsed.data);
          break;

        default:
          console.warn("⚠️ Unknown message type:", parsed.type);
      }
    };

    // Handler para conexión exitosa
    const handleConnect = () => {
      console.log("✅ Connected to WebSocket");
      dispatch(setConnectionStatus({ status: "connected" }));
    };

    // Handler para desconexión
    const handleDisconnect = ({ code, reason }) => {
      console.log("🔌 Disconnected from WebSocket:", code, reason);
      dispatch(setConnectionStatus({ status: "disconnected" }));
    };

    // Handler para errores
    const handleError = (error) => {
      console.error("❌ WebSocket error:", error);
      dispatch(setError(error.error?.message || "Connection error"));
    };

    // Handler para reconexión
    const handleReconnect = ({ attempt, maxAttempts }) => {
      console.log(`🔄 Reconnecting... (${attempt}/${maxAttempts})`);
      dispatch(setConnectionStatus({ status: "reconnecting" }));
      dispatch(incrementReconnectAttempts());
    };

    // Registrar listeners
    wsService.on("message", handleMessage);
    wsService.on("connect", handleConnect);
    wsService.on("disconnect", handleDisconnect);
    wsService.on("error", handleError);
    wsService.on("reconnect", handleReconnect);

    // Conectar
    dispatch(setConnectionStatus({ status: "connecting" }));
    wsService
      .connect(WEBSOCKET_URL, {
        maxReconnectAttempts: 5,
        reconnectDelay: 2000,
      })
      .catch((error) => {
        console.error("❌ Failed to connect:", error);
        dispatch(setError("Failed to connect to server"));
      });

    // Cleanup al desmontar
    return () => {
      console.log("🧹 Cleaning up HomeLive");
      wsService.off("message", handleMessage);
      wsService.off("connect", handleConnect);
      wsService.off("disconnect", handleDisconnect);
      wsService.off("error", handleError);
      wsService.off("reconnect", handleReconnect);
      wsService.disconnect();
      dispatch(resetRealtimeData());
      dispatch(setConnectionStatus({ status: "disconnected" }));
    };
  }, [dispatch]);

  return (
    <div className="home-live-container">
      <div className="live-header">
        <h1 className="live-title">
          <span className="title-icon">📡</span>
          Live Trading Data
        </h1>
        <ConnectionStatus />
      </div>

      <div className="live-content">
        {connectionStatus === "connected" ? (
          <CandleCharts isRealtime={true} />
        ) : connectionStatus === "connecting" ||
          connectionStatus === "reconnecting" ? (
          <div className="live-placeholder connecting">
            <div className="spinner"></div>
            <p>Connecting to live data stream...</p>
          </div>
        ) : (
          <div className="live-placeholder disconnected">
            <div className="placeholder-icon">🔌</div>
            <h2>Not Connected</h2>
            <p>Unable to connect to the live data server.</p>
            <p className="placeholder-hint">
              Make sure the WebSocket server is running on {WEBSOCKET_URL}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
