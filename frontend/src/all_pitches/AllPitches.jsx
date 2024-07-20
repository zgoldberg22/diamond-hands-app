import * as React from 'react';
import {useState, useRef, useEffect, useCallback} from 'react'; 

import FilterSystem from '../FilterSystem';
import PitchHeatMap from "../PitchHeatMap";

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

   useEffect(() => {
      setBasicPitchesData(pitchesData); 
      setAllPitchData(pitchesData); 
      setBallTrackingData(ballData); 
   }, [pitchesData, ballData]);

   return (
      <div>
         <FilterSystem gridRef={null} setBasicPitchesData={setBasicPitchesData} data={allPitchData} setAppFilters={setFilters} />

         {basicPitchesData && ballTrackingData &&
            <PitchHeatMap 
               basicPitches={basicPitchesData} 
               ballTracking={ballTrackingData} 
               result={filters.result} 
            /> 
         }

      </div>
   )
}