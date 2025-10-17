const parseCandleStickData = (data) => {
  try {
    /*The xy format accepts  x: date, y: O,H,L,C */
    return data
      .map((chart) => {
        if (chart.open) {
          const { open, high, low, close, time } = chart;
          return {
            x: time,
            y: [open, high, low, close],
          };
        }
        return null;
      })
      .filter((item) => item !== null); // Remove undefined/null values
  } catch (error) {
    console.error("Error parsing candlestick data:", error);
    return [];
  }
};

export default parseCandleStickData;
