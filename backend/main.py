from flask import Flask, request, jsonify
# from heatmap import plot_pitch_result_heatmap
from helpers import get_basic_pitches_json
from graphs import plot_pitch_result_heatmap

app = Flask(__name__)

if __name__ == "__main__":
   app.run(debug=True)

@app.route("/")
def home(): 
   return "Home", 200

@app.route("/basic_pitches")
def get_basic_pitches():
   pitches = get_basic_pitches_json()
   return pitches, 200

@app.route("/heatmap")
def get_heatmap(): 
   # data = request.get_json() # get json that is passed in the body of the request
   args = request.args.to_dict() #converts body to dictionary
   heatmap = {}
   if "result" in args: 
      heatmap = plot_pitch_result_heatmap("Strike")

   return jsonify(heatmap), 200 # created successfully 


#filters for heatmap: 
   # outs
   # result
   # action 
   # player id (don't have yet)
