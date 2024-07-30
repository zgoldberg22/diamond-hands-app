import * as React from 'react';
import {useState, useEffect} from 'react'; 
import './App.css'
import 'bootstrap/dist/css/bootstrap.css'; 
// import Tab from 'react-bootstrap/Tab';
// import Tabs from 'react-bootstrap/Tabs';
import { Modal, Button, Nav } from 'react-bootstrap';
import { InfoCircle } from 'react-bootstrap-icons';
import AllPitches from './all_pitches/AllPitches'; 
import IndividualPitch from './individual_pitch/IndividualPitch';
import {Routes, Route, NavLink, Outlet} from 'react-router-dom'; 

export default function App() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <div className="app">
      {/* define header above Routes */}
      <div className="header">
        <h1>
          <strong>DiamondMetrics</strong>: A Pitch & Swing Analysis Tool
        </h1>
        <Button variant="secondary" onClick={handleShow} className="icon-button">
          <InfoCircle className="icon" size={20} />
          <span className="button-text">About</span>
        </Button>
      </div>
      
      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title><strong>About Diamond Metrics</strong></Modal.Title>
        </Modal.Header>
        <Modal.Body> 
          <p>The <strong>DiamondMetrics</strong> tool provides users with a high-level, visual understanding of the pitching patterns from this four-game series as well a more detailed understanding of what determines quality contact and how simple swing adjustments can improve the batter’s outcome at bat. </p>

          <hr/>

          <p>DiamondMetrics has two pages: <em>All Pitches Analysis</em> and <em>Contact Point Analysis</em>:</p> 
          
          <p>The <em>All Pitches Analysis</em> page uses heatmaps and scatter plots to display pitch locations, allowing us to examine how different pitch locations might influence batting outcomes. These visualizations serve as a starting point for deeper analysis.</p>

          <p>The <em>Contact Point Analysis</em> page takes a deeper look at swings where contact was made. The user can select a pitch to view two columns: the “True Values” and the “Predicted Values.” The “True Values” column uses Statcast data to predict the probability that the player’s contact with the ball will produce a hit given the hit speed and exit angles. The “Predicted Values” column uses machine learning to allow the user to manipulate the ball’s vertical position, bat speed, and bat plane to instantly see how these adjustments would affect the predicted launch angle, launch velocity, and hit probability. </p>

          <hr/>

          <p>Using the provided data from a Phillies affiliate minor league four-game series, outside data from Statcast, and machine learning, we created a tool that we hope helps users visualize patterns from the game, and more importantly, adjust their swings for better outcomes.</p>
        </Modal.Body>
        <Modal.Footer style={{justifyItems: 'left', display: 'inline', fontSize: '14px'}}>
          <div>
            <p style={{marginBottom: '3px'}}><strong>Diamond Hands Team - WISD Hackathon 2024:</strong></p>
            <ul>
              <li>Alessandra Puccio</li>
              <li>Stephanie Little</li>
              <li>Zoe Goldberg</li>
              <li><em>Mentor: Michelle Rock</em></li>
            </ul>
          </div>
        </Modal.Footer>
      </Modal>

      <div className="gridAndFilters">
        <Nav variant="pills">
          <Nav.Item>
            <Nav.Link as={NavLink} to="/" end>
              All Pitches Analysis
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link as={NavLink} to="/individual_pitch">
              Contact Point Analysis
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </div>

      <Routes>
         <Route path="/" element={<AllPitches />} />
         <Route path="/individual_pitch" element={<IndividualPitch />} />
      </Routes>
    </div>
    
  );
}
