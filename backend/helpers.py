import json
import os
import pandas as pd 
import string
import random
from decrypt import decrypt_json

def get_decrypted_data(input_file):
   data = decrypt_json(input_file)
   return data

def get_basic_pitches_df():
   data = decrypt_json("basic_pitches_encrypted.bin")
   return pd.DataFrame(data)

def get_ball_tracking_df():
   data = get_decrypted_data("ball_tracking_encrypted.bin")
   return pd.DataFrame(data)

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