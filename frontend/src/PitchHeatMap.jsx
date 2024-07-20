import React, {useState, useEffect} from 'react';
import Plot from 'react-plotly.js';
import {getHeatmapData} from './api';

// Heatmap function
const PitchHeatMap = ({ basicPitches, ballTracking, result }) => {
  const [res, setRes] = useState(result); 
  const [heatmapData, setHeatmapData] = useState({}); 

  useEffect(() => {
    async function fetchData() {
      const resData = await getHeatmapData(result); 
      console.log(resData);

      setHeatmapData(resData); 
    }  

    fetchData(); 
  }, [basicPitches, result])

  // const data = [{
  //   type: 'heatmap',
  //   x: x_range,
  //   y: z_range,
  //   z: f,
  //   colorscale: 'YlOrRd',
  //   colorbar: { title: 'Density' }
  // }];

  // const layout = {
  //   title: `Pitch Location Heatmap for ${result}`,
  //   xaxis: { title: 'Left-Right', range: [-2, 2], dtick: 0.5 },
  //   yaxis: { title: 'Up-Down', range: [1, 4], dtick: 0.5 },
  //   shapes: [{
  //     type: 'rect',
  //     x0: -0.7083, x1: 0.7083,
  //     y0: 1.5, y1: 3.5,
  //     line: { color: 'Black' },
  //     fillcolor: 'rgba(0,0,0,0)'
  //   }],
  //   width: 600,
  //   height: 600
  // };

  return (
  <div> 
    {heatmapData && <Plot data={heatmapData["data"]} layout={heatmapData["layout"]} />}
  </div> );
};

export default PitchHeatMap;