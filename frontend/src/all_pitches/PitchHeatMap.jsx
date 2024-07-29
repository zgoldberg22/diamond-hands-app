import Plot from 'react-plotly.js';

const PitchHeatMap = ({ heatmapData }) => {
  return (
    <div style={{border: '3px solid rgb(237, 237, 237)', alignItems: 'center', justifyItems: 'center'}}> 
      {heatmapData && <Plot data={heatmapData["data"]} layout={heatmapData["layout"]} />}
    </div> );
}

export default PitchHeatMap;