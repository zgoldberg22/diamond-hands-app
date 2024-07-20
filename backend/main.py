from flask import Flask, request, jsonify
from flask_cors import CORS
# from heatmap import plot_pitch_result_heatmap
from helpers import get_basic_pitches_json, filter_by_args, get_basic_pitches_df
from graphs import plot_pitch_result_heatmap

app = Flask(__name__)
CORS(app)

@app.route("/")
def home(): 
   return "Home"

@app.route("/basic_pitches")
def get_basic_pitches():
   try: 
      args = request.args.to_dict()
      print(args)
      if args:
         pitches = get_basic_pitches_df()
         print(pitches.keys())
         filtered_pitches = filter_by_args(args, pitches)
         pitches_json = filtered_pitches.to_json(orient='records')
         return jsonify(pitches_json), 200
      else: 
         pitches = get_basic_pitches_json()
         return jsonify(pitches), 200
   except Exception as e: 
      return jsonify({"error": str(e)}), 500

@app.route("/heatmap")
def get_heatmap(): 
   # data = request.get_json() # get json that is passed in the body of the request
   args = request.args.to_dict() #converts body to dictionary
   heatmap = plot_pitch_result_heatmap(args)

   return jsonify(heatmap), 200 # created successfully 


#filters for heatmap: 
   # outs
   # result
   # action 
   # player id (don't have yet)

if __name__ == "__main__":
   app.run(debug=True)