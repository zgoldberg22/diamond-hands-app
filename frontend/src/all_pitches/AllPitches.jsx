import * as React from 'react';
import {useState, useEffect} from 'react'; 
import './all-pitches.css';
import { Button } from 'react-bootstrap';
import FilterSystem from './FilterSystem';
import PitchHeatMap from "./PitchHeatMap";
import PitchScatterPlot from './PitchScatterPlot';
import {getAllPitchGraphs} from '../api';
import BaseballLoader from '../BaseballLoader';
import {FaArrowDown} from 'react-icons/fa'; 

export default function AllPitches() {
   const [filters, setFilters] = useState({
      games: "",
      result: "Ball", //Strike, Ball or HitIntoPlay
      action: "", // Foul, FoulTip, Called
      swing: null, //hitEventId != null
      outsPlay: "", 
      teamId: "", 
      playerId: "",
     });

   const [graphData, setGraphData] = useState({})
   const [isLoading, setIsLoading] = useState(false);
   const [generatedInitial, setGeneratedInitial] = useState(false); 

   useEffect(() => {
      async function fetchData() {
         try {
            const resData = await getAllPitchGraphs(filters); 
            setGraphData(resData); 
         } catch (error) {
            console.error("Error fetching initial data:", error);
         } finally {
            setIsLoading(false);
         }
      }

      if(generatedInitial) {
         fetchData(); 
      }
     
   }, [filters])

   async function fetchAllPitches() {
      setIsLoading(true); 
      try {
         const resData = await getAllPitchGraphs(filters); 
         setGraphData(resData); 
      } catch (error) {
         console.error("Error fetching initial data:", error);
      } finally {
         setIsLoading(false);
      }
   }

   const handleClick = () => {
      fetchAllPitches()
      setGeneratedInitial(true);
   }

   return (
      <div>
         <div>
            <br/>
            <h2>
               <strong>Analyze All Pitches</strong>
            </h2>
            <p>Sort pitches by result (HitIntoPlay, Strike, or Ball) and delve deeper into specific outcomes, such as whether a hit resulted in an out or if a strike was fouled, swinging, or called. These visualizations can help with understanding the relationship between pitch locations and outcomes.</p>
            <p><em>Note: We had to remove the "All" selection in the "Hit Results" filter due to a limited CPU with our deployment. Please wait a few seconds to see the results of the filters.</em></p>
            
            <div>
               {!generatedInitial &&
                <Button variant="secondary" onClick={handleClick}>
                  <span><FaArrowDown style={{display: 'inline', marginRight: '8px'}} />Generate Initial All Pitch Analysis</span>
               </Button>
               }
              
              {/* Only show filter system when everything is loaded initially */}
               {isLoading && graphData ? (
                     <BaseballLoader />
                  ) : (
                     <div>
                        {generatedInitial && 
                           <div>
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
                        }
                     </div>
                     
                  )}
            </div>
                
         </div>
        
      </div>
   )
}