import React, { useState, useEffect } from 'react';
import './filter-system.css'
import { Form, FloatingLabel, ToggleButton, ToggleButtonGroup, Button, OverlayTrigger, Tooltip, Dropdown, DropdownButton, DropdownMenu} from 'react-bootstrap';
import { FaFilter } from "react-icons/fa";
import { ArrowCounterclockwise } from 'react-bootstrap-icons';
// ArrowClockwise

const games = [
   {id: "All Games", value: ""},
   {id: "12345641", value: "12345641"}, 
   {id: "12345645", value: "12345645"},
   {id: "12345636", value: "12345636"},
   {id: "12345634", value: "12345634"}
 ]; 

const teamIds = [ {id: "All Teams", value: ""}, {id: 90068, value: "90068"}, {id: 63813, value: "63813"}]
const personByTeam = {
   90068: ["", 360906992, 719146721, 485007791, 451871192, 223971350, 459722179, 290569727, 558675411, 172804761, 432216743, 474808052, 545569723, 765710437, 654287703], 
   63813: ["", 568527038, 590082479, 412098649, 797957728, 805688901, 174158975, 849653732, 352830460, 618024297, 854238128, 617522563, 505414610, 518481551, 686425745, 719210239, 797796542, 563942271]
}
const allPersonIds = ["", 360906992, 719146721, 485007791, 451871192, 223971350, 459722179, 290569727, 558675411, 172804761, 432216743, 474808052, 545569723, 765710437, 654287703, 568527038, 590082479, 412098649, 797957728, 805688901, 174158975, 849653732, 352830460, 618024297, 854238128, 617522563, 505414610, 518481551, 686425745, 719210239, 797796542, 563942271]

