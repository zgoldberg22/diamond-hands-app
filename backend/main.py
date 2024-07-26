from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
# from heatmap import plot_pitch_result_heatmap
from helpers import get_basic_pitches_json, filter_by_args, get_basic_pitches_df
from graphs import plot_pitch_result_heatmap, plot_by_pitch_result_3d, get_heatmap_and_scatter

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

@app.route("/")
def home(): 
   return "DIAMOND HANDS"

# GET request to get all data from basic_pitches json file or filters with query params 
# Example of a request: http://127.0.0.1:5000/basic_pitches?outsinning=1&result=Strike
@app.route("/basic_pitches")
@cross_origin()
def get_basic_pitches():
   try: 
      args = request.args.to_dict() # gets query params 
      print(args)
      if args:
         pitches = get_basic_pitches_df()
         # print(pitches.keys())
         filtered_pitches = filter_by_args(args, pitches)
         pitches_json = filtered_pitches.to_json(orient='records')
         return jsonify(pitches_json), 200
      else: 
         pitches = get_basic_pitches_json()
         return jsonify(pitches), 200
   except Exception as e: 
      return jsonify({"error": str(e)}), 500

@app.route("/all_pitch_graphs")
@cross_origin()
def get_all_pitch_graphs(): 
   # data = request.get_json() # get json that is passed in the body of the request
   args = request.args.to_dict() #converts body to dictionary
   # print(args)
   all_graphs = get_heatmap_and_scatter(args)

   return jsonify(all_graphs), 200 # created successfully 


@app.route("/heatmap")
@cross_origin()
def get_heatmap(): 
   # data = request.get_json() # get json that is passed in the body of the request
   args = request.args.to_dict() #converts body to dictionary
   print(args)
   heatmap = plot_pitch_result_heatmap(args)

   return jsonify(heatmap), 200 # created successfully 

@app.route("/pitch_scatter_plot")
@cross_origin()
def get_pitch_scatter_plot(): 
   # data = request.get_json() # get json that is passed in the body of the request
   args = request.args.to_dict() #converts body to dictionary
   # print(args)
   plot = plot_by_pitch_result_3d(args)

   return jsonify(plot), 200 # created successfully 

## IMPORTANT - Anything that is being returned from a Flask app function needs to return a Json serializable object (jsonify() function does this), but some types, like numpy arrays, are not serializable
if __name__ == "__main__":
   app.run(debug=True)