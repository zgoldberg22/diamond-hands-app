import * as React from 'react';
import {useState, useEffect, useRef, useCallback} from 'react'; 
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

import ThreeDPlot from '/src/ThreeDPlot.jsx';
import FilterSystem from '../FilterSystem';

const columns = [
   { field: 'gameId', headerName: 'Game ID', width: 150 },
   { field: 'pitcheventId', headerName: 'Pitch ID', width: 150 },
   { field: 'result', headerName: 'Result', width: 150 },
   { field: 'action', headerName: 'Action', width: 150 },
   { field: 'pitchtype', headerName: 'Pitch Type', width: 150 },
   { field: 'pitchspeed_mph', headerName: 'Pitch Speed (mph)', width: 150 },
   { field: 'pitchspeed_kph', headerName: 'Pitch Speed (kph)', width: 150 },
   { field: 'pitchspeed_mps', headerName: 'Pitch Speed (mps)', width: 150 },
   { field: 'pitchspin_rpm', headerName: 'Pitch Spin (rpm)', width: 150 },
   { field: 'hitspeed_mph', headerName: 'Hit Speed (mph)', width: 150 },
   { field: 'hitspeed_kph', headerName: 'Hit Speed (kph)', width: 150 },
   { field: 'hitspeed_mps', headerName: 'Hit Speed (mps)', width: 150 },
   { field: 'hitspin_rpm', headerName: 'Hit Spin (rpm)', width: 150 },
   { field: 'team1', headerName: 'Team 1', width: 150 },
   { field: 'team2', headerName: 'Team 2', width: 150 },
   // { field: 'runsinnings', headerName: 'Runs Innings', width: 150 },
   { field: 'runsplay', headerName: 'Runs Play', width: 150 },
   { field: 'outsinning', headerName: 'Outs Inning', width: 150 },
   { field: 'outsplay', headerName: 'Outs Play', width: 150},
   { field: 'ballsplateAppearance', headerName: 'Balls Plate Appearance', width: 150 },
   { field: 'ballsplay', headerName: 'Balls Play', width: 150 },
   { field: 'strikesplateAppearance', headerName: 'Strikes Plate Appearance', width: 150 },
   { field: 'strikesplay', headerName: 'Strikes Play', width: 150 },
   { field: 'hiteventId', headerName: 'Hit Event ID', width: 150 }
 ];
 
 const games = [
   {id: "4a2da1a0-f7ac-48f4-9e87-b6dd1d867bfb"}, 
   {id: "cc0c12f1-54f4-4325-a97f-009d86ee1359"},
   {id: "88638515-1fa8-497a-bbea-2a85b9926e10"},
   {id: "89a50db1-aa4e-47cc-9c65-083aed19d845"},
 ];

 const defaultColDef = {
   width: 150,
   resizable: true
 };

export default function IndividualPitch({pitchesData}) {
   const [selectedEventId, setSelectedEventId] = useState(null);
   const gridRef = useRef(null);
   const [basicPitchesData, setBasicPitchesData] = useState([]); 
   const [allPitchData, setAllPitchData] = useState([]); 
   const [filteredData, setFilteredData] = useState([]); 
   const [filters, setFilters] = useState({
      games: [],
      pitchTypes: [],
      selectedStrikes: null,
      selectedBalls: null,
      pitchSpeed: 100.00,
      outsInning: null,
      outsPlay: null,
      result: null
    });  

   useEffect(() => {
      setBasicPitchesData(pitchesData); 
      setAllPitchData(pitchesData); 
   }, [pitchesData]);

   const onSelectionChanged = useCallback(() => {
      const selectedRows = gridRef.current.api.getSelectedRows();
      if (selectedRows.length > 0) {
        const eventId = selectedRows[0].pitcheventId;
        console.log(eventId)
        setSelectedEventId(eventId);
      } else {
        setSelectedEventId(null);
      }
    }, []);


   return (
      <div>
         <FilterSystem gridRef={gridRef} setBasicPitchesData={setBasicPitchesData} data={allPitchData} setAppFilters={setFilters} />

         {basicPitchesData && 
         <div className="ag-theme-quartz" style={{ height: 600, width: '100%' }}>
            <AgGridReact
               ref={gridRef}
               rowData={basicPitchesData}
               columnDefs={columns}
               pagination={true}
               defaultColDef={{
                  ...defaultColDef, 
                  // filter: true, 
                  // floatingFilter: true
               }}
               rowSelection="single"  
               onSelectionChanged={onSelectionChanged}
            />
         </div>
         }

         {selectedEventId && <ThreeDPlot key={selectedEventId} eventId={selectedEventId} />}
      </div>
   )

}