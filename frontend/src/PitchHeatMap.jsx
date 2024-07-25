import React, {useState, useEffect} from 'react';
import Plot from 'react-plotly.js';
import {getHeatmapData} from './api';
import getBasicPitches from './api'

// Heatmap function
const PitchHeatMap = ({ basicPitches, ballTracking, filters }) => {
  const [filts, setFilts] = useState(filters); 
  const [heatmapData, setHeatmapData] = useState({}); 

  // to get heatmap for all data to start
  useEffect(() => {
    async function fetchData() {
      const resData = await getHeatmapData(""); 
      setHeatmapData(resData); 
    }  

    fetchData(); 
  }, [basicPitches])

  useEffect(() => {
    async function fetchData() {
      const filts = await getHeatmapData(filters); 
      setHeatmapData(filts); 
    }  
    fetchData(); 
  }, [basicPitches, filters])

  return (
  <div> 
    {heatmapData && <Plot data={heatmapData["data"]} layout={heatmapData["layout"]} />}
  </div> );
};

export default PitchHeatMap;