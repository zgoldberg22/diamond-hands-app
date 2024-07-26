import React, { useState, useEffect, useRef } from 'react';
import Plot from 'react-plotly.js';

import {getPitchScatterPlot} from './api';


const PitchScatterPlot = ({ scatterPlot }) => {
   const [scatterPlotData, setScatterPlotData] = useState({}); 

   // useEffect(() => {
   //    async function fetchData() {
   //       const resData = await getPitchScatterPlot(""); 
   //       setScatterPlotData(resData); 
   //    }

   //    fetchData(); 
   // }, [basicPitches])

   // useEffect(() => {
   //    async function fetchData() {
   //       const resData = await getPitchScatterPlot(filters); 
   //       setScatterPlotData(resData); 
   //    }

   //    fetchData(); 
   // }, [basicPitches, filters]); 
   
   return (
      <div>
         {scatterPlot && <Plot data={scatterPlot["data"]} layout={scatterPlot["layout"]}  />}
        
      </div>
   );

}

export default PitchScatterPlot; 