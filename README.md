# diamond-hands-app

## Hey there team: 
In order to run the app (specifically the frontend), you need to run the backend at the same time as the frontend. Here's how: 

### **Run the backend**: 
I did not create a virtual environment inside this repo because I was scared of the possible git things that go wrong. 

Instead, in the `backend` folder, run the `main.py` file with the command below (you may need to install some of the libraries in this file in your own virtual env). Open a new browser tab and this should run on port `127.0.0.1:5000`. Once you open this window, you should see "DIAMOND HANDS". 
```
python3 main.py
```

** Note: You do not need to open the frontend if you are just working on API requests, but you do need the backend running if you are working on the frontend. 

<br/>

### **Run the frontend**: 
Assuming you have Node installed, go into the `frontend` folder and run `npm install` to install all the necessary packages for this project. After everything is done installing, run the command:  `npm run dev` which will open the UI in `http://localhost:5173/`. 

> The UI is a little messy right now because I was just playing around with it so feel free to try whatever you want with it. - zoe