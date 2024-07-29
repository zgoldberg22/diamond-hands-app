import React, { useState, useEffect, useRef } from 'react';
import Plot from 'react-plotly.js';

const ContactPlot = ({plotData}) => {
   
   return (
      <div>
         {plotData && 
            <Plot data={plotData["data"]} layout={plotData["layout"]} />
         }
      </div>
   )
}

export default ContactPlot; 