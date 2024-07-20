import * as React from 'react';
import {useState, useEffect} from 'react'; 
import './App.css'
import 'bootstrap/dist/css/bootstrap.css'; 
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { Modal, Button } from 'react-bootstrap';
import { InfoCircle } from 'react-bootstrap-icons';

import ballTrackingData from "../../backend/ball_tracking.json"; 
import getBasicPitches from './api'; 
import AllPitches from './all_pitches/AllPitches'; 
import IndividualPitch from './individual_pitch/IndividualPitch';
        

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
]

export default function App() {
  const [basicPitchesData, setBasicPitchesData] = useState([]); 
  const [filteredData, setFilteredData] = useState([]); 
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  
  useEffect(() => {
    async function fetchData() {
      const resData = await getBasicPitches(); 
      setBasicPitchesData(resData); 
      setFilteredData(resData); 
    }  

    fetchData(); 
  }, []); 


  return (
    <div>
      <div className="header">
        <h1>
          Diamond Hands Dashboard
        </h1>
        <Button variant="secondary" onClick={handleShow} className="icon-button">
          <InfoCircle className="icon" size={20} />
          <span className="button-text">About</span>
        </Button>
      </div>
      

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>About the Data</Modal.Title>
        </Modal.Header>
        <Modal.Body> Add description about our project and the data here? ... </Modal.Body>
      </Modal>

      <br />
      
      <div className="gridAndFilters">
        <Tabs
          defaultActiveKey="allGames"
          id="justify-tab-example"
          className="mb-3"
          variant='pills'
          justify
        >
          <Tab eventKey="allGames" title="All Games/Overall">
            <AllPitches pitchesData={basicPitchesData} ballData={ballTrackingData} />
          </Tab>
          <Tab eventKey="pitch" title="Individual Pitch">
            <IndividualPitch pitchesData={basicPitchesData} />
          </Tab>
        </Tabs>

      </div>
    </div>
    
  );
}



