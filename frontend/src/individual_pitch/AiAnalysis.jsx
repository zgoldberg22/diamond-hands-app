import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './individual-pitch.css'
// const { GoogleGenerativeAI } = require("@google/generative-ai");

export default function AiAnalysis({data}) {
   const [analysis, setAnalysis] = useState('');
   const GOOGLE_API_KEY = "AIzaSyAP0CRZEPeFMnM6FxqjzTjhEVVQix5SXK8"
   
   const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
   const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
   
   const promptData = `
   Hit Velocity: ${data["Actual Hit Speed"]} mph
   Vertical Exit Angle: ${data["Actual Vertical Exit Angle"]}°
   Hit Probability: ${data[["Old Hit Probability"]]}
   Outs on Play: ${data["Outs on Play"]}
  `;

   const generateAnalysis = async () => {
      const prompt = `
      You are a generative AI assistant providing helpful, concise, and actionable analysis for DiamondMetrics, a contact quality analysis tool that baseball coaches use to evaluate and improve their players' swings and ball contact. 
      Your objective is to analyze swing data, offer insights into contact quality, and suggest adjustments to maximize hit probability.

      Context:
      DiamondMetrics uses two key metrics—Hit Velocity and Vertical Exit Angle—to compare a player's swing to similar swings from MLB StatCast data, enabling predictions about hit probability. 
      Coaches can adjust Ball Z-Position, Bat Speed, and Bat Approach Angle to optimize swing outcomes.

      Task:
      Your task is to generate 2-3 sentences for each swing:
      - describe the contact quality given the hit velocity, vertical exit angle, and hit probability
      - list bullet points about how the user should change each of the adjustable parameters (bat Z position, bat speed, and bat approach angle) to improve or maintain the hit probability and contact quality. explain how this change improves the contact quality.
      Use dashes as bullet points.
      Use plaintext in each bullet point. Do not format the text.
      Do not use the hit probability to justify your explanations.
      Do not assert the result of the hit. Only postulate.

      Adjustable Swing Parameters:
      - Change in Bat Z Position (ft): Adjusts the vertical position of the bat relative to the center of the ball, moving the bat up or down. Increasing the bat Z position lowers the launch angle. Decreasing the bat Z position increases the launch angle. 
      - Change in Bat Speed (ft/s): Modifies the speed of the bat at the moment of contact. Increasing bat speed, assuming other parameters remain unchanged, will typically result in the ball traveling further along a similar trajectory.
      - Change in Bat Approach Angle (deg): Alters the angle of the bat's velocity vector relative to the xy-plane at contact. Increasing the bat approach angle typically increases launch angle. Decreasing lowers the launch angle.

      How Parameters Affect Hit Probability:
      - The bat Z position has the largest impact on changing hit probability. 
      - Optimal line drive launch angles range from 17-20 degrees, with angles between 8 and 32 degrees considered strong. Use these guidelines when suggesting adjustments, but do not mention these specific angles in your analyses.
      - Typically, a fly ball or pop up has a launch angle greater than twenty five (25) degrees.

      EXAMPLE:

      DATA:
      Hit Velocity: 86.16 mph
      Vertical Exit Angle: -25.94°
      Hit Probability: 0.00
      Outs on Play: 0.00

      ANALYSIS PARAGRAPH:
      This is very poor quality contact. With a low hit velocity of 86.16 mph and a steep negative vertical exit angle of -25.94°, the ball is likely hitting the ground quickly, possibly resulting in a weak ground ball or a foul tip. 
      To improve contact quality: 
      - Try decreasing the Z position of the bat to align it better with the center of the ball 
      - Increasing the bat approach angle to create a more positive launch angle. 

      YOUR TURN:
      DATA:
      ${promptData}
      `;
  
      try {
        const result = await model.generateContent(prompt);

      //   let modifiedString = result.split(":"); 
  
        setAnalysis(result.response.text);
      } catch (error) {
        console.error('Error generating analysis:', error);
        setAnalysis('Failed to generate analysis.');
      }
    };

    useEffect(() => {
      generateAnalysis();
    }, [data]);

    return (
      <div className='ai-generate'>
         {analysis && 
            <div className="terminal-box">
               <p>{analysis}</p> 
               {/* {analysis.split(":")[1].split("-")} */}
            </div>
         }
      </div>
    );

}