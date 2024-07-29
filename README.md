# Swing Savvy

## App Structure
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
    │   App.jsx
    |   api.js (API call functions to backend)
    |   |
│   └───all_pitches
│       │   ... React components relating to the "All Pitches" Analysis section 
|       
|   └───individual_pitches 
│       │   ... React components relating to the "Contact Point" Analysis section 

```


## **Run the App Locally**
>These directions assume you have Python 3 and Node v18 already installed on your system. 

<br/>

### **Run the backend**: 

Set up a python virtual environment: https://docs.python.org/3/library/venv.html

Once you have your virtual environment running, install the required dependencies: 
```
pip install -r requirements.txt
```

In the `backend` folder, run the `main.py` file with the command below (you may need to install some of the libraries in this file in your own virtual env). Open a new browser tab and this should run on port `http://0.0.0.0:10000`. Once you open this window, you should see "DIAMOND HANDS". 
```
gunicorn --chdir backend main:app --bind 0.0.0.0:10000
```

*Note: The data is being pulled from encrypted JSON files to keep the data private. This requires a `.env` file with the secret keys.*

<br/>

### **Run the frontend**: 
Assuming you have Node installed, go into the `frontend` folder and run `npm install` to install all the necessary packages for this project. After everything is done installing, run the command:  `npm run dev` which will open the UI in `http://localhost:5173/`. 
> You must run the backend and frontend simultaneously in order to pull the data correctly. 
