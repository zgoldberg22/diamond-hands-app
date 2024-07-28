import React, { useState, useEffect, useRef } from 'react';
import Plot from 'react-plotly.js';

const PitchScatterPlot = ({ scatterPlot }) => {
   return (
      <div style={{border: '3px solid rgb(237, 237, 237)', alignItems: 'center', justifyItems: 'center'}}>
         {scatterPlot && <Plot data={scatterPlot["data"]} layout={scatterPlot["layout"]} />}
        
      </div>
   );
}

export default PitchScatterPlot; 