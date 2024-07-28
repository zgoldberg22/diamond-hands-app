import * as React from 'react';
import {useState, useEffect} from 'react'; 
import './App.css'
import 'bootstrap/dist/css/bootstrap.css'; 
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { Modal, Button } from 'react-bootstrap';
import { InfoCircle } from 'react-bootstrap-icons';
import AllPitches from './all_pitches/AllPitches'; 
import IndividualPitch from './individual_pitch/IndividualPitch';

export default function App() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <div className="app">
      <div className="header">
        <h1>
          <strong>Diamond Hands Stats</strong>
        </h1>
        <Button variant="secondary" onClick={handleShow} className="icon-button">
          <InfoCircle className="icon" size={20} />
          <span className="button-text">About</span>
        </Button>
      </div>
      
      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>About the Data</Modal.Title>
        </Modal.Header>
        <Modal.Body> Add description about our project and the data here? ... </Modal.Body>
      </Modal>
      
      <div className="gridAndFilters">
        <Tabs
          defaultActiveKey="allGames"
          id="tab"
          className="tabs"
          variant='pills'
          justify
        >
          <Tab eventKey="allGames" title="All Pitches Analysis">
            <AllPitches />
          </Tab>
          <Tab eventKey="pitch" title="Contact Point Analysis">
            <IndividualPitch />
          </Tab>
        </Tabs>

      </div>
    </div>
    
  );
}
