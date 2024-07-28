import matplotlib.pyplot as plt
import pandas as pd 
from mpl_toolkits.mplot3d import Axes3D
from tabulate import tabulate
import plotly.graph_objs as go
from plotly.subplots import make_subplots
import plotly.graph_objects as go
import numpy as np
from scipy.stats import gaussian_kde
from flask import jsonify
import json
import plotly.io as pio
import pickle
from helpers import get_basic_pitches_df, get_ball_tracking_df, filter_by_args, get_json, unpickle, decrypted_data_to_df, get_decrypted_data
from plot_prediction_with_param import plot_contact_pred

# Access the parsed dataframes
basic_pitches = get_basic_pitches_df()
ball_tracking = get_ball_tracking_df()
bat_tracking = decrypted_data_to_df("bat_tracking_hits_encrypt.bin")
hit_contact = decrypted_data_to_df("hit_contact_encrypt.bin")
sc_hits_preds = get_json("sc_data.json")

la_model = unpickle('la_model.pkl')
la_scaler_X = unpickle('la_scaler_X.pkl')
la_scaler_y = unpickle('la_scaler_Y.pkl')
ev_model = unpickle('ev_model.pkl')
ev_scaler_X = unpickle('ev_scaler_X.pkl')
ev_scaler_y = unpickle('ev_scaler_Y.pkl')

def get_hit_contact():
    return get_decrypted_data("hit_contact_encrypt.bin")

def first_occurence_closest_to_zero(group):
    # Sort the group by timestamp to ensure we process the pitch chronologically
    sorted_group = group.sort_values('time')

    minimum_dist = abs(sorted_group.iloc[0]['pos_y'])
    closest_row = sorted_group.iloc[0]
    
    for _, row in sorted_group.iterrows():
        current_dist = abs(row['pos_y'])
        
        # If the current distance is smaller, update the minimum and closest row
        if current_dist < minimum_dist:
            minimum_dist = current_dist
            closest_row = row
        # If the current distance is larger, stop iterating
        elif current_dist > minimum_dist:
            break
    
    return closest_row

def get_heatmap_and_scatter(args):
    filtered_pitches = basic_pitches
    if args: 
        filtered_pitches = filter_by_args(args, basic_pitches)
        if filtered_pitches.empty:
            return {}

     # Merge the DataFrames on pitcheventId and eventId
    merged_df = pd.merge(filtered_pitches, ball_tracking, left_on='pitcheventId', right_on='eventId')   
    closest_points = merged_df.groupby('pitcheventId').apply(first_occurence_closest_to_zero)

    # Extract the pos_x, pos_y, and pos_z coordinates
    pos_x = closest_points['pos_x']
    pos_y = closest_points['pos_y']
    pos_z = closest_points['pos_z']

    heatmap = plot_pitch_result_heatmap(filtered_pitches, pos_x, pos_z)
    scatter_plot = plot_by_pitch_result_3d(filtered_pitches, pos_x, pos_y, pos_z)

    # return heatmap and scatter_plot data
    return {"heatmap": heatmap, "scatter_plot": scatter_plot}

def plot_pitch_result_heatmap(filtered_pitches, pos_x, pos_z):
    # Create a grid of points
    x_range = np.linspace(-2, 2, 100)
    z_range = np.linspace(1, 4, 100)
    xx, zz = np.meshgrid(x_range, z_range)

    # Calculate the kernel density estimation
    positions = np.vstack([xx.ravel(), zz.ravel()])
    values = np.vstack([pos_x, pos_z])
    kernel = gaussian_kde(values)
    f = np.reshape(kernel(positions).T, xx.shape)

    heatmap = [{
        "type": 'heatmap',
        "x": x_range.tolist(), 
        "y": z_range.tolist(), 
        "z": f.tolist(), 
        "colorscale": 'YlOrRd',
        "reversescale": True,
        "colorbar": dict(title='Density')
    }]

    layout = {
        "title": f'Pitch Location Heatmap',
        "xaxis":dict(title='Left-Right', range=[2, -2], dtick=0.5),
        "yaxis":dict(title='Up-Down', range=[1, 4], dtick=0.5),
        "shapes":[
            # Add strike zone rectangle
            dict(
                type="rect",
                x0=-.7083, x1=0.7083,
                y0=1.5, y1=3.5,
                line=dict(color="Black"),
                fillcolor="rgba(0,0,0,0)",
            )
        ], 
        "width": 600, 
        "height": 600
    }

    # return data for heatmap
    return {"data": heatmap, "layout": layout}


