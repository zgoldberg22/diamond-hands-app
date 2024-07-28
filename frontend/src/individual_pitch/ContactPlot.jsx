import React, { useState, useEffect, useRef } from 'react';
import Plot from 'react-plotly.js';
import { getContactPlot } from '../api';

const ContactPlot = ({plotData}) => {
   // const [plotData, setPlotData] = useState({}); 

//    useEffect(() => {
//     console.log(plotData) 
//   }, [plotData]); 
   
   return (
      <div>
         {plotData && 
            <Plot data={plotData["data"]} layout={plotData["layout"]} />
         }
      </div>
   )
}

export default ContactPlot; 