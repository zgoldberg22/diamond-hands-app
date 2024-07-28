import * as React from 'react';
import {useState, useEffect, useRef, useCallback} from 'react'; 
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import './individual-pitch.css'
import {Form, Button, ListGroup} from 'react-bootstrap';

// import ThreeDPlot from '/src/ThreeDPlot.jsx';
import FilterSystem from '../FilterSystem';
import {getContactPlot} from '../api'; 
import {getAllHits} from '../api';  
import ContactPlot from './ContactPlot';

const columns = [
   { field: 'hiteventId', headerName: 'Hit Event ID', width: 'auto' },
   { field: 'result', headerName: 'Result', width: 'auto' },
   { field: 'pitchspeed_mph', headerName: 'Pitch Speed (mph)', width: 'auto' },
   { field: 'pitchspin_rpm', headerName: 'Pitch Spin (rpm)', width: 'auto' },
   { field: 'hitspeed_mph', headerName: 'Hit Speed (mph)', width: 'auto' },
   { field: 'hitspin_rpm', headerName: 'Hit Spin (rpm)', width: 'auto' }
 ];

 const defaultColDef = {
   width: 150,
   resizable: true
 };

export default function IndividualPitch() {
   const [selectedEventId, setSelectedEventId] = useState(null);
   const gridRef = useRef(null);
   const [hitIntoPlays, setHitIntoPlays] = useState([]); 
   const [zChange, setZChange] = useState(0);
   const [batSpeed, setBatSpeed] = useState(0);
   const [plotData, setPlotData] = useState(null); 
   const [predictedData, setPredictedData] = useState(null); 

  const handleChange = (event) => {
   console.log(event.target.value)
    setZChange(parseFloat(event.target.value));
  };

    useEffect(() => {
      async function fetchData() {
        const resData = await getAllHits(); 
      //   let filtered = resData.filter(row => row.result === "HitIntoPlay"); 
        setHitIntoPlays(resData); 
      }  
  
      fetchData(); 
    }, []); 

   const onSelectionChanged = useCallback(() => {
      async function fetchData(args) {
         const resData = await getContactPlot(args); 
         setPlotData(resData); 
         setPredictedData(resData); 
         console.log(resData)
       }  
      
      const selectedRows = gridRef.current.api.getSelectedRows();
      if (selectedRows.length > 0) {
        const eventId = selectedRows[0].hiteventId;
        setSelectedEventId(eventId);
        fetchData({"hiteventId": eventId}); 
        setBatSpeed(0); 
        setZChange(0); 
      } else {
        setSelectedEventId(null);
      }
    }, []);

    const handlePredictSubmit = () => {
      async function fetchData(args) {
         const resData = await getContactPlot(args); 
         setPredictedData(resData); 
     }  

      fetchData({
         "hiteventId": selectedEventId, 
         "change_in_bat_speed": batSpeed, 
         "change_in_z": zChange
      }); 
   }

   return (
      <div className="individual-pitch">
         {/* <FilterSystem gridRef={gridRef} setBasicPitchesData={setBasicPitchesData} data={allPitchData} setAppFilters={setFilters} /> */}
         <br/>

         <h2>
            <strong>Select a Pitch to Analyze</strong>
         </h2>
         <p></p>
        
         {hitIntoPlays && 
         <div className="ag-theme-quartz" style={{ height: 600, width: '100%' }}>
            <AgGridReact
               ref={gridRef}
               rowData={hitIntoPlays}
               columnDefs={columns}
               pagination={true}
               defaultColDef={{
                  ...defaultColDef
               }}
               rowSelection="single"  
               onSelectionChanged={onSelectionChanged}
            />
         </div>
         }

         <br/>

         {selectedEventId &&
            <div>
               <h2>
                  <strong>Contact Quality Analysis of Hit</strong>
               </h2>

            </div> 
         }

         {/* Change the prediction parameters */}
         <div className="graphs">
         {selectedEventId && plotData &&
            <div className="actual">
               <h4 style={{paddingBottom: "10px"}}>
                  <strong>True Values</strong>
               </h4>
               <ListGroup className="actual-values">
                  <ListGroup.Item>True Hit Speed: {plotData["label"]["Actual Hit Speed"]}</ListGroup.Item>
                  <ListGroup.Item>True Vertical Exit Angle: {plotData["label"]["Actual Vertical Exit Angle"]}</ListGroup.Item>
                  <ListGroup.Item>Horizontal Exit Angle: {plotData["label"]["Horizontal Exit Angle"]}</ListGroup.Item>
                  <ListGroup.Item>Old Hit Probability: {plotData["label"]["Old Hit Probability"]}</ListGroup.Item>
                  <ListGroup.Item>Outs on Play: {plotData["label"]["Outs on Play"]}</ListGroup.Item>
               </ListGroup>
               <p></p>
               {/* <p></p>
               <p>True Vertical Exit Angle: {plotData["label"]["Actual Vertical Exit Angle"]}</p>
               <p>Horizontal Exit Angle: {plotData["label"]["Horizontal Exit Angle"]}</p>
               <p>Old Hit Probability: {plotData["label"]["Old Hit Probability"]}</p>
               <p>Outs on Play: {plotData["label"]["Outs on Play"]}</p> */}
               {/* plot based on selected hitEventId */}
               <ContactPlot plotData={plotData || {}} />

               <hr></hr>
            </div>
         }

         {selectedEventId && predictedData &&
            <div className="predicted">
               <h4 style={{paddingBottom: "10px"}}>
                  <strong>Predicted Values</strong>
               </h4>
               <ListGroup>
                  <ListGroup.Item>Predicted Hit Speed: {predictedData["label"]["Predicted Hit Speed"]}</ListGroup.Item>
                  <ListGroup.Item>Predicted Vertical Exit Angle: {predictedData["label"]["Predicted Vertical Exit Angle"]}</ListGroup.Item>
                  <ListGroup.Item>Horizontal Exit Angle: {predictedData["label"]["Horizontal Exit Angle"]}</ListGroup.Item>
                  <ListGroup.Item>Old Hit Probability: {plotData["label"]["Old Hit Probability"]}</ListGroup.Item>
                  <ListGroup.Item>Outs on Play: {plotData["label"]["Outs on Play"]}</ListGroup.Item>
               </ListGroup>
               <p></p>
              
               <ContactPlot plotData={predictedData || {}} />

               <hr></hr>

               <p><strong>Change Values to Predict Results: </strong></p>
               <Form.Group className="predicted-measures">
                  <Form.Group className="ball-slider">
                     <Form.Label>Z-Position of Ball: {zChange.toFixed(3)}</Form.Label>
                     <Form.Range
                        className="ballRange"
                        min={-0.1}
                        max={0.1}
                        step={0.001}
                        value={zChange}
                        onChange={handleChange}
                     />
                  </Form.Group>

                  <Form.Group className="bat-speed-slider">
                     <Form.Label>Bat Speed: {batSpeed.toFixed(3)}</Form.Label>
                     <Form.Range
                        className="bat-speed"
                        min={-20}
                        max={20}
                        step={0.5}
                        value={batSpeed}
                        onChange={(e) => setBatSpeed(parseFloat(e.target.value))}
                     />
                  </Form.Group>
                  <Button variant="secondary" type="submit" onClick={handlePredictSubmit}>
                     Predict Launch Angle
                  </Button>

               </Form.Group>
            </div>
         }

            {/* Plot to predict */}

       {/* }  */}
       </div> 

         
      </div>
   )

}