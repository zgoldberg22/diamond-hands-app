import React, {useState, useEffect} from 'react';
import Plot from 'react-plotly.js';

const PitchHeatMap = ({ heatmapData }) => {
  return (
    <div> 
      {heatmapData && <Plot data={heatmapData["data"]} layout={heatmapData["layout"]} />}
    </div> );
};

export default PitchHeatMap;