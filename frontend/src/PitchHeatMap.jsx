import React, {useState, useEffect} from 'react';
import Plot from 'react-plotly.js';
import {getHeatmapData} from './api';
import getBasicPitches from './api'

// Heatmap function
const PitchHeatMap = ({ basicPitches, ballTracking, result }) => {
  const [res, setRes] = useState(result); 
  const [heatmapData, setHeatmapData] = useState({}); 

  // to get heatmap for all data to start
  useEffect(() => {
    async function fetchData() {
      const resData = await setHeatmapData(""); 
      setHeatmapData(resData); 
    }  

    fetchData(); 
  }, [basicPitches])

  useEffect(() => {
    async function fetchData() {
      const resData = await getHeatmapData(result); 
      
      setHeatmapData(resData); 
    }  
    fetchData(); 
  }, [basicPitches, result])

  return (
  <div> 
    {heatmapData && <Plot data={heatmapData["data"]} layout={heatmapData["layout"]} />}
  </div> );
};

export default PitchHeatMap;