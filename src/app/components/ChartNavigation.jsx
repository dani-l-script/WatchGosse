import { useDispatch, useSelector } from "react-redux";
import {
  moveWindowBackward,
  moveWindowForward,
  goToStart,
  goToEnd,
  selectNavigationInfo,
} from "../features/slices/chartsRealtimeSlice";
import "./chartNavigation.sass";

export default function ChartNavigation() {
  const dispatch = useDispatch();
  const navInfo = useSelector(selectNavigationInfo);

  const handlePrevious = () => {
    dispatch(moveWindowBackward());
  };

  const handleNext = () => {
    dispatch(moveWindowForward());
  };

  const handleGoToStart = () => {
    dispatch(goToStart());
  };

  const handleGoToEnd = () => {
    dispatch(goToEnd());
  };

  if (navInfo.total === 0) {
    return null; // No mostrar si no hay datos
  }

  return (
    <div className="chart-navigation">
      <div className="nav-controls">
        <button
          className="nav-button"
          onClick={handleGoToStart}
          disabled={!navInfo.canGoBack}
          title="Ir al inicio"
        >
          <span className="nav-icon">⏮</span>
        </button>

        <button
          className="nav-button"
          onClick={handlePrevious}
          disabled={!navInfo.canGoBack}
          title="Anterior (100 velas)"
        >
          <span className="nav-icon">◀</span>
        </button>

        <div className="nav-info">
          <span className="nav-range">
            {navInfo.start} - {navInfo.end}
          </span>
          <span className="nav-separator">/</span>
          <span className="nav-total">{navInfo.total}</span>
          {navInfo.isLiveMode && (
            <span className="live-badge" title="Siguiendo últimas velas">
              🔴 LIVE
            </span>
          )}
        </div>

        <button
          className="nav-button"
          onClick={handleNext}
          disabled={!navInfo.canGoForward}
          title="Siguiente (100 velas)"
        >
          <span className="nav-icon">▶</span>
        </button>

        <button
          className="nav-button"
          onClick={handleGoToEnd}
          disabled={navInfo.isLiveMode}
          title="Ir al final (Modo LIVE)"
        >
          <span className="nav-icon">⏭</span>
        </button>
      </div>

      {!navInfo.isLiveMode && (
        <div className="nav-hint">
          <span className="hint-icon">ℹ️</span>
          Navegando historial. Click en{" "}
          <button className="inline-nav-button" onClick={handleGoToEnd}>
            ⏭ Ir al final
          </button>{" "}
          para volver al modo LIVE
        </div>
      )}
    </div>
  );
}
