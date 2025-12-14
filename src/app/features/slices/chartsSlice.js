import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import parseCandleStickData from "../../utils/dataParserToCandleStick";

const apiUrl = import.meta.env.VITE_CANDLE_CHARTS;

export const fetchData = createAsyncThunk("data/fetchData", async () => {
  const response = await axios.get(apiUrl);
  return {
    charts: response.data.charts || [],
    operations: response.data.traderLogOperations || [],
  };
});

const chartsSlice = createSlice({
  name: "charts",
  initialState: {
    data: [],
    operations: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = parseCandleStickData(action.payload.charts);
        state.operations = action.payload.operations;
        console.log("📊 Chart Data:", state.data.length, "points");
        console.log("💼 Operations:", state.operations.length, "operations");
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default chartsSlice.reducer;