const FilterSystem = ({ gridRef, setBasicPitchesData, data, setAppFilters }) => {
  const [filters, setFilters] = useState({
   gameid: "",
   result: "", //Strike, Ball or HitIntoPlay
   action: "", // Foul, FoulTip, Called
   swing: null, //hitEventId != null
   outsplay: "", 
   teamId: "", 
   personId: ""
  });
  const [peopleOnTeam, setPeopleOnTeam] = useState(allPersonIds); 

  const updateFilter = (filterName, value) => {
   if(filterName === 'swing'){
      setFilters(prevFilters => ({...prevFilters, [filterName]: true, "action": ""}))
   }
   else if(filterName === 'teamId' && value !== "" ) {
      // ensure correct players are showing when certain team is selected
      setFilters(prevFilters => ({ ...prevFilters, [filterName]: value, "swing": null, "personId": "" }));
      setPeopleOnTeam(personByTeam[value]);       
   } else {
      setFilters(prevFilters => ({ ...prevFilters, [filterName]: value, "swing": null }));
   }
  };

  const filterData = (allData) => {
    return allData.filter(row => {
      const gameMatch = filters.gameid === "" || filters.gameid === row.gameid;
      const resultMatch = filters.result === "" || filters.result === row.result;
      const actionMatch = filters.action === "" || filters.action === row.action; 
      const swingMatch = filters.action == (row.hiteventId !== null); 
      const outsPlayMatch = filters.outsplay === "" || filters.outsplay === row.outsplay;
      
      return gameMatch && resultMatch && actionMatch && swingMatch && outsPlayMatch;
    });
  };

  //can possibly delete this? 
  useEffect(() => {
    const filteredData = filterData(data);

    setBasicPitchesData(filteredData); 
    setAppFilters(filters); 
  }, [filters]);

  useEffect(() => {
   const filteredData = filterData(data);

   setBasicPitchesData(filteredData); 
   setAppFilters(filters); 
 }, [filters.teamId]);

  const resetFilters = () => {
    setFilters({
      gameid: "",
      result: "", //Strike, Ball or HitIntoPlay
      action: "", // Foul, FoulTip, Called
      swing: null, //hitEventId != null
      outsplay: "", 
      teamId: "", 
      playerId: ""
    });

    setPeopleOnTeam(allPersonIds); 
  };

  return (
    <div className="filter-system">
      <br />
      {/* <h3>Filters</h3> */}
      <Form className='filter-row'>
         <Form.Group className="filter-item">
         <FloatingLabel label="Select a Game" id="gameSelect">
            <Form.Control as="select" onChange={(e) => updateFilter('gameid', e.target.value)} value={filters.gameid}>
               {games.map(game => (
                  <option key={game.id} value={game.value}>{game.id}</option>
               ))}
            </Form.Control>
         </FloatingLabel>
         </Form.Group>

         <Form.Group className='filter-item'>
         {/* <Form.Label htmlFor="result">Result:</Form.Label> */}
         <FloatingLabel label="Hit Result">
            <Form.Control as="select" name="result" id="result" onChange={(e) => updateFilter('result', e.target.value)} value={filters.result}>
               <option value="">All Pitches</option>
               <option value="HitIntoPlay">Hit Into Play</option>
               <option value="Strike">Strike</option>
               <option value="Ball">Ball</option>
            </Form.Control>
         </FloatingLabel>
         </Form.Group>

         {filters.result === "Strike" && (
            <ToggleButtonGroup className="strike-button-group" type="radio" name="options" defaultValue="">
               <ToggleButton id="allStrikes" value="" variant="secondary" onChange={(e) => updateFilter('action', e.target.value)}>
                  All
               </ToggleButton>
               <ToggleButton id="strikeFoul" value="Foul" variant="secondary" onChange={(e) => updateFilter('action', e.target.value)}>
                  Foul
               </ToggleButton>
               <ToggleButton id="strikeFoulTip" value="FoulTip" variant="secondary" onChange={(e) => updateFilter('action', e.target.value)}>
                  FoulTip
               </ToggleButton>
               <ToggleButton id="strikeCalled" value="Called" variant="secondary" onChange={(e) => updateFilter('action', e.target.value)}>
                  Called
               </ToggleButton>
               <ToggleButton id="strikeCalled" value="Swing" variant="secondary" onChange={(e) => updateFilter('swing', true)}>
                  Swing
               </ToggleButton>
            </ToggleButtonGroup>
         )}


         {filters.result === "HitIntoPlay" && (
            <Form.Group className="hitsFilters">
               <ToggleButtonGroup className="hits-button-group" type="radio" name="options" defaultValue="">
                  <ToggleButton id="allHits" value="" variant="secondary" onChange={(e) => setFilters((prev) => ({...prev, outsplay: ""}))}>
                     All
                  </ToggleButton>
                  <ToggleButton id="outsInPlay" value="1" variant="secondary" onChange={(e) => updateFilter('outsplay', 1)}>
                     Out in Play
                  </ToggleButton>
                  <ToggleButton id="noOuts" value="0" variant="secondary" onChange={(e) => updateFilter('outsplay', 0)}>
                     No Out
                  </ToggleButton>
                  
               </ToggleButtonGroup>
               <FloatingLabel label="Select Team">
                  <Form.Control className="teamSelect" as="select" value={filters.teamId} onChange={(e) => updateFilter('teamId', e.target.value)}>
                     {teamIds.map(team => (
                        <option key={team.id} value={team.value}>{team.id}</option>
                     ))}

                  </Form.Control>
               </FloatingLabel>

               <FloatingLabel label="Player on Team(s)">
                  <Form.Control className="teamSelect" as="select" value={filters.personId} onChange={(e) => updateFilter('personId', e.target.value)}>
                     {peopleOnTeam.map(person => (
                        <option key={person} value={person}>{person === "" ? "All Players" : person}</option>
                     ))}
                  </Form.Control>
               </FloatingLabel>
            </Form.Group> 
         )}

         <OverlayTrigger
            placement="top"
            overlay={<Tooltip id="button-tooltip">Reset Filters</Tooltip>}
         >
            <Button className="resetBtn" variant="secondary" onClick={resetFilters}><ArrowCounterclockwise /></Button>
         </OverlayTrigger>
      
    </Form>
    </div>
  );
};

export default FilterSystem;
