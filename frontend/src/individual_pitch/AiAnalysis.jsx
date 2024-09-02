import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './individual-pitch.css'

export default function AiAnalysis({data}) {
   const [analysis, setAnalysis] = useState('');
   const GOOGLE_API_KEY = "AIzaSyCm7ae8Dr5Exl2ct4dLuAX_J9RjjUfcjrI"
   
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

      Your task is to generate 2-3 sentences for each swing:
      - describe the contact quality given the hit velocity, vertical exit angle, and hit probability
      - list bullet points about how the user should change each of the adjustable parameters (bat Z position, bat speed, and bat approach angle) to improve or maintain the hit probability and contact quality. Explain how this change improves the contact quality.
      
      Steps to complete task:
      1. In one sentence, describe the contact quality given the hit velocity and vertical exit angle
      2. Identify if the vertical launch angle is within the optimal range of 8 and 32 degrees
        a. If the vertical launch angle is less than 8 degrees, suggest the user to decrease bat z position and/or increase bat approach angle.
        b. If the vertical launch angle is greater than 32 degrees, suggest the user to increase bat z position and/or decrease  bat approach angle.
        c. If the vertical launch angle is between 8 and 32 degrees, suggest the user to increase the bat speed.
      
      Use dashes as bullet points.
      Use plaintext in each bullet point. Do not format the text.
      Do not use the hit probability to justify your explanations.
      Do not assert the result of the hit. Only postulate.
      Emulate the tone and format of the example below. 

      EXAMPLE ANALYSIS PARAGRAPH:
      This is very poor quality contact. With a low hit velocity of 87.0 mph and a steep negative vertical exit angle of -46.93°, the ball is likely hitting the ground quickly, possibly resulting in a weak ground ball or a foul tip. 
      To improve contact quality: 
      - Try decreasing the Z position of the bat to align it better with the center of the ball which increases the launch angle.
      - Increasing the bat approach angle to create a more positive launch angle. 

      YOUR TURN:
      DATA:
      ${promptData}
      
      ANALYSIS PARAGRAPH:`;
  
      try {
        const result = await model.generateContent(prompt);
        setAnalysis(result.response.text);
      } catch (error) {
        console.error('Error generating analysis:', error);
        setAnalysis('Failed to generate analysis.');
      }
    };

    const splitResponseText = (text) => {
      let splitText = text.split("- ").slice(1); 
      return splitText; 
    }

    useEffect(() => {
      generateAnalysis();
    }, [data]);

    return (
      <div className='ai-generate'>
         {analysis && 
            <div className="terminal-box">
               <p>{analysis.split("- ")[0]}</p> 
               <ul>{splitResponseText(analysis).map((point, idx) => (
                  <li>{point}</li>
               ))}</ul>
            </div>
         }
      </div>
    );

}