// src/components/DataViewer.js
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchData } from "../features/slices/chartsSlice";
import Chart from "react-apexcharts";

const CandleCharts = () => {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.dataCharts.data);
  const status = useSelector((state) => state.dataCharts.status);
  const error = useSelector((state) => state.dataCharts.error);

  useEffect(() => {
    dispatch(fetchData());
  }, [dispatch]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (status === "failed") {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2 style={{ color: "#e74c3c" }}>Error Loading Data</h2>
        <p>
          {error ||
            "Unable to fetch cryptocurrency data. Please check your connection."}
        </p>
        <button
          onClick={() => dispatch(fetchData())}
          style={{
            padding: "10px 20px",
            backgroundColor: "#3498db",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginTop: "10px",
          }}
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

  const options = {
    chart: {
      type: "candlestick",
      height: 450,
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
    title: {
      text: "Cryptocurrency Candlestick Chart",
      align: "left",
      style: {
        fontSize: "18px",
        fontWeight: "bold",
      },
    },
    xaxis: {
      type: "datetime",
      labels: {
        datetimeUTC: false,
      },
    },
    yaxis: {
      tooltip: {
        enabled: true,
      },
      labels: {
        formatter: (value) => `$${value?.toFixed(4) || 0}`,
      },
    },
    tooltip: {
      enabled: true,
      shared: false,
      custom: function ({ seriesIndex, dataPointIndex, w }) {
        const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
        if (!data) return "";

        return `<div style="padding: 10px; background: #fff; border: 1px solid #ddd;">
          <div><strong>Date:</strong> ${new Date(data.x).toLocaleString()}</div>
          <div style="color: #16a085;"><strong>Open:</strong> $${data.y[0].toFixed(
            4
          )}</div>
          <div style="color: #27ae60;"><strong>High:</strong> $${data.y[1].toFixed(
            4
          )}</div>
          <div style="color: #c0392b;"><strong>Low:</strong> $${data.y[2].toFixed(
            4
          )}</div>
          <div style="color: #2980b9;"><strong>Close:</strong> $${data.y[3].toFixed(
            4
          )}</div>
        </div>`;
      },
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: "#16a085",
          downward: "#e74c3c",
        },
      },
    },
    grid: {
      borderColor: "#e0e0e0",
    },
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "10px" }}>Cryptocurrency Data Viewer</h2>
      {data.length > 0 ? (
        <div style={{ marginTop: "20px" }}>
          <div
            style={{
              marginBottom: "20px",
              padding: "15px",
              backgroundColor: "#f8f9fa",
              borderRadius: "5px",
              display: "flex",
              justifyContent: "space-around",
            }}
          >
            <div>
              <strong>Data Points:</strong> {data.length}
            </div>
            <div>
              <strong>First Date:</strong>{" "}
              {data[0]?.x ? new Date(data[0].x).toLocaleDateString() : "N/A"}
            </div>
            <div>
              <strong>Last Date:</strong>{" "}
              {data[data.length - 1]?.x
                ? new Date(data[data.length - 1].x).toLocaleDateString()
                : "N/A"}
            </div>
          </div>
          <Chart
            options={options}
            series={series}
            type="candlestick"
            height={450}
          />
        </div>
      ) : (
        <p>No data available to display.</p>
      )}
    </div>
  );
};

export default CandleCharts;