def plot_by_pitch_result_3d(filtered_pitches, pos_x, pos_y, pos_z):
    fig = make_subplots(rows=1, cols=1, specs=[[{'type': 'scatter3d'}]])

    # Add scatter plot for pitch locations
    scatter = go.Scatter3d(
        x=pos_x.tolist(),  # Use pos_x for x-axis (left-right)
        y=pos_y.tolist(),  # Use pos_y for y-axis (front-back)
        z=pos_z.tolist(),  # Use pos_z for z-axis (up-down)
        mode='markers',
        marker=dict(size=3, color='blue', opacity=0.6),
        name="Pitches"
    )
    fig.add_trace(scatter)

    # Add reference plane for strike zone
    strike_zone = go.Mesh3d(
        x=[-0.7083, 0.7083, 0.7083, -0.7083],
        y=[0, 0, 0, 0],
        z=[1.5, 1.5, 3.5, 3.5],
        opacity=0.2,
        color='red',
        name='Strike Zone'
    )
    fig.add_trace(strike_zone)

    fig.update_layout(
        title='Locations for Pitches',
        title_x=0.5,
        scene=dict(
            xaxis_title='x-axis (Left-Right)',
            yaxis_title='y-axis (Front-Back)',
            zaxis_title='z-axis (Up-Down)',
            xaxis=dict(range=[-2, 2]),
            yaxis=dict(range=[-3, 3]),
            zaxis=dict(range=[-1, 5]),
            aspectmode='manual',
            aspectratio=dict(x=1, y=1, z=1.5),
            camera=dict(
                eye=dict(x=.5, y=3, z=0.5),  # Adjusted for y-z view
                center=dict(x=0, y=0, z=0),
                up=dict(x=0, y=0, z=1)  # Ensure the z-axis is pointing up
            )
        ),
        height=600,
        width=600
    )
     # Add reference plane for strike zone
    strike_zone_outline = go.Scatter3d(
        x=[-.7083, .7083, .7083, -.7083, -.7083],  # Added the last point to close the shape
        y=[-3, -3, -3, -3, -3],  # Place it at y=-3
        z=[1.5, 1.5, 3.6, 3.6, 1.5],
        mode='lines',
        line=dict(color='black', width=4),
        name='Strike Zone',
        showlegend=True  # Remove legend for strike zone outline
    )
    fig.add_trace(strike_zone_outline)  

    inch_to_foot = 1/12
    thickness = 1/12

    home_plate = go.Mesh3d(
        # Define the points of the 3D home plate (flipped)
        x=[-8.5*inch_to_foot, 8.5*inch_to_foot, 8.5*inch_to_foot, 0, -8.5*inch_to_foot,
        -8.5*inch_to_foot, 8.5*inch_to_foot, 8.5*inch_to_foot, 0, -8.5*inch_to_foot],
        y=[17*inch_to_foot, 17*inch_to_foot, 8.5*inch_to_foot, 0, 8.5*inch_to_foot,
        17*inch_to_foot, 17*inch_to_foot, 8.5*inch_to_foot, 0, 8.5*inch_to_foot],
        z=[0, 0, 0, 0, 0,
        thickness, thickness, thickness, thickness, thickness],
        i=[0, 0, 0, 5, 5, 5, 0, 1, 2, 3],
        j=[1, 2, 3, 6, 7, 8, 5, 6, 7, 8],
        k=[2, 3, 4, 7, 8, 9, 1, 2, 3, 4],
        opacity=1,
        color='white',
        name='Home Plate',
        showlegend=False,  # Remove legend for home plate
        lighting=dict(
            ambient=1,
            diffuse=0,
            specular=0,
            roughness=1,
            fresnel=0
        ),
        lightposition=dict(x=0, y=0, z=100000),
        flatshading=True,
    )
    fig.add_trace(home_plate)

    # data = fig['data']
    # layout = fig['layout']

    # Serialize data and layout to JSON
    fig_dict = {
        'data': [trace.to_plotly_json() for trace in fig.data],
        'layout': fig.layout.to_plotly_json()
    }

    # Return the JSON string
    return fig_dict

def single_pitch_plots(hiteventId, change_in_z=None, change_in_bat_speed=None): 
    fig_dict = plot_contact_pred(hiteventId, bat_tracking, hit_contact, sc_hits_preds, la_model, la_scaler_X, la_scaler_y, ev_model, ev_scaler_X, ev_scaler_y, change_in_z,change_in_bat_speed)

    # fig_dict = {
    #     'data': [trace.to_plotly_json() for trace in fig.data], 
    #     'layout': fig.layout.to_plotly_json() 
    # }

    # fig_dict = {
    #     'data': fig["data"], 
    #     'layout': fig.layout.to_plotly_json() 
    # }

    return fig_dict
