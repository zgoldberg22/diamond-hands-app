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
from helpers import get_json, get_basic_pitches_df, get_ball_tracking_df


# Access the parsed dataframes
basic_pitches = get_basic_pitches_df()
ball_tracking = get_ball_tracking_df()

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

# pass in args 
def plot_pitch_result_heatmap(result):
    filtered_pitches = basic_pitches[basic_pitches['result'] == result]

    # Merge the DataFrames on pitcheventId and eventId
    merged_df = pd.merge(filtered_pitches, ball_tracking, left_on='pitcheventId', right_on='eventId')
    closest_points = merged_df.groupby('pitcheventId').apply(first_occurence_closest_to_zero)

    # Extract the pos_x and pos_z coordinates
    pos_x = closest_points['pos_x']
    pos_z = closest_points['pos_z']

    # Create a grid of points
    x_range = np.linspace(-2, 2, 100)
    z_range = np.linspace(1, 4, 100)
    xx, zz = np.meshgrid(x_range, z_range)

    # Calculate the kernel density estimation
    positions = np.vstack([xx.ravel(), zz.ravel()])
    values = np.vstack([pos_x, pos_z])
    kernel = gaussian_kde(values)
    f = np.reshape(kernel(positions).T, xx.shape)

    heatmap = {
        "x": x_range.tolist(), 
        "y": z_range.tolist(), 
        "z": f.tolist(), 
        "colorscale": 'YlOrRd',
        "colorbar": dict(title='Density')
    }

    layout = {
        "title": f'Pitch Location Heatmap for {result}',
        "xaxis":dict(title='Left-Right', range=[-2, 2], dtick=0.5),
        "yaxis":dict(title='Up-Down', range=[1, 4], dtick=0.5),
        "shapes":[
            # Add strike zone rectangle
            dict(
                type="rect",
                x0=-0.7083, x1=0.7083,
                y0=1.5, y1=3.5,
                line=dict(color="Black"),
                fillcolor="rgba(0,0,0,0)",
            )
        ]
    }

    # Create figure and show
    return {"data": heatmap, "layout": layout}



def plot_by_pitch_result_3d(result): 
    filtered_pitches = basic_pitches[basic_pitches['result'] == result]

    # Merge the DataFrames on pitcheventId and eventId
    merged_df = pd.merge(filtered_pitches, ball_tracking, left_on='pitcheventId', right_on='eventId')   
    closest_points = merged_df.groupby('pitcheventId').apply(first_occurence_closest_to_zero)

    # Extract the pos_x, pos_y, and pos_z coordinates
    pos_x = closest_points['pos_x']
    pos_y = closest_points['pos_y']
    pos_z = closest_points['pos_z']

    fig = make_subplots(rows=1, cols=1, specs=[[{'type': 'scatter3d'}]])

    # Add scatter plot for pitch locations
    scatter = go.Scatter3d(
        x=pos_x,  # Use pos_x for x-axis (left-right)
        y=pos_y,  # Use pos_y for y-axis (front-back)
        z=pos_z,  # Use pos_z for z-axis (up-down)
        mode='markers',
        marker=dict(size=3, color='blue', opacity=0.6),
        name=result
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
        title=f'Locations for {result}',
        scene=dict(
            xaxis_title='Left-Right',
            yaxis_title='Front-Back',
            zaxis_title='Up-Down',
            xaxis=dict(range=[-2, 2]),
            yaxis=dict(range=[-3, 3]),
            zaxis=dict(range=[-1, 5]),
            aspectmode='manual',
            aspectratio=dict(x=1, y=1, z=1.5),
            camera=dict(
                eye=dict(x=-1.5, y=-1.5, z=0.5),
                center=dict(x=0, y=0, z=0)
            )
        ),
        height=800,
        width=800
    )

    fig.show()




# def plot_pitch_result_heatmap(result):
#     filtered_pitches = basic_pitches[basic_pitches['result'] == result]

#     # Merge the DataFrames on pitcheventId and eventId
#     merged_df = pd.merge(filtered_pitches, ball_tracking, left_on='pitcheventId', right_on='eventId')
#     closest_points = merged_df.groupby('pitcheventId').apply(first_occurence_closest_to_zero)

#     # Extract the pos_x and pos_z coordinates
#     pos_x = closest_points['pos_x']
#     pos_z = closest_points['pos_z']

#     # Create 2D histogram
#     x_bins = np.linspace(-2, 2, 50)
#     z_bins = np.linspace(-1, 5, 50)
#     hist, x_edges, z_edges = np.histogram2d(pos_x, pos_z, bins=[x_bins, z_bins])

#     # Create heatmap
#     heatmap = go.Heatmap(
#         x=x_edges[:-1],
#         y=z_edges[:-1],
#         z=hist.T,
#         colorscale='Blues',
#         colorbar=dict(title='Frequency')
#     )

#     # Create layout
#     layout = go.Layout(
#         title=f'Pitch Location Heatmap for {result}',
#         xaxis=dict(title='Left-Right', range=[-2, 2]),
#         yaxis=dict(title='Up-Down', range=[-1, 5]),
#         shapes=[
#             # Add strike zone rectangle
#             dict(
#                 type="rect",
#                 x0=-0.7083, x1=0.7083,
#                 y0=1.5, y1=3.5,
#                 line=dict(color="Red"),
#                 fillcolor="rgba(255,0,0,0.2)",
#             )
#         ]
#     )

#     # Create figure and show
#     fig = go.Figure(data=[heatmap], layout=layout)
#     fig.show()