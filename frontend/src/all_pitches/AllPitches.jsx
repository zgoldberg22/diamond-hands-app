import * as React from 'react';
import {useState, useEffect} from 'react'; 
import './all-pitches.css';

import FilterSystem from './FilterSystem';
import PitchHeatMap from "./PitchHeatMap";
import PitchScatterPlot from './PitchScatterPlot';
import {getAllPitchGraphs} from '../api';
import BaseballLoader from '../BaseballLoader';

export default function AllPitches() {
   const [filters, setFilters] = useState({
      games: "",
      result: "", //Strike, Ball or HitIntoPlay
      action: "", // Foul, FoulTip, Called
      swing: null, //hitEventId != null
      outsPlay: "", 
      teamId: "", 
      playerId: "",
     });

   // const [scatterPlotData, setScatterPlotData] = useState({}); 
   // const [heatmapData, setHeatmapData] = useState({}); 
   // const [trajData, setTrajData] = useState({}); 
   const [graphData, setGraphData] = useState({})
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      async function fetchData() {
         setIsLoading(true); 
         try {
            const resData = await getAllPitchGraphs(""); 
            setGraphData(resData); 
            // setScatterPlotData(resData["strike_zone_scatter"]);
            // setHeatmapData(resData["heatmap"]); 
            // setTrajData(resData["pitch_trajectories"]) 
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
         setGraphData(resData);
      }

      fetchData(); 
      
   }, [filters])

   return (
      <div>
        {isLoading && graphData ? (
         <BaseballLoader />
        ) : (
         <div>
            <br/>
               <h2>
                  <strong>Analyze All Pitches</strong>
               </h2>
               <p>Description about how any why...</p>
            <FilterSystem setAppFilters={setFilters} />
            <div className="graphs">
               <PitchHeatMap 
                  heatmapData={graphData["heatmap"]} 
               /> 
         
               <PitchScatterPlot 
                  scatterPlot={graphData["strike_zone_scatter"]}
               />
            </div>

            <div style={{marginTop: '10px'}}>
               <PitchScatterPlot scatterPlot={graphData["pitch_trajectories"]} />
            </div>
         </div>
        )
      }  
      </div>
   )
}