import React, { useState, useEffect } from 'react';
import './filter-system.css'

const FilterSystem = ({ gridRef, setBasicPitchesData, data, games, setAppFilters }) => {
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

  const updateFilter = (filterName, value) => {
    setFilters(prevFilters => ({ ...prevFilters, [filterName]: value }));
  };

  const filterData = (allData) => {
    return allData.filter(row => {
      const gameMatch = filters.games.length === 0 || filters.games.includes(row.gameId);
      const pitchTypeMatch = filters.pitchTypes.length === 0 || filters.pitchTypes.includes(row.pitchtype);
      const strikeMatch = filters.selectedStrikes === null || filters.selectedStrikes === (row.strikesplateAppearance + row.strikesplay);
      const ballsMatch = filters.selectedBalls === null || filters.selectedBalls === (row.ballsplateAppearance + row.ballsplay);
      const resultMatch = filters.result === null || filters.result === row.result;
      const pitchSpeedMatch = row.pitchspeed_mph >= 70 && row.pitchspeed_mph <= filters.pitchSpeed;
      const outsInningMatch = filters.outsInning === null || filters.outsInning === row.outsinning;
      const outsPlayMatch = filters.outsPlay === null || filters.outsPlay === row.outsplay;

      return gameMatch && pitchTypeMatch && strikeMatch && ballsMatch && resultMatch && pitchSpeedMatch && outsInningMatch && outsPlayMatch;
    });
  };

  useEffect(() => {
    const filteredData = filterData(data);
    setBasicPitchesData(filteredData);
    setAppFilters(filters); 
  }, [filters]);

  const resetFilters = () => {
    setFilters({
      games: [],
      pitchTypes: [],
      selectedStrikes: null,
      selectedBalls: null,
      pitchSpeed: 100.00,
      outsInning: null,
      outsPlay: null,
      result: null
    });
  };

  return (
    <div className="filter-system">
      <h3>Filters</h3>
      <div className='filter-row'>
      {/* <div className='filter-row'> */}
         <div className="filter-item"> 
            <label>Game:</label>
            <select multiple onChange={(e) => updateFilter('games', Array.from(e.target.selectedOptions, option => option.value))}>
               {games.map(game => <option key={game.id} value={game.id}>{game.id}</option>)}
            </select>
         </div>
      {/* </div> */}

      {/* <div className='filter-row'>  */}
         <div className='filter-item'>
            <label for="result">Result:</label> 
            <select name="result" id="result" onChange={(e) => updateFilter('result', e.target.value)}>
               <option value=''></option>
               <option value="HitIntoPlay">Hit Into Play</option>
               <option value="Strike">Strike</option>
               <option value="Ball">Ball</option>
               <option value="Pickoff">Pickoff</option>
            </select>
         </div>
      {/* </div> */}

      {/* <div className='filter-row'> */}
         <div className='filter-item'> 
            <label>Pitch Types:</label>
            <select multiple onChange={(e) => updateFilter('pitchTypes', Array.from(e.target.selectedOptions, option => option.value))}>
               <option value="Sinker">Sinker</option>
               <option value="Slider">Slider</option>
               <option value="FourSeamFastball">Four Seam Fastball</option>
               <option value="Changeup">Changeup</option>
               <option value="Curveball">Curveball</option>
               <option value="Cutter">Cutter</option>
            </select>
         </div>
      {/* </div> */}

      {/* <div className='filter-row'> */}
         <div className='filter-item'>
            <label>Pitch Speed (mph): [70, {filters.pitchSpeed}]</label>
            <input 
               type="range" 
               min="70" 
               max="100" 
               value={filters.pitchSpeed}
               onChange={(e) => updateFilter('pitchSpeed', Number(e.target.value))}
            />
          </div>
      {/* </div> */}

      {/* <div className='filter-row'> */}
         <div className='filter-item'>
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
         </div>
      {/* </div> */}
      </div>

      {/* Add more filter inputs as needed */}

      <button onClick={resetFilters}>Reset Filters</button>
    </div>
  );
};

export default FilterSystem;
