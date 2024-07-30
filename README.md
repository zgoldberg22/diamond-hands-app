# [DiamondMetrics: A Pitch & Swing Analysis Tool](https://diamond-hands-app.onrender.com/)
### About
The DiamondMetrics tool provides users with a high-level, visual understanding of the pitching patterns from this four-game series as well a more detailed understanding of what determines quality contact and how simple swing adjustments can improve the batter’s outcome at bat.

DiamondMetrics has two pages: All Pitches Analysis and Contact Point Analysis. The All Pitches Analysis page uses heatmaps and scatter plots to display pitch location and trajectories, allowing us to examine how different pitch locations might influence batting outcomes. These visualizations serve as a starting point for deeper analysis.

The Contact Point Analysis page takes a closer look at swings where contact was made. The user can select a pitch to view two columns: the “True Values” and the “Predicted Values.” The “True Values” column uses Statcast data to predict the probability that the player’s contact with the ball will produce a hit given the hit speed and exit angles. The “Predicted Values” column uses machine learning to allow the user to manipulate the ball’s vertical position, bat speed, and bat plane to instantly see how these adjustments would affect the predicted launch angle, launch velocity, and hit probability. 

Given player-identified data and more time, we would have loved to expand our contact quality analysis to make player-specific swing recommendations. With player-specific data, a coach would be able to experiment with different aspects of their players’ swings and immediately understand how their batting outcomes would be impacted. This insight would allow coaches to offer precise, data-backed advice to improve their players’ swings.

## Deployment
**Deployed site here**: https://diamond-hands-app.onrender.com/

The deployed site is based off the `deploy` branch. Some changes were made on the deploy branch in order to work with the limited CPU on the deployment service. Specifically, the "All Results" option from the filter on the "All Pitch Analysis" section because it returned too much data for the API response to handle when it was deployed. 

## Working Repository:
Most of the work to test the python functions and model were done in our working private repository here: https://github.com/alessandra-puccio/WISD-DiamondHands/tree/main
- Model work done in `steph-test` branch
- Plotting functions for all pitches in `ali-clean` branch

## App Structure
The DiamondMetrics web application is built with a Flask API and a React frontend: 
- The Flask API `app` is defined in `main.py` within the `backend` folder. The API allows the frontend to request and pull data processed by Python functions and predicted by our model. 
    - More about how the model was developed [here](https://docs.google.com/document/d/1bRCN1hDYxcQqQvOACcm7y3tFS70Pybsvwgiwg43MKh4/edit?usp=sharing)
    - In order to keep the given data private, we processed data into our own data frames, converted it into JSON files, and then encrypted these files.  
- The React frontend is split into two main components: `AllPitches.jsx` and `IndividualPitches.jsx` where the "All Pitches Analysis" and "Contact Point Analysis" pages of the website are defined. Both of these components, along with the common header, come together in the `App.jsx` component. 
  
Important files highlighted here: 

```
root
│   README.md
│   requirements.txt  
|   .gitignore
|   .env (need to add)  
│
└───backend
│   │   main.py (Run Flask app here)
│   │   graphs.py (All functions relating to graphing functions on app)
|   |   ... Other Python files with helper methods 
|   |
|   |   ball_tracking_encrypt.bin  (encrypted ball tracking data)
│   │   ... other .bin files that are encrypted 
|   |   
|   |   la_model.pkl (a pickled python object representing the launch angle model used for predictions)
|   |   ... more helpful .pkl files used for predictions  
│   
└───frontend
    │   main.jsx
    │   App.jsx (Routes are specified here)
    |   api.js (API call functions to backend)
    |   |
│   └───all_pitches
│       │   ... React components relating to the "All Pitches" Analysis section 
|       
|   └───individual_pitches 
│       │   ... React components relating to the "Contact Point" Analysis section 

```

## **Run the App Locally**
First, clone this repository onto your computer. 
>These directions assume you have Python 3 and Node v18 already installed on your system. 

### **Build the frontend**: 
Assuming you have Node installed, go into the `frontend` folder and run `npm install` to install all the necessary packages for this project. After everything is done installing, run the command:  `npm run build` which will build a static `index.html` that the Flask app will use to run the UI. 
> You must run the backend and frontend simultaneously in order to pull the data correctly. 

### **Run the backend**: 

Set up a python virtual environment: https://docs.python.org/3/library/venv.html

Once you have your virtual environment running, install the required dependencies: 
```
pip install -r requirements.txt
```

In the root directory for this project, run the app located in the `main.py` file with the command below. Open a new browser tab and this should run on port `http://0.0.0.0:10000`. Once you open this window, you should see the UI (assuming the frontend is running as well). 
```
gunicorn --chdir backend main:app --bind 0.0.0.0:10000
```

*Note: The data is being pulled from encrypted JSON files to keep the data private. This requires a `.env` file with the secret keys to decrypt.*

