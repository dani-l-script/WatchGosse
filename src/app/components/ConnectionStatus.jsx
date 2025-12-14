import { useSelector } from "react-redux";
import "./connectionStatus.sass";

const ConnectionStatus = () => {
  const connectionStatus = useSelector(
    (state) => state.dataChartsRealtime.connectionStatus
  );
  const lastUpdate = useSelector(
    (state) => state.dataChartsRealtime.lastUpdate
  );
  const reconnectAttempts = useSelector(
    (state) => state.dataChartsRealtime.reconnectAttempts
  );
  const error = useSelector((state) => state.dataChartsRealtime.error);

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case "connected":
        return {
          icon: "🟢",
          text: "LIVE",
          className: "connected",
          color: "#10b981",
        };
      case "connecting":
        return {
          icon: "🟡",
          text: "Connecting...",
          className: "connecting",
          color: "#f59e0b",
        };
      case "disconnected":
        return {
          icon: "🔴",
          text: "Disconnected",
          className: "disconnected",
          color: "#ef4444",
        };
      case "error":
        return {
          icon: "⚠️",
          text: "Connection Error",
          className: "error",
          color: "#dc2626",
        };
      case "reconnecting":
        return {
          icon: "🔄",
          text: `Reconnecting (${reconnectAttempts})`,
          className: "reconnecting",
          color: "#f59e0b",
        };
      default:
        return {
          icon: "⚫",
          text: "Unknown",
          className: "unknown",
          color: "#6b7280",
        };
    }
  };

  const config = getStatusConfig();

  const formatLastUpdate = () => {
    if (!lastUpdate) return "Never";

    const now = Date.now();
    const diff = now - lastUpdate;

    if (diff < 1000) return "Just now";
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return new Date(lastUpdate).toLocaleTimeString();
  };

  return (
    <div className={`connection-status ${config.className}`}>
      <div className="status-indicator">
        <span className="status-icon" style={{ color: config.color }}>
          {config.icon}
        </span>
        <span className="status-text" style={{ color: config.color }}>
          {config.text}
        </span>
      </div>

      {connectionStatus === "connected" && (
        <div className="status-details">
          <span className="last-update">Last update: {formatLastUpdate()}</span>
        </div>
      )}

      {error && (
        <div className="status-error">
          <span className="error-message">{error}</span>
        </div>
      )}

      {connectionStatus === "reconnecting" && reconnectAttempts > 0 && (
        <div className="status-details">
          <span className="reconnect-info">
            Attempt {reconnectAttempts} of 5
          </span>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;
