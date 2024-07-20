import json
import os
import pandas as pd 

def get_json(file_name):
    root = os.path.realpath(os.path.dirname(__file__))
    full_file_path = os.path.join(root, file_name)

    data = {}
    with open(full_file_path, 'r') as f: 
        data = json.load(f)

    return data

def get_basic_pitches_json():
    data = get_json("basic_pitches.json")
    return data

def get_ball_tracking_data():
    data = get_json("ball_tracking.json")
    return data

def get_basic_pitches_df():
    return pd.DataFrame(get_basic_pitches_json())

def get_ball_tracking_df():
    return pd.DataFrame(get_ball_tracking_data())

def filter_by_args(args, data): 
   filtered_data = data.copy()
   for key, value in args.items():
      if key in filtered_data.columns and value is not None:
         filtered_data[key] = filtered_data[key].astype("string")
         updated_value = value.strip('"') if '"' in value else value
         filtered_data = filtered_data[filtered_data[key] == updated_value]
   return filtered_data