import React, { useState, useEffect, useCallback} from 'react';
import Plot from 'react-plotly.js';
import data from "../../backend/ball_tracking.json"

const squareSize = 3; // Size of the square
        const halfSize = squareSize / 2;
        const square = {
          x: [-halfSize, halfSize, halfSize, -halfSize, -halfSize],
          y: [-halfSize, -halfSize, halfSize, halfSize, -halfSize],
          z: [0, 0, 0, 0, 0],
          type: 'scatter3d',
          mode: 'lines',
          line: {
            color: 'rgb(0, 255, 0)',
            width: 6
          },
          name: 'Home Plate'
        };

const fieldDimensions = {
  pitchingRubber: [0, 60, 0],
  homePlate: [0, 0, 0],
  firstBase: [63.64, 63.64, 0],
  secondBase: [0, 127.28, 0],
  thirdBase: [-63.64, 63.64, 0],
  leftField: [-250, 250, 0],
  centerField: [0, 400, 0],
  rightField: [250, 250, 0]
};

const createFieldOutline = () => {
  const {pitchingRubber, homePlate, firstBase, secondBase, thirdBase, leftField, centerField, rightField} = fieldDimensions;
  
  return {
    type: 'scatter3d',
    mode: 'lines',
    name: 'Field Outline',
    x: [homePlate[0], thirdBase[0], secondBase[0], firstBase[0], homePlate[0], leftField[0], centerField[0], rightField[0], homePlate[0]],
    y: [homePlate[1], thirdBase[1], secondBase[1], firstBase[1], homePlate[1], leftField[1], centerField[1], rightField[1], homePlate[1]],
    z: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    line: {
      color: 'rgb(186, 186, 186)',
      width: 3
    }
  };
};
        
const createPitchingRubber = () => {
  return {
    type: 'scatter3d',
    mode: 'markers',
    name: 'Pitching Rubber',
    x: [fieldDimensions.pitchingRubber[0]],
    y: [fieldDimensions.pitchingRubber[1]],
    z: [fieldDimensions.pitchingRubber[2]],
    marker: {
      color: 'orange',
      size: 5,
      symbol: 'square'
    }
  };
};

export default function ThreeDPlot({eventId}) {
  const [plotData, setPlotData] = useState([]);
  const [xRange, setXRange] = useState(10);
  const [yRange, setYRange] = useState(10);
  const [zRange, setZRange] = useState(10);
  const fieldOutline = createFieldOutline();
  const pitchingRubber = createPitchingRubber();

  useEffect(() => {
    const theEventId = eventId; // replace with your desired eventId
    const filteredData = data.filter(item => item.eventId === theEventId);
    
    // Extract x, y, and z coordinates
    const x = filteredData.map(item => item.pos_x);
    setXRange([-10, Math.max(...x)*10]); 
    const y = filteredData.map(item => item.pos_y);
    setYRange([-10, Math.max(...y)]);
    const z = filteredData.map(item => item.pos_z);
    setZRange([-10, Math.max(...z)]);

    const times = filteredData.map(item => item.time);

    // Normalize time values to range 0-1
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const normalizedTimes = times.map(t => (t - minTime) / (maxTime - minTime));

    const colors = normalizedTimes.map(t => `rgb(${Math.floor(255 * t)}, 0, ${Math.floor(255 * (1-t))})`);

    // Update the plot data
    setPlotData([
      {
        x: x,
        y: y,
        z: z,
        type: 'scatter3d',
        mode: 'markers',
        marker: {
          size: 5,
          // color: 'rgb(255, 0, 0)',
          color: colors, 
          opacity: 0.8
        }, 
        text: times.map(t => `Time: ${t.toFixed(3)}`),
        name: 'Ball Path'
      }, 
      square, 
      fieldOutline, 
      pitchingRubber
    ]);
  }, [eventId]); // Empty dependency array means this effect runs once on mount

  // const onRelayout = useCallback((eventData) => {
  //   if (eventData['scene.camera']) {
  //     const camera = eventData['scene.camera'];
  //     console.log('Current camera view:', {
  //       eye: camera.eye,
  //       center: camera.center,
  //       up: camera.up
  //     });
  //   }
  // }, []);

  // useEffect(() => {

  // }, [xRange, yRange, zRange]);

  const updateAxisRange = (axis, value) => {
    const range = [-value, value];
    switch(axis) {
      case 'x':
        setXRange(range);
        break;
      case 'y':
        setYRange(range);
        break;
      case 'z':
        setZRange(range);
        break;
    }
  };

  return (
    <div>
      <Plot
        divId="ball-plot"
        data={plotData}
        layout={{
          width: 1200,
          height: 600,
          title: 'Plot of Baseball Pitch Path: ', 
          scene: {
            aspectmode: 'data', 
            camera: {
              eye: {x: 1, y: -2.5, z: 1},
              center: {x: 0.1, y: -0.25, z: 0.15},
              up: {x: 0, y: 0, z: 1}
            },
            // xaxis: {range: [-5, 100]},
            // yaxis: {range: [-5, 100]},
            // zaxis: {range: [-5, 100]}
            // xaxis: {autorange: true},
            // yaxis: {autorange: true},
            // zaxis: {autorange: true}
            xaxis: { range: [0, xRange], title: 'X Position' },
            yaxis: { range: [0, yRange], title: 'Y Position' },
            zaxis: { range: [0, zRange], title: 'Z Position' },
          }
        }}
        // onRelayout={onRelayout}
      />
      <p>{eventId}</p>

      {/* <div>
        <label>
          X-axis scale:
          <input
            type="range"
            min="-5"
            max="100"
            // value={xRange[1]}
            onChange={(e) => setXRange(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          Y-axis scale:
          <input
            type="range"
            min="-5"
            max="100"
            // value={yRange[1]}
            onChange={(e) => setYRange(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          Z-axis scale:
          <input
            type="range"
            min="-5"
            max="100"
            // value={zRange[1]}
            onChange={(e) => setZRange(e.target.value)}
          />
        </label>
      </div> */}
    </div>
  );
}
