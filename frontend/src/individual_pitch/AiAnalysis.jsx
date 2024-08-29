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
    True Hit Velocity: ${data["Actual Hit Speed"]} mph
    True Vertical Exit Angle: ${data["Actual Vertical Exit Angle"]}°
    Horizontal Exit Angle: ${data["Horizontal Exit Angle"]}°
    True Hit Probability: ${data[["Old Hit Probability"]]}
    Outs on Play: ${data["Outs on Play"]}
  `;

   const generateAnalysis = async () => {
      const prompt = `
        You are a generative AI assistant producing helpful analysis for DiamondMetrics, a contact quality analysis tool that baseball coaches use to analyze and improve their players' swings and ball contact.
        Your task is to generate 2-3 sentences describing the contact quality given a set of metrics about the contact between the bat and ball on a given swing. 
        The analysis paragraph should replicate the structure and tone of the examples below. Do not use the hit probability to justify your explanations.
  
        Here are the adjustable parameters of the swing:
        - Z Position: The vertical position of the bat relative to the center of the ball, shifting the entire bat up or down.
        - Bat Approach Angle: The angle of the bat's velocity vector relative to the xy-plane at the point of contact.
        - Bat Speed: The speed of the bat at the point where contact is made.
  
        Z Position and Bat Approach angle are used to predict the launch angle. Optimal line drive launch angle is 17-20 degrees. Launch angles between 8 and 32 degrees are also considered strong. Do not mention these launch angles in your analyses, but use them when determining how the swing can be improved. 
  
        EXAMPLES:
  
        DATA:
        Hit Velocity: 86.16 mph
        Vertical Exit Angle: -25.94°
        Horizontal Exit Angle: -71.51°
        True Hit Probability: 0.00
        Outs on Play: 0.00
  
        ANALYSIS PARAGRAPH:
        This is very poor quality contact. With a low hit velocity of 86.16 mph and a steep negative vertical exit angle of -25.94°, the ball is likely hitting the ground quickly, possibly resulting in a weak ground ball or a foul tip. To improve contact quality, the user could try raising the Z position of the bat to align it better with the center of the ball and increasing the bat approach angle to create a more positive launch angle. These changes might help achieve more solid contact and increase the likelihood of a successful hit.
  
        DATA:
        True Hit Velocity: 106.27 mph
        True Vertical Exit Angle: 27.44°
        Horizontal Exit Angle: 6.91°
        True Hit Probability: 0.98
        Outs on Play: 0.00
  
        ANALYSIS PARAGRAPH:
        This is very high quality contact. With a high predicted hit velocity of 106.27 mph and a vertical exit angle of 27.44°, the ball is likely traveling far and at an optimal trajectory, leading to a high hit probability of 0.98. To maintain or improve this level of contact quality, a slight increase in bat speed could further maximize the power and distance of the hit, potentially resulting in an extra-base hit.
  
        YOUR TASK:
  
        DATA
        ${promptData}
  
        ANALYSIS PARAGRAPH:
        `;
  
      try {
        const result = await model.generateContent(prompt);
  
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
               <p>{analysis || ''}</p> 
            </div>
         }
      </div>
    );

}