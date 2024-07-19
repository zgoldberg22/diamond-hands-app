import json
import os
import numpy as np

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
