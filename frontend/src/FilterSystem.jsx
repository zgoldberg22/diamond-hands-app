import React, { useState, useEffect } from 'react';
import './filter-system.css'
import { Form } from 'react-bootstrap';

const games = [
   {id: "All Games", value: ""},
   {id: "12345641", value: "12345641"}, 
   {id: "12345645", value: "12345645"},
   {id: "12345636", value: "12345636"},
   {id: "12345634", value: "12345634"}
 ]; 

const teamIds = [90068, 63813]; 
const personIds = [617522563, 518481551, 686425745, 223971350, 563942271, 172804761, 432216743, 590082479, 485007791, 854238128, 719210239, 545569723, 568527038, 797796542, 459722179, 805688901, 505414610, 558675411, 654287703, 451871192, 412098649, 797957728, 719146721, 849653732, 765710437, 618024297, 290569727, 360906992, 474808052, 352830460, 174158975]; 

const FilterSystem = ({ gridRef, setBasicPitchesData, data, setAppFilters }) => {
  const [filters, setFilters] = useState({
   games: "",
   result: "", //Strike, Ball or HitIntoPlay
   action: "", // Foul, FoulTip, Called
   swing: null, //hitEventId != null
   outsPlay: "", 
   teamId: "", 
   playerId: "",
   // pitchTypes: [],
   // selectedStrikes: null,
   // selectedBalls: null,
   // pitchSpeed: 100.00,
  });

  const updateFilter = (filterName, value) => {
   if(filterName === 'swing'){
      setFilters(prevFilters => ({...prevFilters, [filterName]: true, "action": ""}))
   } else {
      setFilters(prevFilters => ({ ...prevFilters, [filterName]: value, "swing": null }));
   }

  };

  const filterData = (allData) => {
    return allData.filter(row => {
      const gameMatch = filters.games === "" || filters.games === row.gameId;
      const resultMatch = filters.result === "" || filters.result === row.result;
      const actionMatch = filters.action === "" || filters.action === row.action; 
      const swingMatch = filters.action == (row.hiteventId !== null);  //this may be wrong
      const outsPlayMatch = filters.outsPlay === "" || filters.outsPlay === row.outsplay;
      // const teamIdMatch = 
      

      return gameMatch && resultMatch && actionMatch && swingMatch && outsPlayMatch;
    });
  };

  useEffect(() => {
    const filteredData = filterData(data);

    setBasicPitchesData(filteredData); // setting data to change heatmap
    setAppFilters(filters); 
  }, [filters]);

  const resetFilters = () => {
    setFilters({
      games: "",
      result: "", //Strike, Ball or HitIntoPlay
      action: "", // Foul, FoulTip, Called
      swing: false, //hitEventId != null
      outsPlay: "", 
      teamId: "", 
      playerId: "",
      // pitchTypes: [],
      // selectedStrikes: null,
      // selectedBalls: null,
      // pitchSpeed: 100.00,
    });
  };

  return (
    <div className="filter-system">
      <h3>Filters</h3>
      <Form className='filter-row'>
      <Form.Group className="filter-item">
        <Form.Label>Game:</Form.Label>
        <Form.Control as="select" onChange={(e) => updateFilter('games', e.target.value)} value={filters.games}>
          {games.map(game => (
            <option key={game.id} value={game.value}>{game.id}</option>
          ))}
        </Form.Control>
      </Form.Group>

      <Form.Group className='filter-item'>
        <Form.Label htmlFor="result">Result:</Form.Label>
        <Form.Control as="select" name="result" id="result" onChange={(e) => updateFilter('result', e.target.value)} value={filters.result}>
          <option value="">Result</option>
          <option value="HitIntoPlay">Hit Into Play</option>
          <option value="Strike">Strike</option>
          <option value="Ball">Ball</option>
        </Form.Control>
      </Form.Group>

      {filters.result === "Strike" && (
        <Form.Group className='filter-radio-buttons'>
          <Form.Check 
            inline 
            defaultChecked
            type="radio" 
            label="All" 
            name="strikeOptions" 
            value="" 
            onChange={(e) => updateFilter('action', e.target.value)} 
          />
          <Form.Check 
            inline 
            type="radio" 
            label="Foul" 
            name="strikeOptions" 
            value="Foul" 
            onChange={(e) => updateFilter('action', e.target.value)} 
          />
          <Form.Check 
            inline 
            type="radio" 
            label="FoulTip" 
            name="strikeOptions" 
            value="FoulTip" 
            onChange={(e) => updateFilter('action', e.target.value)} 
          />
          <Form.Check 
            inline 
            type="radio" 
            label="Called" 
            name="strikeOptions" 
            value="Called" 
            onChange={(e) => updateFilter('action', e.target.value)} 
          />
          <Form.Check 
            inline 
            type="radio" 
            label="Swing" 
            name="strikeOptions" 
            value="Swing" 
            onChange={(e) => updateFilter('swing', true)} 
          />
        </Form.Group>
      )}


      {filters.result === "HitIntoPlay" && (
        <Form.Group className='filter-radio-buttons'>
          <Form.Check 
            inline 
            defaultChecked
            type="radio" 
            label="All" 
            name="hitIntoPlayOptions" 
            value="" 
            onChange={(e) => updateFilter('result', 'HitIntoPlay')} 
          />
          <Form.Check 
            inline 
            type="radio" 
            label="Out in Play" 
            name="hitIntoPlayOptions" 
            value="outsPlay" 
            onChange={(e) => updateFilter('outsPlay', 1)} 
          />
          <Form.Check 
            inline 
            type="radio" 
            label="No Out" 
            name="hitIntoPlayOptions" 
            value="outsPlay" 
            onChange={(e) => updateFilter('outsPlay', 0)} 
          />
          {/* get player and team ID */}
        </Form.Group>
      )}
    </Form>


      <div className='filter-row'>

         {/* <div className="filter-item"> 
            <label>Game:</label>
            <select onChange={(e) => updateFilter('games', e.target.value)}>
               {games.map(game => <option key={game.id} value={game.value}>{game.id}</option>)}
            </select>
         </div>

         <div className='filter-item'>
            <label for="result">Result:</label> 
            <select name="result" id="result" default="" onChange={(e) => updateFilter('result', e.target.value)}>
               <option value="">Result</option>
               <option value="HitIntoPlay">Hit Into Play</option>
               <option value="Strike">Strike</option>
               <option value="Ball">Ball</option>
            </select>
         </div>

         {filters.result === "Strike" &&
            <div className='filter-radio-buttons'>
                <label>
                  <input type="radio" name="All" value="" /> All
               </label>
               <label>
                  <input type="radio" name="Foul" value="Foul" onChange={(e) => updateFilter('action', e.target.value)} /> Foul
               </label>
               <label>
                  <input type="radio" name="FoulTip" value="FoulTip" onChange={(e) => updateFilter('action', e.target.value)} /> FoulTip
               </label>
               <label>
                  <input type="radio" name="Called" value="Called" onChange={(e) => updateFilter('action', e.target.value)} /> Called
               </label>
               <label>
                  <input type="radio" name="Swing" value="Swing" onChange={(e) => updateFilter('swing', e.target.value)} /> Swing
               </label>
            </div>
         } */}

         {/* <div className='filter-item'> 
            <label>Pitch Types:</label>
            <select onChange={(e) => updateFilter('pitchTypes', Array.from(e.target.selectedOptions, option => option.value))}>
               <option value="Sinker">Sinker</option>
               <option value="Slider">Slider</option>
               <option value="FourSeamFastball">Four Seam Fastball</option>
               <option value="Changeup">Changeup</option>
               <option value="Curveball">Curveball</option>
               <option value="Cutter">Cutter</option>
            </select>
         </div> */}

         {/* <div className='filter-item'>
            <label>Pitch Speed (mph): [70, {filters.pitchSpeed}]</label>
            <input 
               type="range" 
               min="70" 
               max="100" 
               value={filters.pitchSpeed}
               onChange={(e) => updateFilter('pitchSpeed', Number(e.target.value))}
            />
          </div> */}

         {/* <div className='filter-item'>
            <label for="countFilter">Count:</label>
            <div className="countFilter" id="countFilter">
               <input type="number" id="balls" 
                  value={filters.selectedBalls || ''}
                  onChange={(e) => updateFilter('selectedBalls', e.target.value ? Number(e.target.value) : null)} />
               <p>-</p>
               <input type="number" id="strikes" 
                  value={filters.selectedStrikes || ''}
                  onChange={(e) => updateFilter('selectedStrikes', e.target.value ? Number(e.target.value) : null)} />
               </div>
         </div> */}
      </div>

      {/* Add more filter inputs as needed */}

      <button onClick={resetFilters}>Reset Filters</button>
    </div>
  );
};

export default FilterSystem;
