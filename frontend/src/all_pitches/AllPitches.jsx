import * as React from 'react';
import {useState, useRef, useEffect, useCallback} from 'react'; 
// import '../filter-system.css'; 
import './all-pitches.css'

import FilterSystem from '../FilterSystem';
import PitchResultPlot from '../PitchScatterPlot';
import PitchHeatMap from "../PitchHeatMap";
import PitchScatterPlot from '../PitchScatterPlot';
import {getAllPitchGraphs} from '../api';

const games = [
   {id: "12345641"}, 
   {id: "12345645"},
   {id: "12345636"},
   {id: "12345634"},
 ]; 

export default function AllPitches({pitchesData, ballData}) {
   const [basicPitchesData, setBasicPitchesData] = useState([]); 
   const [ballTrackingData, setBallTrackingData] = useState([]); 
   const [allPitchData, setAllPitchData] = useState([]); 
   const [filters, setFilters] = useState({
      games: [],
      pitchTypes: [],
      selectedStrikes: null,
      selectedBalls: null,
      pitchSpeed: 100.00,
      outsInning: null,
      outsPlay: null,
      result: ""
   });  

   const [scatterPlotData, setScatterPlotData] = useState({}); 
   const [heatmapData, setHeatmapData] = useState({}); 


   useEffect(() => {
      // setBasicPitchesData(pitchesData); 
      // setAllPitchData(pitchesData); 
      // setBallTrackingData(ballData); 

      async function fetchData() {
         const resData = await getAllPitchGraphs(""); 
         setScatterPlotData(resData["scatter_plot"]);
         setHeatmapData(resData["heatmap"]);  
      }

      fetchData(); 

   }, []);

   useEffect(() => {
      async function fetchData() {
         const resData = await getAllPitchGraphs(filters); 
         setScatterPlotData(resData["scatter_plot"]);
         setHeatmapData(resData["heatmap"]);  
      }

      fetchData(); 
      
   }, [filters])

   return (
      <div>
         <FilterSystem gridRef={null} setBasicPitchesData={setBasicPitchesData} data={allPitchData} setAppFilters={setFilters} />
         {/* <div className='filter-row'>
            <div className="filter-item"> 
               <label>Game:</label>
               <select onChange={(e) => updateFilter('games', Array.from(e.target.selectedOptions, option => option.value))}>
                  {games.map(game => <option key={game.id} value={game.id}>{game.id}</option>)}
               </select>
            </div>
         </div> */}
         <div className="graphs">
            {/* {basicPitchesData && ballTrackingData && */}
               <PitchHeatMap 
                  // basicPitches={basicPitchesData} 
                  // ballTracking={ballTrackingData} 
                  // filters={filters}
                  heatmapData={heatmapData} 
               /> 
            {/* } */}

            {/* {basicPitchesData && ballTrackingData &&  */}
               <PitchScatterPlot 
                  scatterPlot={scatterPlotData}
               />
            {/* } */}
         </div>

      </div>
   )
}