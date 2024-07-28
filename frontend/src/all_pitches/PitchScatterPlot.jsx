import React, { useState, useEffect, useRef } from 'react';
import Plot from 'react-plotly.js';

const PitchScatterPlot = ({ scatterPlot }) => {
   return (
      <div>
         {scatterPlot && <Plot data={scatterPlot["data"]} layout={scatterPlot["layout"]} />}
        
      </div>
   );
}

export default PitchScatterPlot; 