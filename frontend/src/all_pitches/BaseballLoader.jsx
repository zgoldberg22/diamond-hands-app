import React from 'react';
import './BaseballLoader.css';
import { FaBaseballBall } from "react-icons/fa";

const BaseballLoader = () => {
  return (
    <div className="loader-container">
      {/* <div className="baseball-loader"></div> */}
      <FaBaseballBall className="baseballIcon" />
    </div>
  );
};

export default BaseballLoader;
