import { configureStore } from '@reduxjs/toolkit';
import chartsSlice from '../app/features/slices/chartsSlice';

const store = configureStore({
  reducer: {
    dataCharts: chartsSlice,
    // ... other reducers
  },
});

export default store;