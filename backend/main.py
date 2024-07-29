from flask import Flask, request, jsonify, render_template
from flask_cors import CORS, cross_origin
from helpers import get_decrypted_data, filter_by_args, get_basic_pitches_df
from graphs import plot_pitch_result_heatmap, plot_by_pitch_result_3d, get_graphs_all_pitches, single_pitch_plots, get_hit_contact
import json

app = Flask(__name__, static_url_path="", static_folder="../frontend/dist", template_folder="../frontend/dist")
CORS(app, resources={r"/*": {"origins": "http://0.0.0.0:8000"}})

@app.route("/")
@cross_origin()
def index(): 
   # return "DIAMOND HANDS"
   return render_template("index.html")

# GET request to get all data from basic_pitches json file or filters with query params 
# Example of a request: http://127.0.0.1:5000/basic_pitches?outsinning=1&result=Strike
@app.route("/basic_pitches", methods=["GET"])
@cross_origin()
def get_basic_pitches():
   try: 
      args = request.args.to_dict() # gets query params 
      if args:
         pitches = get_basic_pitches_df()
         filtered_pitches = filter_by_args(args, pitches)
         pitches_json = filtered_pitches.to_json(orient='records')
         return jsonify(pitches_json), 200
      else: 
         pitches = get_decrypted_data("basic_pitches_encrypted.bin")
         return jsonify(pitches), 200
   except Exception as e: 
      return jsonify({"error": str(e)}), 500

@app.route("/all_pitch_graphs", methods=["GET"])
@cross_origin()
def get_all_pitch_graphs(): 
   args = request.args.to_dict()
   all_graphs = get_graphs_all_pitches(args)

   return jsonify(all_graphs), 200

@app.route("/all_hits", methods=["GET"])
@cross_origin()
def get_all_hits(): 
   all_hits = get_hit_contact()

   return jsonify(all_hits), 200

@app.route("/plot_prediction", methods=["GET"])
@cross_origin()
def get_plot_prediction(): 
   args = request.args.to_dict()
   if args:
      updated_args = {}
      for key, value in args.items(): 
         if value: 
            updated_value = value.strip('"') if '"' in value else value
            if key in ['change_in_bat_speed', 'change_in_z','change_in_bat_plane']: 
               updated_value = float(updated_value)
            updated_args[key] = updated_value

      if len(updated_args) == 1:
         graph_data = single_pitch_plots(hiteventId=updated_args['hiteventId'])
      else:
         graph_data = single_pitch_plots(hiteventId=updated_args['hiteventId'], change_in_z=updated_args["change_in_z"], change_in_bat_speed=updated_args["change_in_bat_speed"], change_in_bat_plane=updated_args["change_in_bat_plane"])
   else: 
      return jsonify({}), 204

   response = jsonify(graph_data)
   response.headers.add('Access-Control-Allow-Origin', 'http://0.0.0.0:8000')

   return jsonify(graph_data), 200

## IMPORTANT - Anything that is being returned from a Flask app function needs to return a Json serializable object (jsonify() function does this), but some types, like numpy arrays, are not serializable
if __name__ == "__main__":
   app.run(debug=True, host='0.0.0.0', port=8000)