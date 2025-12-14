// src/components/DataViewer.js
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";
import { fetchData } from "../features/slices/chartsSlice";
import Chart from "react-apexcharts";
import {
  getOverallStats,
  getStatsByPeriod,
  operationsToAnnotations,
  formatCurrency,
  formatPercent,
  getCompletedTrades,
} from "../utils/operationAnalytics";

const CandleCharts = ({ isRealtime = false }) => {
  const dispatch = useDispatch();

  // Seleccionar el slice correcto según el modo
  const sliceKey = isRealtime ? "dataChartsRealtime" : "dataCharts";

  const data = useSelector((state) => state[sliceKey].data);
  const operations = useSelector((state) => state[sliceKey].operations);
  const status = useSelector(
    (state) =>
      state[sliceKey].status ||
      (isRealtime ? state[sliceKey].connectionStatus : "idle")
  );
  const error = useSelector((state) => state[sliceKey].error);

  const [showOperations, setShowOperations] = useState(true);

  useEffect(() => {
    // Solo hacer fetch si es modo estático
    if (!isRealtime) {
      dispatch(fetchData());
    }
  }, [dispatch, isRealtime]);

  if (status === "loading") {
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          color: "#e4e6eb",
        }}
      >
        <p style={{ fontSize: "18px" }}>Loading...</p>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          backgroundColor: "#1a1f2e",
          borderRadius: "8px",
          margin: "20px",
        }}
      >
        <h2 style={{ color: "#ff6b6b" }}>Error Loading Data</h2>
        <p style={{ color: "#b8bcc4" }}>
          {error ||
            "Unable to fetch cryptocurrency data. Please check your connection."}
        </p>
        <button
          onClick={() => dispatch(fetchData())}
          style={{
            padding: "12px 24px",
            backgroundColor: "#4dabf7",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            marginTop: "10px",
            fontSize: "14px",
            fontWeight: "600",
            transition: "background-color 0.2s",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#339af0")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#4dabf7")}
        >
          Retry
        </button>
      </div>
    );
  }

  const series = [
    {
      name: "Candlestick",
      data: data,
    },
  ];

  // Calculate statistics
  const overallStats =
    operations.length > 0 ? getOverallStats(operations) : null;
  const periodStats =
    operations.length > 0 ? getStatsByPeriod(operations) : null;
  const completedTrades =
    operations.length > 0 ? getCompletedTrades(operations) : [];

  // Get annotations for operations
  const annotations =
    showOperations && operations.length > 0
      ? operationsToAnnotations(operations)
      : { points: [] };

  const options = {
    chart: {
      type: "candlestick",
      height: 450,
      width: "100%",
      background: "#1a1f2e",
      foreColor: "#b8bcc4",
      toolbar: {
        show: true,
        tools: {
          download: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
      animations: {
        enabled: true,
      },
    },
    annotations: annotations,
    title: {
      text: "Cryptocurrency Trading Chart with Entry/Exit Points",
      align: "left",
      style: {
        fontSize: "18px",
        fontWeight: "bold",
        color: "#e4e6eb",
      },
    },
    xaxis: {
      type: "datetime",
      labels: {
        datetimeUTC: false,
        style: {
          colors: "#b8bcc4",
        },
      },
      axisBorder: {
        color: "#2d3748",
      },
      axisTicks: {
        color: "#2d3748",
      },
    },
    yaxis: {
      tooltip: {
        enabled: true,
      },
      labels: {
        formatter: (value) => `$${value?.toFixed(4) || 0}`,
        style: {
          colors: "#b8bcc4",
        },
      },
    },
    tooltip: {
      enabled: true,
      shared: false,
      theme: "dark",
      custom: function ({ seriesIndex, dataPointIndex, w }) {
        const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
        if (!data) return "";

        // Check if there's an operation at this time
        const operation = operations.find(
          (op) => op.entryTime === data.x || op.exitTime === data.x
        );

        let operationInfo = "";
        if (operation) {
          if (operation.operation === "entry") {
            operationInfo = `
              <div style="margin-top: 8px; padding-top: 8px; border-top: 2px solid #51cf66;">
                <div style="color: #51cf66; font-weight: bold;">🔺 ENTRY POINT</div>
                <div style="font-size: 11px; color: #b8bcc4;">Entry Price: ${formatCurrency(
                  operation.entryPrice
                )}</div>
                <div style="font-size: 11px; color: #b8bcc4;">Stop Loss: ${formatCurrency(
                  operation.initialStopPrice
                )}</div>
                <div style="font-size: 11px; color: #b8bcc4;">Risk: ${operation.initialRiskPct?.toFixed(
                  2
                )}%</div>
              </div>
            `;
          } else if (operation.operation === "exit") {
            const profitColor = operation.profit > 0 ? "#51cf66" : "#ff6b6b";
            operationInfo = `
              <div style="margin-top: 8px; padding-top: 8px; border-top: 2px solid ${profitColor};">
                <div style="color: ${profitColor}; font-weight: bold;">
                  ${
                    operation.profit > 0 ? "✅ EXIT (PROFIT)" : "❌ EXIT (LOSS)"
                  }
                </div>
                <div style="font-size: 11px; color: #b8bcc4;">Entry: ${formatCurrency(
                  operation.entryPrice
                )}</div>
                <div style="font-size: 11px; color: #b8bcc4;">Exit: ${formatCurrency(
                  operation.exitPrice
                )}</div>
                <div style="font-size: 11px; color: ${profitColor}; font-weight: bold;">
                  P/L: ${formatCurrency(operation.profit)} (${formatPercent(
              operation.profitPct
            )})
                </div>
                <div style="font-size: 11px; color: #b8bcc4;">Holding: ${
                  operation.holdingPeriod
                } periods</div>
                <div style="font-size: 11px; color: #b8bcc4;">Reason: ${
                  operation.exitReason
                }</div>
              </div>
            `;
          }
        }

        return `<div style="padding: 12px; background: #1a1f2e; border: 1px solid #2d3748; border-radius: 6px;">
          <div style="color: #e4e6eb; margin-bottom: 6px;"><strong>Date:</strong> ${new Date(
            data.x
          ).toLocaleString()}</div>
          <div style="color: #51cf66;"><strong>Open:</strong> $${data.y[0].toFixed(
            4
          )}</div>
          <div style="color: #63e6be;"><strong>High:</strong> $${data.y[1].toFixed(
            4
          )}</div>
          <div style="color: #ff6b6b;"><strong>Low:</strong> $${data.y[2].toFixed(
            4
          )}</div>
          <div style="color: #4dabf7;"><strong>Close:</strong> $${data.y[3].toFixed(
            4
          )}</div>
          ${operationInfo}
        </div>`;
      },
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: "#51cf66",
          downward: "#ff6b6b",
        },
      },
    },
    grid: {
      borderColor: "#2d3748",
      strokeDashArray: 3,
    },
  };

  return (
    <div
      style={{
        padding: "0",
        backgroundColor: "#0f1419",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <h2
        style={{
          marginBottom: "20px",
          color: "#e4e6eb",
          fontSize: "28px",
          fontWeight: "700",
        }}
      >
        Cryptocurrency Trading Dashboard
      </h2>

      {data.length > 0 ? (
        <div style={{ width: "100%" }}>
          {/* Overall Statistics */}
          {overallStats && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "15px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  padding: "20px",
                  backgroundColor: "#1a1f2e",
                  borderRadius: "12px",
                  borderLeft: "4px solid #4dabf7",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "#8b92a8",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Total Trades
                </div>
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "bold",
                    color: "#e4e6eb",
                    marginTop: "8px",
                  }}
                >
                  {overallStats.totalTrades}
                </div>
              </div>

              <div
                style={{
                  padding: "20px",
                  backgroundColor: "#1a1f2e",
                  borderRadius: "12px",
                  borderLeft: `4px solid ${
                    overallStats.totalProfit >= 0 ? "#51cf66" : "#ff6b6b"
                  }`,
                  boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "#8b92a8",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Total Profit/Loss
                </div>
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "bold",
                    color:
                      overallStats.totalProfit >= 0 ? "#51cf66" : "#ff6b6b",
                    marginTop: "8px",
                  }}
                >
                  {formatCurrency(overallStats.totalProfit)}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    marginTop: "6px",
                    color: "#b8bcc4",
                  }}
                >
                  {formatPercent(overallStats.totalProfitPct)}
                </div>
              </div>

              <div
                style={{
                  padding: "20px",
                  backgroundColor: "#1a1f2e",
                  borderRadius: "12px",
                  borderLeft: "4px solid #51cf66",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "#8b92a8",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Win Rate
                </div>
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "bold",
                    color: "#51cf66",
                    marginTop: "8px",
                  }}
                >
                  {overallStats.winRate.toFixed(1)}%
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    marginTop: "6px",
                    color: "#b8bcc4",
                  }}
                >
                  {overallStats.winningTrades}W / {overallStats.losingTrades}L
                </div>
              </div>

              <div
                style={{
                  padding: "20px",
                  backgroundColor: "#1a1f2e",
                  borderRadius: "12px",
                  borderLeft: "4px solid #ffa94d",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "#8b92a8",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Profit Factor
                </div>
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "bold",
                    color: "#e4e6eb",
                    marginTop: "8px",
                  }}
                >
                  {overallStats.profitFactor.toFixed(2)}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    marginTop: "6px",
                    color: "#b8bcc4",
                  }}
                >
                  Avg Hold: {overallStats.avgHoldingPeriod.toFixed(1)} periods
                </div>
              </div>
            </div>
          )}

          {/* Period Statistics */}
          {periodStats && (
            <div
              style={{
                marginBottom: "20px",
                padding: "24px",
                backgroundColor: "#1a1f2e",
                borderRadius: "12px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
              }}
            >
              <h3
                style={{
                  marginBottom: "20px",
                  color: "#e4e6eb",
                  fontSize: "20px",
                  fontWeight: "600",
                }}
              >
                Operations by Holding Period
              </h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#141921" }}>
                      <th
                        style={{
                          padding: "14px",
                          textAlign: "left",
                          borderBottom: "2px solid #2d3748",
                          color: "#8b92a8",
                          fontSize: "12px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          fontWeight: "600",
                        }}
                      >
                        Period
                      </th>
                      <th
                        style={{
                          padding: "14px",
                          textAlign: "center",
                          borderBottom: "2px solid #2d3748",
                          color: "#8b92a8",
                          fontSize: "12px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          fontWeight: "600",
                        }}
                      >
                        Trades
                      </th>
                      <th
                        style={{
                          padding: "14px",
                          textAlign: "right",
                          borderBottom: "2px solid #2d3748",
                          color: "#8b92a8",
                          fontSize: "12px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          fontWeight: "600",
                        }}
                      >
                        Total P/L
                      </th>
                      <th
                        style={{
                          padding: "14px",
                          textAlign: "right",
                          borderBottom: "2px solid #2d3748",
                          color: "#8b92a8",
                          fontSize: "12px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          fontWeight: "600",
                        }}
                      >
                        Avg P/L
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(periodStats).map(([period, stats]) => (
                      <tr
                        key={period}
                        style={{ borderBottom: "1px solid #2d3748" }}
                      >
                        <td
                          style={{
                            padding: "14px",
                            fontWeight: "bold",
                            color: "#e4e6eb",
                          }}
                        >
                          {period.toUpperCase()}
                        </td>
                        <td
                          style={{
                            padding: "14px",
                            textAlign: "center",
                            color: "#b8bcc4",
                          }}
                        >
                          {stats.count}
                        </td>
                        <td
                          style={{
                            padding: "14px",
                            textAlign: "right",
                            color: stats.profit >= 0 ? "#51cf66" : "#ff6b6b",
                            fontWeight: "bold",
                          }}
                        >
                          {formatCurrency(stats.profit)}
                        </td>
                        <td
                          style={{
                            padding: "14px",
                            textAlign: "right",
                            color:
                              stats.count > 0 && stats.profit / stats.count >= 0
                                ? "#51cf66"
                                : "#ff6b6b",
                          }}
                        >
                          {stats.count > 0
                            ? formatCurrency(stats.profit / stats.count)
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Controls */}
          <div
            style={{
              marginBottom: "20px",
              padding: "18px",
              backgroundColor: "#1a1f2e",
              borderRadius: "12px",
              border: "1px solid #2d3748",
              boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
            }}
          >
            <label
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <input
                type="checkbox"
                checked={showOperations}
                onChange={(e) => setShowOperations(e.target.checked)}
                style={{
                  marginRight: "10px",
                  width: "18px",
                  height: "18px",
                  cursor: "pointer",
                  accentColor: "#4dabf7",
                }}
              />
              <strong style={{ color: "#e4e6eb", fontSize: "15px" }}>
                Show Entry/Exit Points on Chart
              </strong>
            </label>
          </div>

          {/* Chart */}
          <div style={{ marginBottom: "20px", width: "100%" }}>
            <Chart
              options={options}
              series={series}
              type="candlestick"
              height={450}
              width="100%"
            />
          </div>

          {/* Trades Table */}
          {completedTrades.length > 0 && (
            <div
              style={{
                marginTop: "20px",
                padding: "24px",
                backgroundColor: "#1a1f2e",
                borderRadius: "12px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
              }}
            >
              <h3
                style={{
                  marginBottom: "20px",
                  color: "#e4e6eb",
                  fontSize: "20px",
                  fontWeight: "600",
                }}
              >
                Trade History (Last 20 Trades)
              </h3>
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "13px",
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: "#141921" }}>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          borderBottom: "2px solid #2d3748",
                          color: "#8b92a8",
                          fontSize: "11px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          fontWeight: "600",
                        }}
                      >
                        Entry Date
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          borderBottom: "2px solid #2d3748",
                          color: "#8b92a8",
                          fontSize: "11px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          fontWeight: "600",
                        }}
                      >
                        Exit Date
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "right",
                          borderBottom: "2px solid #2d3748",
                          color: "#8b92a8",
                          fontSize: "11px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          fontWeight: "600",
                        }}
                      >
                        Entry Price
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "right",
                          borderBottom: "2px solid #2d3748",
                          color: "#8b92a8",
                          fontSize: "11px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          fontWeight: "600",
                        }}
                      >
                        Exit Price
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          borderBottom: "2px solid #2d3748",
                          color: "#8b92a8",
                          fontSize: "11px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          fontWeight: "600",
                        }}
                      >
                        Hold
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "right",
                          borderBottom: "2px solid #2d3748",
                          color: "#8b92a8",
                          fontSize: "11px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          fontWeight: "600",
                        }}
                      >
                        P/L
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "right",
                          borderBottom: "2px solid #2d3748",
                          color: "#8b92a8",
                          fontSize: "11px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          fontWeight: "600",
                        }}
                      >
                        P/L %
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          borderBottom: "2px solid #2d3748",
                          color: "#8b92a8",
                          fontSize: "11px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          fontWeight: "600",
                        }}
                      >
                        Exit Reason
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedTrades
                      .slice(-20)
                      .reverse()
                      .map((trade, idx) => (
                        <tr
                          key={idx}
                          style={{
                            borderBottom: "1px solid #2d3748",
                            transition: "background-color 0.2s",
                          }}
                          onMouseOver={(e) =>
                            (e.currentTarget.style.backgroundColor = "#141921")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                        >
                          <td style={{ padding: "12px", color: "#b8bcc4" }}>
                            {new Date(trade.entryTime).toLocaleString()}
                          </td>
                          <td style={{ padding: "12px", color: "#b8bcc4" }}>
                            {new Date(trade.exitTime).toLocaleString()}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "right",
                              color: "#e4e6eb",
                            }}
                          >
                            {formatCurrency(trade.entryPrice)}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "right",
                              color: "#e4e6eb",
                            }}
                          >
                            {formatCurrency(trade.exitPrice)}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "center",
                              color: "#b8bcc4",
                            }}
                          >
                            {trade.holdingPeriod}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "right",
                              color: trade.profit >= 0 ? "#51cf66" : "#ff6b6b",
                              fontWeight: "bold",
                            }}
                          >
                            {formatCurrency(trade.profit)}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "right",
                              color:
                                trade.profitPct >= 0 ? "#51cf66" : "#ff6b6b",
                              fontWeight: "bold",
                            }}
                          >
                            {formatPercent(trade.profitPct)}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              fontSize: "11px",
                              color: "#8b92a8",
                            }}
                          >
                            {trade.exitReason}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p style={{ color: "#b8bcc4", fontSize: "16px" }}>
          No data available to display.
        </p>
      )}
    </div>
  );
};

CandleCharts.propTypes = {
  isRealtime: PropTypes.bool,
};

export default CandleCharts;
