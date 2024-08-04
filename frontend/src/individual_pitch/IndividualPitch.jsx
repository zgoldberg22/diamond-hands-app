import {useState, useEffect, useRef, useCallback} from 'react'; 
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import './individual-pitch.css'
import {Form, Button, ListGroup, OverlayTrigger, Tooltip, Modal, Spinner} from 'react-bootstrap';
import {FaArrowDown, FaInfoCircle} from 'react-icons/fa'; 

import {getContactPlot} from '../api'; 
import {getAllHits} from '../api';  
import ContactPlot from './ContactPlot';
import BaseballLoader from '../BaseballLoader';

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
   const [params, setParams] = useState({
      hiteventId: selectedEventId, 
      change_in_bat_speed: 0, 
      change_in_z: 0, 
      change_in_bat_plane: 0
   }); 
   const [plotData, setPlotData] = useState(null); 
   const [predictedData, setPredictedData] = useState(null); 
   const [isLoading, setIsLoading] = useState(true);
   const [isLoadingPred, setIsLoadingPred] = useState(false); 

   const [showModal, setShowModal] = useState(false);
   const handleShow = () => setShowModal(true);


  const handleChange = (paramName, value) => {
    setParams(prevState => ({...prevState, [paramName]: value}))
  }

    useEffect(() => {
      async function fetchData() {
        const resData = await getAllHits(); 
        setHitIntoPlays(resData); 
      }  
  
      fetchData(); 
    }, []); 

   const onSelectionChanged = useCallback(() => {
      async function fetchData(args) {
         setIsLoading(true); 
         try {
            const resData = await getContactPlot(args); 
            setPlotData(resData); 
            setPredictedData(resData); 
         } catch (error) {
            console.error("Error fetching plot data:", error);
         } finally {
            setIsLoading(false);
         }
       }  
      
      const selectedRows = gridRef.current.api.getSelectedRows();
      if (selectedRows.length > 0) {
        const eventId = selectedRows[0].hiteventId;
        setSelectedEventId(eventId);
        fetchData({"hiteventId": eventId}); 
        setParams({
         "hiteventId": eventId, 
         "change_in_bat_speed": 0, 
         "change_in_z": 0, 
         "change_in_bat_plane": 0
      }); 
      } else {
        setSelectedEventId(null);
      }
    }, []);

    const handlePredictSubmit = () => {
      async function fetchData(args) {
         setIsLoadingPred(true); 
         try {
            const resData = await getContactPlot(args); 
            setPredictedData(resData);  
         } catch (error) {
            console.error("Error fetching plot data:", error);
         } finally {
            setIsLoadingPred(false);
         }
     }  

      fetchData(params); 
   }
  
   const toggleVisible = () => { 
      const scrolled = document.documentElement.scrollTop; 
   }

   const scrollToGraph = () =>{ 
      window.scrollTo({ 
        top: 600,  
        behavior: 'smooth'
      }); 
    }

    window.addEventListener('scroll', toggleVisible);

   return (
      <div className="individual-pitch">
         <br/>
            <h2>
               <strong>Select a Pitch to Analyze</strong>
            </h2>
            {selectedEventId &&
               <Button variant="success" onClick={scrollToGraph} disabled={isLoading && plotData && predictedData}> 
                  {(isLoading && plotData && predictedData ) ? 
                     <span> <Spinner size="sm" style={{ marginRight: '5px'}} /> Loading</span>
                  :
                  <span><FaArrowDown style={{display: 'inline', marginRight: '5px'}} /> See Results</span>
                  }
               </Button> 
            }
        
         <p></p>
        
         {hitIntoPlays && 
         <div className="ag-theme-quartz" style={{ height: 500, width: '100%' }}>
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
            <div className="contact-heading">
               <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip id="button-tooltip">About  Analysis</Tooltip>}
               >
                  <Button variant="none" style={{borderRadius: '10px', marginBottom: '12px'}} onClick={handleShow}>
                     <FaInfoCircle style={{width: '25px', height: '25px', marginBottom: '2px'}} />
                  </Button>
               </OverlayTrigger>

               <h2>
                  <strong>Contact Quality Analysis of Hit</strong>
               </h2>
            </div> 
          } 

         {selectedEventId && isLoading ? <BaseballLoader /> : (
            <div className="graphs">
            {plotData &&
               <div className="actual">
                  <h4 style={{paddingBottom: "10px"}} >
                     <strong>True Values</strong>
                  </h4>
                  <div className="actual-values">
                     <ListGroup  >
                        <ListGroup.Item>True Hit Velocity: {plotData["contactPoint"]["label"]["Actual Hit Speed"]}</ListGroup.Item>
                        <ListGroup.Item>True Vertical Exit Angle: {plotData["contactPoint"]["label"]["Actual Vertical Exit Angle"]}</ListGroup.Item>
                        <ListGroup.Item>Horizontal Exit Angle: {plotData["contactPoint"]["label"]["Horizontal Exit Angle"]}</ListGroup.Item>
                        <ListGroup.Item>Hit Probability: {plotData["contactPoint"]["label"]["Old Hit Probability"]}</ListGroup.Item>
                        <ListGroup.Item>Outs on Play: {plotData["contactPoint"]["label"]["Outs on Play"]}</ListGroup.Item>
                     </ListGroup>
                     <p></p>
                     <p><strong>True Values at Contact Point: </strong></p>
                    
                     <div className="og-values">
                        <p>Ball Z-Position (ft): {plotData["contactPoint"]["label"]["Original Bat Position"]}</p>
                        <p>Bat Speed (ft/s): {plotData["contactPoint"]["label"]["Original Bat Speed"]}</p>
                        <p>Bat Approach Angle (deg): {plotData["contactPoint"]["label"]["Original Bat Angle"]}</p>
                     </div>
                    
                  </div>

                  <hr></hr>

                  <div className="actualPlots" >
                     <ContactPlot plotData={plotData["contactPoint"] || {}} />
                     <hr></hr>
                     <ContactPlot plotData={plotData["speedVsAngle"] || {}}/>
                     <hr></hr>
                     <ContactPlot plotData={plotData["launchSpeedDist"] || {}}/>
                     <hr></hr>
                     <ContactPlot plotData={plotData["launchAngleDist"] || {}}/>
                  </div>

               </div>
            }

            {predictedData &&
               <div className="predicted">
                  <h4 style={{paddingBottom: "10px"}}>
                     <strong>Predicted Values</strong>
                  </h4>
                  
                  <ListGroup>
                     <ListGroup.Item>Predicted Hit Velocity: {predictedData["contactPoint"]["label"]["Predicted Hit Speed"]}</ListGroup.Item>
                     <ListGroup.Item>Predicted Vertical Exit Angle: {predictedData["contactPoint"]["label"]["Predicted Vertical Exit Angle"]}</ListGroup.Item>
                     <ListGroup.Item>Horizontal Exit Angle: {predictedData["contactPoint"]["label"]["Horizontal Exit Angle"]}</ListGroup.Item>
                     <ListGroup.Item>Predicted Hit Probability: {predictedData["contactPoint"]["label"]["New Hit Probability"]}</ListGroup.Item>
                     <ListGroup.Item>Outs on Play: {plotData["contactPoint"]["label"]["Outs on Play"]}</ListGroup.Item>
                  </ListGroup>
                  <p></p>

                  <p><strong>Change Values to Predict Launch Angle & Velocity: </strong></p>
                  <Form.Group className="predicted-measures">
                     <Form.Group className="ball-slider">
                        <Form.Label>Change in Ball Z-Position (ft): {params.change_in_z}</Form.Label>
                        <Form.Range
                           className="ballRange"
                           min={-0.1}
                           max={0.1}
                           step={0.001}
                           value={params.change_in_z}
                           onChange={(e) => handleChange("change_in_z", e.target.value)}
                        />
                     </Form.Group>

                     <Form.Group className="bat-speed-slider">
                        <Form.Label>Change in Bat Speed (ft/s): {params.change_in_bat_speed}</Form.Label>
                        <Form.Range
                           className="bat-speed"
                           min={-20}
                           max={20}
                           step={0.5}
                           value={params.change_in_bat_speed}
                           onChange={(e) => handleChange("change_in_bat_speed", e.target.value)}
                        />
                     </Form.Group>

                     <Form.Group className="bat-plane-slider">
                        <Form.Label>Change in Bat Approach (deg): {params.change_in_bat_plane}</Form.Label>
                        <Form.Range
                           className="bat-plane"
                           min={-30}
                           max={30}
                           step={0.5}
                           value={params.change_in_bat_plane}
                           onChange={(e) => handleChange("change_in_bat_plane", e.target.value)}
                        />
                     </Form.Group>

                     <Button variant="secondary" type="submit" onClick={handlePredictSubmit} disabled={params.change_in_bat_plane == 0 && params.change_in_z == 0 && params.change_in_bat_speed == 0}>
                        Predict Launch Angle
                     </Button>

                  </Form.Group>

                  <hr></hr>
                  {isLoadingPred ? 
                     <BaseballLoader />
                  :
                  <div className="predictedPlots" >
                     <ContactPlot plotData={predictedData["contactPoint"] || {}} />

                     <hr></hr>

                     <ContactPlot plotData={predictedData["speedVsAngle"] || {}}/>

                     <hr></hr>

                     <ContactPlot plotData={predictedData["launchSpeedDist"] || {}}/>

                     <hr></hr>

                     <ContactPlot plotData={predictedData["launchAngleDist"] || {}}/>

                  </div>
                  }
                  
               </div>
            }
       </div> 
       )}

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
         <Modal.Header closeButton>
            <Modal.Title><strong>About Contact Analysis</strong></Modal.Title>
         </Modal.Header>
         <Modal.Body>
            <p>Our tool aims to analyze and improve the quality of a baseball swing by examining the characteristics that lead to successful contact with the ball. The motivation behind this tool is to help batters enhance their swings to increase the likelihood of achieving hits rather than outs.</p>

            <p><strong>True Values (Left Side):</strong> </p>
            <ul>
               <li>Displays swing and hit information, including the ball exit vector for the actual pitch.</li>
               <li>Shows the final hit probability based on the true data.</li>
               <li>Graphs depict the true and predicted exit velocity and launch angle, providing insights into the accuracy of our models.</li>
            </ul>
            <p><strong>Predicted Values (Right Side):</strong> </p>
            <ul>
               <li>Allows users to experiment with changing certain swing characteristics to see how these adjustments affect the likelihood of a hit.</li>
               <li>Users can modify:</li>
               <ul>
                  <li><em>Bat Approach Angle</em>: The angle of the bat's velocity vector relative to the xy-plane at the point of contact.</li>
                  <li><em>Bat Speed</em>: The speed of the bat at the point where contact is made.</li>
                  <li><em>Z Position</em>: The vertical position of the bat, relative to the ball at contact.</li>
               </ul>
            </ul>

            <p>Once the parameters are adjusted, the tool recalculates the relevant features and passes them into our models to generate new predictions for exit velocity and launch angle. These predictions are then used to determine the corresponding <em>hit probability</em> using Statcast data. The change in hit probability from the original swing (left) to the modified swing (right) illustrates the impact of the adjustments on contact quality.</p>

            <hr></hr>

            <p><strong>Parameter explanations:</strong> </p>
               <ul>
                  <li>Bat approach angle: The angle (in degrees) of the bat's velocity vector at the point of contact, measured relative to the horizontal plane. A positive angle indicates an upward trajectory, while a negative angle signifies a downward path.</li>
                  <li>Bat speed: The velocity of the point on the bat where it makes contact with the ball at the moment of impact.</li>
                  <li>Z Position: The vertical position of the bat relative to the center of the ball. Increasing the z position shifts the whole bat up,and decreasing it shifts it down.</li>
               </ul>
         </Modal.Body>
      </Modal>
         
      </div>
   )

}