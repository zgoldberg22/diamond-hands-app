import json
import os
import pandas as pd 
import string
import random
from decrypt import decrypt_json
import pickle

def get_json(file_name):
    root = os.path.realpath(os.path.dirname(__file__))
    full_file_path = os.path.join(root, file_name)

    data = {}
    with open(full_file_path, 'r') as f: 
        data = json.load(f)

    data_df = pd.DataFrame(data)

    return data_df

def get_decrypted_data(input_file):
   data = decrypt_json(input_file)
   return data

def get_basic_pitches_df():
   data = decrypt_json("basic_pitches_encrypted.bin")
   return pd.DataFrame(data)

def get_ball_tracking_df():
   data = get_decrypted_data("ball_tracking_encrypted.bin")
   return pd.DataFrame(data)

def decrypted_data_to_df(file_path):
   data = get_decrypted_data(file_path)
   return pd.DataFrame(data); 


def filter_by_args(args, data): 
   filtered_data = data.copy()
   if 'swing' in args and args['swing'].lower() == 'true':
        filtered_data = filtered_data[filtered_data['hiteventId'].notnull()]

   if 'teamId' in args: 
      filtered_data = filtered_data[filtered_data['teamId'] == float(args['teamId'])]

   if 'personId' in args: 
      filtered_data = filtered_data[filtered_data['personId'] == float(args['personId'])]

   for key, value in args.items():
      if key in ['teamId', 'personId', 'swing']: 
         continue
      if key in filtered_data.columns and value is not None:
         filtered_data[key] = filtered_data[key].astype("string")
         updated_value = value.strip('"') if '"' in value else value
         filtered_data = filtered_data[filtered_data[key] == updated_value]

   return filtered_data

def unpickle(file_path):
   with open(file_path, 'rb') as f:
      model = pickle.load(f)

   return model
   