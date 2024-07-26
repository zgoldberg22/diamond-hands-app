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
  
  // useEffect(() => {
  //   async function fetchData() {
  //     const resData = await getBasicPitches(); 
  //     setBasicPitchesData(resData); 
  //     setFilteredData(resData); 
  //   }  

  //   fetchData(); 
  // }, []); 


  return (
    <div className="app">
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
          id="tab"
          className="tabs"
          variant='pills'
          justify
        >
          <Tab eventKey="allGames" title="All Games/Overall">
            <AllPitches />
          </Tab>
          <Tab eventKey="pitch" title="Individual Pitch">
            <IndividualPitch pitchesData={basicPitchesData} />
          </Tab>
        </Tabs>

      </div>
    </div>
    
  );
}
