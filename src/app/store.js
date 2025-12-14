import { configureStore } from '@reduxjs/toolkit';
import chartsSlice from '../app/features/slices/chartsSlice';
import chartsRealtimeSlice from '../app/features/slices/chartsRealtimeSlice';

const store = configureStore({
  reducer: {
    dataCharts: chartsSlice,
    dataChartsRealtime: chartsRealtimeSlice,
    // ... other reducers
  },
});

export default store;