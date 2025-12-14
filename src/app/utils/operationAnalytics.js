/**
 * Calculate trading operation statistics and analytics
 */

/**
 * Get completed trades (only exit operations)
 */
export const getCompletedTrades = (operations) => {
  return operations.filter((op) => op.operation === "exit");
};

/**
 * Calculate statistics by time period
 */
export const getStatsByPeriod = (operations) => {
  const completedTrades = getCompletedTrades(operations);

  const periods = {
    "1d": { days: 1, trades: [], profit: 0, count: 0 },
    "2d": { days: 2, trades: [], profit: 0, count: 0 },
    "3d": { days: 3, trades: [], profit: 0, count: 0 },
    "4d": { days: 4, trades: [], profit: 0, count: 0 },
    "5d": { days: 5, trades: [], profit: 0, count: 0 },
    "1w": { days: 7, trades: [], profit: 0, count: 0 },
    "2w": { days: 14, trades: [], profit: 0, count: 0 },
    "1m": { days: 30, trades: [], profit: 0, count: 0 },
  };

  completedTrades.forEach((trade) => {
    const holdingDays = trade.holdingPeriod || 0;

    Object.entries(periods).forEach(([, period]) => {
      if (holdingDays <= period.days) {
        period.trades.push(trade);
        period.profit += trade.profit || 0;
        period.count += 1;
      }
    });
  });

  return periods;
};

/**
 * Calculate overall statistics
 */
export const getOverallStats = (operations) => {
  const completedTrades = getCompletedTrades(operations);

  const totalProfit = completedTrades.reduce(
    (sum, t) => sum + (t.profit || 0),
    0
  );
  const totalProfitPct = completedTrades.reduce(
    (sum, t) => sum + (t.profitPct || 0),
    0
  );

  const winningTrades = completedTrades.filter((t) => (t.profit || 0) > 0);
  const losingTrades = completedTrades.filter((t) => (t.profit || 0) < 0);

  const avgProfit =
    completedTrades.length > 0 ? totalProfit / completedTrades.length : 0;

  const avgProfitPct =
    completedTrades.length > 0 ? totalProfitPct / completedTrades.length : 0;

  const winRate =
    completedTrades.length > 0
      ? (winningTrades.length / completedTrades.length) * 100
      : 0;

  const avgWin =
    winningTrades.length > 0
      ? winningTrades.reduce((sum, t) => sum + t.profit, 0) /
        winningTrades.length
      : 0;

  const avgLoss =
    losingTrades.length > 0
      ? losingTrades.reduce((sum, t) => sum + t.profit, 0) / losingTrades.length
      : 0;

  const profitFactor = Math.abs(avgLoss) > 0 ? avgWin / Math.abs(avgLoss) : 0;

  const avgHoldingPeriod =
    completedTrades.length > 0
      ? completedTrades.reduce((sum, t) => sum + (t.holdingPeriod || 0), 0) /
        completedTrades.length
      : 0;

  return {
    totalTrades: completedTrades.length,
    totalProfit: totalProfit,
    totalProfitPct: totalProfitPct,
    avgProfit: avgProfit,
    avgProfitPct: avgProfitPct,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    winRate: winRate,
    avgWin: avgWin,
    avgLoss: avgLoss,
    profitFactor: profitFactor,
    avgHoldingPeriod: avgHoldingPeriod,
    bestTrade: completedTrades.reduce(
      (best, t) => ((t.profit || 0) > (best.profit || 0) ? t : best),
      completedTrades[0] || {}
    ),
    worstTrade: completedTrades.reduce(
      (worst, t) => ((t.profit || 0) < (worst.profit || 0) ? t : worst),
      completedTrades[0] || {}
    ),
  };
};

/**
 * Convert operations to chart annotations
 */
export const operationsToAnnotations = (operations) => {
  const entries = operations.filter((op) => op.operation === "entry");
  const exits = operations.filter((op) => op.operation === "exit");

  return {
    points: [
      ...entries.map((op) => ({
        x: op.entryTime,
        y: op.entryPrice,
        marker: {
          size: 8,
          fillColor: "#00E396",
          strokeColor: "#fff",
          strokeWidth: 2,
        },
        label: {
          borderColor: "#00E396",
          offsetY: 5,
          style: {
            color: "#fff",
            background: "#00E396",
            fontSize: "10px",
            fontWeight: "bold",
          },
          text: "🔺 ENTRY",
        },
      })),
      ...exits.map((op) => ({
        x: op.exitTime,
        y: op.exitPrice,
        marker: {
          size: 8,
          fillColor: op.profit > 0 ? "#00E396" : "#FF4560",
          strokeColor: "#fff",
          strokeWidth: 2,
        },
        label: {
          borderColor: op.profit > 0 ? "#00E396" : "#FF4560",
          offsetY: -5,
          style: {
            color: "#fff",
            background: op.profit > 0 ? "#00E396" : "#FF4560",
            fontSize: "10px",
            fontWeight: "bold",
          },
          text: op.profit > 0 ? "✅ EXIT" : "❌ EXIT",
        },
      })),
    ],
  };
};

/**
 * Format currency
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value);
};

/**
 * Format percentage
 */
export const formatPercent = (value) => {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
};
