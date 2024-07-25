import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import {getPitchScatterPlot} from './api';


const PitchScatterPlot = ({ basicPitches, ballTracking, filters }) => {
   const [scatterPlotData, setScatterPlotData] = useState({}); 

   useEffect(() => {
      async function fetchData() {
         const resData = await getPitchScatterPlot(""); 
         setScatterPlotData(resData); 
      }

      fetchData(); 
   }, [basicPitches])

   useEffect(() => {
      async function fetchData() {
         const resData = await getPitchScatterPlot(filters); 
         setScatterPlotData(resData); 
      }

      fetchData(); 
   }, [basicPitches, filters]); 
   
   return (
      <div>
         {scatterPlotData && <Plot data={scatterPlotData["data"]} layout={scatterPlotData["layout"]} />}
      </div>
   );

}

export default PitchScatterPlot; 