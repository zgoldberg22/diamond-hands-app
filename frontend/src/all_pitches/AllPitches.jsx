import * as React from 'react';
import {useState, useRef, useEffect, useCallback} from 'react'; 
// import '../filter-system.css'; 
import './all-pitches.css';


import FilterSystem from '../FilterSystem';
import PitchResultPlot from '../PitchScatterPlot';
import PitchHeatMap from "../PitchHeatMap";
import PitchScatterPlot from '../PitchScatterPlot';
import {getAllPitchGraphs} from '../api';
import BaseballLoader from './BaseballLoader';

export default function AllPitches() {
   const [basicPitchesData, setBasicPitchesData] = useState([]); 
   // const [ballTrackingData, setBallTrackingData] = useState([]); 
   // const [allPitchData, setAllPitchData] = useState([]); 
   const [filters, setFilters] = useState({
      games: "",
      result: "", //Strike, Ball or HitIntoPlay
      action: "", // Foul, FoulTip, Called
      swing: null, //hitEventId != null
      outsPlay: "", 
      teamId: "", 
      playerId: "",
     });

   const [scatterPlotData, setScatterPlotData] = useState({}); 
   const [heatmapData, setHeatmapData] = useState({}); 
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      async function fetchData() {
         setIsLoading(true); 
         try {
            const resData = await getAllPitchGraphs(""); 
            setScatterPlotData(resData["scatter_plot"]);
            setHeatmapData(resData["heatmap"]);  
         } catch (error) {
            console.error("Error fetching initial data:", error);
         } finally {
            setIsLoading(false);
         }
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
        
        {isLoading ? (
         <BaseballLoader />
        ) : (
         <div>
            <FilterSystem gridRef={null} setBasicPitchesData={setBasicPitchesData} data={[]} setAppFilters={setFilters} />
            <div className="graphs">
               <PitchHeatMap 
                  heatmapData={heatmapData} 
               /> 
         
               <PitchScatterPlot 
                  scatterPlot={scatterPlotData}
               />
            </div>
         </div>
        )
      }
         

      </div>
   )
}