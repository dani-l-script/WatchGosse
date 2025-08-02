
// src/components/DataViewer.js
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchData } from '../features/slices/chartsSlice';

const CandleCharts = () => {
    const dispatch = useDispatch();
    const data = useSelector((state) => state.data);
    const status = useSelector((state) => state.status);
  
    useEffect(() => {
      dispatch(fetchData());
    }, [dispatch]);
  
    if (status === 'loading') {
      return <p>Loading...</p>;
    }
  
    if (status === 'failed') {
      return <p>Error: Unable to fetch data</p>;
    }
  
    return (
      <div>
        <h2>Data Viewer</h2>
        <ul>
          SUcces1!!!
        </ul>
      </div>
    );
  };
  
  export default CandleCharts;