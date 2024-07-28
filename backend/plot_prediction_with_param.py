import math
import numpy as np
import plotly.graph_objects as go
import pandas as pd
import sklearn
import pickle
import os
import json
from plotly.subplots import make_subplots
from scipy.stats import gaussian_kde

def plot_contact_pred(hiteventId, bat_tracking, hit_contact, sc_hit_preds, la_model, la_scaler_X, la_scaler_y, ev_model, ev_scaler_X, ev_scaler_y, change_in_z=None, change_in_bat_plane=None, change_in_bat_speed=None, bat_radius=0.219816 / 2, ball_radius=0.242782 / 2):
    # Calculate new params for the model based on adjusted (or not adjusted) params
    la_cols = ['differential_z', 'bat_vel_at_contact_z']
    ev_cols = [
        'ball_pos_at_contact_x', 'ball_pos_at_contact_y', 'ball_pos_at_contact_z',
        'bat_pos_at_contact_x', 'bat_pos_at_contact_y', 'bat_pos_at_contact_z',
        'differential_x', 'differential_y', 'differential_z',
        'bat_vel_at_contact_x', 'bat_vel_at_contact_y', 'bat_vel_at_contact_z',
        'distance_from_handle', 'bat_speed_at_contact', 
        'angle_from_z'
    ]

    fig = go.Figure()

    # Filter for the specific hiteventId
    one_bat = bat_tracking[bat_tracking['hiteventId'] == hiteventId]
    new_bat = hit_contact[hit_contact['hiteventId'] == hiteventId]

    tan=new_bat['bat_vel_at_contact_z'].iloc[0] / new_bat['bat_vel_at_contact_y'].iloc[0]
    angle_radians = math.atan(tan)
    og_bat_plane = math.degrees(angle_radians)

    if change_in_bat_plane is None:
        bat_plane = og_bat_plane
    else:
        bat_plane = og_bat_plane + change_in_bat_plane

    if change_in_z is not None:
        new_bat['bat_pos_at_contact_x'].iloc[0] += change_in_z
        new_bat['bat_pos_at_contact_y'].iloc[0] += change_in_z
        new_bat['bat_pos_at_contact_z'].iloc[0] += change_in_z
        new_bat['bat_head_at_contact_x'].iloc[0] += change_in_z
        new_bat['bat_head_at_contact_y'].iloc[0] += change_in_z
        new_bat['bat_head_at_contact_z'].iloc[0] += change_in_z
        new_bat['bat_handle_at_contact_x'].iloc[0] += change_in_z
        new_bat['bat_handle_at_contact_y'].iloc[0] += change_in_z
        new_bat['bat_handle_at_contact_z'].iloc[0] += change_in_z

    if change_in_bat_speed is not None:
        new_bat['bat_speed_at_contact'].iloc[0] = new_bat['bat_speed_at_contact'].iloc[0] + change_in_bat_speed
        
    new_bat['bat_vel_at_contact_z'].iloc[0] = new_bat['bat_speed_at_contact'].iloc[0] * math.sin(math.radians(bat_plane))
    new_bat['bat_vel_at_contact_y'].iloc[0] = new_bat['bat_speed_at_contact'].iloc[0] * math.cos(math.radians(bat_plane))
    
    if ev_model is None:
        pred_vel = new_bat['hitspeed_mph'].iloc[0]
    else:
        X_new = new_bat[ev_cols]
        X_new_scaled = ev_scaler_X.transform(X_new)
        y_new_scaled = ev_model.predict(X_new_scaled)
        pred_vel = ev_scaler_y.inverse_transform(y_new_scaled.reshape(-1, 1)).flatten()[0]
    
    if la_model is not None:
        X_new = new_bat[la_cols]
        X_new_scaled = la_scaler_X.transform(X_new)
        y_new_scaled = la_model.predict(X_new_scaled).flatten()
        pred_angle = la_scaler_y.inverse_transform(y_new_scaled.reshape(-1, 1)).flatten()[0]
    else:
        pred_angle = new_bat['hitangle2'].iloc[0]

    same_specs_pred = sc_hit_preds[(sc_hit_preds['launch_speed'].round() == pred_vel.round()) & (sc_hit_preds['launch_angle'] == pred_angle.round())]
    hit_prob_pred = 1 - same_specs_pred['out'].mean()

    same_specs_orig = sc_hit_preds[(sc_hit_preds['launch_speed'].round() == new_bat['hitspeed_mph'].iloc[0].round()) & (sc_hit_preds['launch_angle'] == new_bat['hitangle2'].iloc[0].round())]
    hit_prob_orig = 1 - same_specs_orig['out'].mean()

    # Extract the contact time
    contact_time = new_bat['collision_time'].iloc[0]

    # Filter for the last 10 frames before contact
    last_ten_frames = one_bat[one_bat['time'] <= contact_time].iloc[-10:]

    # Function to create a cylinder
    def create_cylinder(start, end, radius, n_points=100):
        v = np.array(end) - np.array(start)
        v_length = np.linalg.norm(v)
        v = v / v_length

        # Create a vector not aligned with v
        if (v == [0, 0, 1]).all():
            not_v = np.array([0, 1, 0])
        else:
            not_v = np.array([0, 0, 1])

        n1 = np.cross(v, not_v)
        n1 /= np.linalg.norm(n1)
        n2 = np.cross(v, n1)

        t = np.linspace(0, v_length, 2)
        theta = np.linspace(0, 2 * np.pi, n_points)
        t, theta = np.meshgrid(t, theta)

        X, Y, Z = [start[i] + v[i] * t + radius * (np.sin(theta) * n1[i] + np.cos(theta) * n2[i]) for i in [0, 1, 2]]
        return X, Y, Z

    # Add cylinders for the bat frames
    for i in range(len(last_ten_frames)):
        start = [last_ten_frames['handle_x'].iloc[i], last_ten_frames['handle_y'].iloc[i], last_ten_frames['handle_z'].iloc[i]]
        end = [last_ten_frames['head_x'].iloc[i], last_ten_frames['head_y'].iloc[i], last_ten_frames['head_z'].iloc[i]]
        X, Y, Z = create_cylinder(start, end, bat_radius)
        fig.add_trace(go.Surface(x=X.tolist(), y=Y.tolist(), z=Z.tolist(), colorscale='gray', showscale=False))

    # plot extrapolated bat position
    start = [new_bat['bat_handle_at_contact_x'].iloc[0], new_bat['bat_handle_at_contact_y'].iloc[0], new_bat['bat_handle_at_contact_z'].iloc[0]]
    end = [new_bat['bat_head_at_contact_x'].iloc[0], new_bat['bat_head_at_contact_y'].iloc[0], new_bat['bat_head_at_contact_z'].iloc[0]]
    X, Y, Z = create_cylinder(start, end, bat_radius)

    # Function to create a sphere
    def create_sphere(center, radius, n_points=50):
        u = np.linspace(0, 2 * np.pi, n_points)
        v = np.linspace(0, np.pi, n_points)
        x = center[0] + radius * np.outer(np.cos(u), np.sin(v))
        y = center[1] + radius * np.outer(np.sin(u), np.sin(v))
        z = center[2] + radius * np.outer(np.ones(np.size(u)), np.cos(v))
        return x, y, z

    # Plot the ball at the contact point
    ball_contact = [new_bat['ball_pos_at_contact_x'].iloc[0], new_bat['ball_pos_at_contact_y'].iloc[0], new_bat['ball_pos_at_contact_z'].iloc[0]]
    x_sphere, y_sphere, z_sphere = create_sphere(ball_contact, ball_radius)

    fig.add_trace(go.Surface(x=x_sphere.tolist(), y=y_sphere.tolist(), z=z_sphere.tolist(), colorscale=[[0, 'lightblue'], [1,'lightblue']], showscale=False))

    # Calculate the hit velocity vector components
    hitangle1 = new_bat['hitangle1'].iloc[0]
    hitangle2 = pred_angle
    hitspeed = pred_vel

    hitangle1_rad = np.radians(hitangle1)
    hitangle2_rad = np.radians(hitangle2)

    vx = hitspeed * np.sin(hitangle1_rad) / 40
    vy = hitspeed * np.cos(hitangle2_rad) * np.cos(hitangle1_rad) /40
    vz = hitspeed * np.sin(hitangle2_rad) /40

    # Plot the ball exit direction vector
    magnitude = np.sqrt(vx**2 + vy**2 + vz**2)

    # Normalize the vector components
    vx_normalized = vx / magnitude
    vy_normalized = vy / magnitude
    vz_normalized = vz / magnitude

    # Scale the normalized vector to a length of 1
    scale_factor = 1
    vx_scaled = vx_normalized * scale_factor
    vy_scaled = vy_normalized * scale_factor
    vz_scaled = vz_normalized * scale_factor

    # Plot the ball exit direction vector
    fig.add_trace(go.Scatter3d(
       x=[ball_contact[0], ball_contact[0] + vx_scaled],
        y=[ball_contact[1], ball_contact[1] + vy_scaled],
        z=[ball_contact[2], ball_contact[2] + vz_scaled],
        mode='lines+markers',
        line=dict(color='orange', width=5),
        marker=dict(size=1, color='orange'),
        name='Ball Exit Vector'
    ))

    fig.add_trace(go.Cone(
        x=[ball_contact[0] + vx_scaled], y=[ball_contact[1] + vy_scaled], z=[ball_contact[2] + vz_scaled],
        u=[vx_scaled], v=[vy_scaled], w=[vz_scaled],
        colorscale=[[0, 'orange'], [1, 'orange']], showscale=False,
        sizemode='scaled', sizeref=0.3,
        name='Bat Velocity'
    ))

    strike_zone = go.Mesh3d(
        x=[-1, 1, 1, -1],
        y=[0, 0, 0, 0],
        z=[1.5, 1.5, 3.75, 3.75],
        opacity=0.8,
        color='red',
        name='Strike Zone'
    )
    fig.add_trace(strike_zone)

    inch_to_foot = 1/12
    thickness = .03

    home_plate = go.Mesh3d(
        # Define the points of the 3D home plate (flipped)
        x=[-8.5*inch_to_foot, 8.5*inch_to_foot, 8.5*inch_to_foot, 0, -8.5*inch_to_foot,
        -8.5*inch_to_foot, 8.5*inch_to_foot, 8.5*inch_to_foot, 0, -8.5*inch_to_foot],
        y=[0, 0, -8.5*inch_to_foot, -17*inch_to_foot, -8.5*inch_to_foot,
        0, 0, -8.5*inch_to_foot, -17*inch_to_foot, -8.5*inch_to_foot],
        z=[0, 0, 0, 0, 0,
        thickness, thickness, thickness, thickness, thickness],
        i=[0, 0, 0, 5, 5, 5, 0, 1, 2, 3],
        j=[1, 2, 3, 6, 7, 8, 5, 6, 7, 8],
        k=[2, 3, 4, 7, 8, 9, 1, 2, 3, 4],
        opacity=1,
        color='pink',
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

    # Set plot layout
    fig.update_layout(
        scene=dict(
            xaxis_title='X Axis (ft)',
            yaxis_title='Y Axis (ft)',
            zaxis_title='Z Axis (ft)'
        ),
        title='3D Scatter Plot of Bat Points with Ball Exit Direction',
        title_x=0.5,
        showlegend=True, 
        width=575
    )

    fig_dict = {
        'data': [trace.to_plotly_json() for trace in fig.data], 
        'layout': fig.layout.to_plotly_json(),
        'label': {
            "Actual Hit Speed": f"{new_bat['hitspeed_mph'].iloc[0]} mph",
            "Predicted Hit Speed": f"{hitspeed:.2f} mph",
            "Horizontal Exit Angle": f"{hitangle1:.2f}°",
            "Predicted Vertical Exit Angle": f"{pred_angle:.2f}°",
            "Actual Vertical Exit Angle": f"{new_bat['hitangle2'].iloc[0]:.2f}°",
            "Outs on Play": f"{new_bat['outsplay'].iloc[0]:.2f}",
            "Old Hit Probability": f"{hit_prob_orig:.2f}",
            "New Hit Probability": f"{hit_prob_pred:.2f}"
        }
    }

    return fig_dict


def plot_launch_speed_vs_angle(hiteventId, hit_contact, sc_hit_preds, la_model, la_scaler_X, la_scaler_y, ev_model, ev_scaler_X, ev_scaler_y, change_in_z=None, change_in_bat_plane=None, change_in_bat_speed=None):
    la_cols = ['differential_z', 'bat_vel_at_contact_z']
    ev_cols = [
        'ball_pos_at_contact_x', 'ball_pos_at_contact_y', 'ball_pos_at_contact_z',
        'bat_pos_at_contact_x', 'bat_pos_at_contact_y', 'bat_pos_at_contact_z',
        'differential_x', 'differential_y', 'differential_z',
        'bat_vel_at_contact_x', 'bat_vel_at_contact_y', 'bat_vel_at_contact_z',
        'distance_from_handle', 'bat_speed_at_contact', 'angle_from_z'
    ]

    row = hit_contact[hit_contact['hiteventId'] == hiteventId]
    
    if row.empty:
        raise ValueError(f"hiteventId {hiteventId} not found in the dataframe.")
    
    row = row.iloc[0]

    tan=row['bat_vel_at_contact_z'] / row['bat_vel_at_contact_y']
    angle_radians = math.atan(tan)
    og_bat_plane = math.degrees(angle_radians)

    if change_in_bat_plane is None:
        bat_plane = og_bat_plane
    else:
        bat_plane = og_bat_plane + change_in_bat_plane
    
    if change_in_z is not None:
        row['differential_z'] += change_in_z
        row['bat_pos_at_contact_x'] += change_in_z
        row['bat_pos_at_contact_y'] += change_in_z
        row['bat_pos_at_contact_z'] += change_in_z
        row['bat_head_at_contact_x'] += change_in_z
        row['bat_head_at_contact_y'] += change_in_z
        row['bat_head_at_contact_z'] += change_in_z
        row['bat_handle_at_contact_x'] += change_in_z
        row['bat_handle_at_contact_y'] += change_in_z
        row['bat_handle_at_contact_z'] += change_in_z

    if change_in_bat_speed is not None:
        row['bat_speed_at_contact'] = row['bat_speed_at_contact'] + change_in_bat_speed
    row['bat_vel_at_contact_z'] = row['bat_speed_at_contact'] * math.sin(math.radians(bat_plane))
    row['bat_vel_at_contact_y'] = row['bat_speed_at_contact'] * math.cos(math.radians(bat_plane))
    
    if ev_model is None:
        pred_vel = row['hitspeed_mph']
    else:
        X_new = row[ev_cols].values.reshape(1, -1)
        X_new_scaled = ev_scaler_X.transform(X_new)
        y_new_scaled = ev_model.predict(X_new_scaled)
        pred_vel = ev_scaler_y.inverse_transform(y_new_scaled.reshape(-1, 1)).flatten()[0]

    if la_model is not None:
        X_new = row[la_cols].values.reshape(1, -1)
        X_new_scaled = la_scaler_X.transform(X_new)
        y_new_scaled = la_model.predict(X_new_scaled).flatten()
        pred_angle = la_scaler_y.inverse_transform(y_new_scaled.reshape(-1, 1)).flatten()[0]
    else:
        pred_angle = row['hitangle2']
    
    # Round launch_speed and launch_angle
    sc_hit_preds['launch_speed_rounded'] = sc_hit_preds['launch_speed'].round()
    sc_hit_preds['launch_angle_rounded'] = sc_hit_preds['launch_angle'].round()

    # Calculate the probability of an out for each combination of rounded launch_speed and launch_angle
    probability_df = sc_hit_preds.groupby(['launch_speed_rounded', 'launch_angle_rounded'])['out'].mean().reset_index()

    # Create the figure
    fig = make_subplots()

    # Add the heatmap-like scatter plot
    scatter = go.Scatter(
        x=probability_df['launch_speed_rounded'].tolist(),
        y=probability_df['launch_angle_rounded'].tolist(),
        mode='markers',
        marker=dict(
            size=8,
            color=probability_df['out'].tolist(),
            colorscale='Viridis',
            colorbar=dict(title='Probability of Out'),
            showscale=True
        ),
        hovertemplate='Launch Speed: %{x}<br>Launch Angle: %{y}<br>Probability of Out: %{marker.color:.2f}<extra></extra>',
        showlegend=False  # Hide the legend for the main scatter plot
    )
    fig.add_trace(scatter)

    # Plot hit_contact data for the specified hiteventId in red
    hit_event_data = hit_contact[hit_contact['hiteventId'] == hiteventId]
    if not hit_event_data.empty:
        hit_scatter = go.Scatter(
            x=hit_event_data['hitspeed_mph'].tolist(),
            y=hit_event_data['hitangle2'].tolist(),
            mode='markers',
            marker=dict(color='red', size=14, line=dict(color='black', width=2)),
            name=f'True Hit Result',
            hovertemplate='Hit Speed: %{x}<br>Hit Angle: %{y}<extra></extra>',
            showlegend=True  # Show the legend for the red dot
        )
        fig.add_trace(hit_scatter)

        hit_scatter = go.Scatter(
            x=[pred_vel],
            y=[pred_angle],
            mode='markers',
            marker=dict(color='orange', size=14, line=dict(color='black', width=2)),
            name=f'Predicted Hit Result',
            hovertemplate='Hit Speed: %{x}<br>Hit Angle: %{y}<extra></extra>',
            showlegend=True  # Show the legend for the red dot
        )
        fig.add_trace(hit_scatter)

    # Update layout to make the plot square
    fig.update_layout(
        title='Probability of Out Based on Launch Speed and Angle',
        xaxis_title='Launch Speed (mph)',
        yaxis_title='Launch Angle (degrees)',
        xaxis=dict(range=[sc_hit_preds['launch_speed'].min(), sc_hit_preds['launch_speed'].max()]),
        yaxis=dict(range=[sc_hit_preds['launch_angle'].min(), sc_hit_preds['launch_angle'].max()]),
        legend=dict(yanchor="top", y=0.99, xanchor="left", x=0.01),
        autosize=False,
        width=575,  # Adjust width
        height=575  # Adjust height to make the plot square
    )

    fig_dict = {
        'data': [trace.to_plotly_json() for trace in fig.data], 
        'layout': fig.layout.to_plotly_json()
    }

    return fig_dict



def plot_distribution(data, value, color, title, xaxis_title, yaxis_title, true_value, predicted_value, true_label, predicted_label):
    # Estimate density using Gaussian KDE
    kde = gaussian_kde(data)
    x = np.linspace(min(data), max(data), 1000)
    y = kde(x)
    
    # Create plot
    fig = go.Figure()
    
    # Add density curve
    fig.add_trace(go.Scatter(x=x.tolist(), y=y.tolist(), fill='tozeroy', fillcolor=color, name=f'{title} Density'))
    
    # Add true value line
    fig.add_trace(
        go.Scatter(x=[true_value, true_value], y=[0, max(y)], mode='lines', line=dict(color='red', dash='dash'), name=true_label))
    
    # Add predicted value line
    fig.add_trace(
        go.Scatter(x=[predicted_value, predicted_value], y=[0, max(y)], mode='lines', line=dict(color='orange', dash='dash'), name=predicted_label))
    
    # Update layout
    fig.update_layout(
        title=f'Contact Result: {title} (True and Predicted)',
        height=400, width=575,
        xaxis_title=xaxis_title,
        yaxis_title=yaxis_title,
        annotations=[
            dict(
                x=true_value.tolist(),
                y=max(y),
                text=f'{true_label}: {true_value.tolist()}',
                showarrow=True,
                arrowhead=2,
                ax=0,
                ay=-40,
                font=dict(color='red')
            ),
            dict(
                x=predicted_value,
                y=max(y) * 0.8,
                text=f'{predicted_label}: {predicted_value:.2f}',
                showarrow=True,
                arrowhead=2,
                ax=0,
                ay=-80,
                font=dict(color='orange')
            )
        ],
        legend=dict(
            x=0.9,  # Horizontal position of the legend (0 to 1)
            y=0.1,  # Vertical position of the legend (0 to 1)
            traceorder='normal',
            font=dict(
                size=10,
                color='black'
            ),
            bgcolor='rgba(255, 255, 255, 0.5)',
            bordercolor='Black',
            borderwidth=2
        )
    )
    
    return {
        'data': [trace.to_plotly_json() for trace in fig.data], 
        'layout': fig.layout.to_plotly_json()
    }


def plot_launch_speed_distribution(hiteventId, sc_hit_preds, hit_contact, la_model, la_scaler_X, la_scaler_y, ev_model, ev_scaler_X, ev_scaler_y, change_in_z=None, change_in_bat_plane=None, change_in_bat_speed=None):
    la_cols = ['differential_z', 'bat_vel_at_contact_z']
    ev_cols = [
        'ball_pos_at_contact_x', 'ball_pos_at_contact_y', 'ball_pos_at_contact_z',
        'bat_pos_at_contact_x', 'bat_pos_at_contact_y', 'bat_pos_at_contact_z',
        'differential_x', 'differential_y', 'differential_z',
        'bat_vel_at_contact_x', 'bat_vel_at_contact_y', 'bat_vel_at_contact_z',
        'distance_from_handle', 'bat_speed_at_contact', 'angle_from_z'
    ]

    row = hit_contact[hit_contact['hiteventId'] == hiteventId]
    
    if row.empty:
        raise ValueError(f"hiteventId {hiteventId} not found in the dataframe.")
    
    row = row.iloc[0]

    tan=row['bat_vel_at_contact_z'] / row['bat_vel_at_contact_y']
    angle_radians = math.atan(tan)
    og_bat_plane = math.degrees(angle_radians)

    if change_in_bat_plane is None:
        bat_plane = og_bat_plane
    else:
        bat_plane = og_bat_plane + change_in_bat_plane

    if change_in_z is not None:
        row['differential_z'] += change_in_z
        row['bat_pos_at_contact_x'] += change_in_z
        row['bat_pos_at_contact_y'] += change_in_z
        row['bat_pos_at_contact_z'] += change_in_z
        row['bat_head_at_contact_x'] += change_in_z
        row['bat_head_at_contact_y'] += change_in_z
        row['bat_head_at_contact_z'] += change_in_z
        row['bat_handle_at_contact_x'] += change_in_z
        row['bat_handle_at_contact_y'] += change_in_z
        row['bat_handle_at_contact_z'] += change_in_z

    if change_in_bat_speed is not None:
        row['bat_vel_at_contact_z'] = row['bat_speed_at_contact'] * math.sin(math.radians(bat_plane))
    row['bat_vel_at_contact_y'] = row['bat_speed_at_contact'] * math.cos(math.radians(bat_plane))

    
    if ev_model is None:
        pred_vel = row['hitspeed_mph']
    else:
        X_new = row[ev_cols].values.reshape(1, -1)
        X_new_scaled = ev_scaler_X.transform(X_new)
        y_new_scaled = ev_model.predict(X_new_scaled)
        pred_vel = ev_scaler_y.inverse_transform(y_new_scaled.reshape(-1, 1)).flatten()[0]

    if la_model is not None:
        X_new = row[la_cols].values.reshape(1, -1)
        X_new_scaled = la_scaler_X.transform(X_new)
        y_new_scaled = la_model.predict(X_new_scaled).flatten()
        pred_angle = la_scaler_y.inverse_transform(y_new_scaled.reshape(-1, 1)).flatten()[0]
    else:
        pred_angle = row['hitangle2']
    
    # Extract the specific hit event data
    hit_event = hit_contact[hit_contact['hiteventId'] == hiteventId].iloc[0]
    hitspeed_mph = hit_event['hitspeed_mph']
    
    # Plot launch speed distribution
    fig_dict =  plot_distribution(
        sc_hit_preds['launch_speed'],
        hitspeed_mph,
        'rgba(0, 100, 255, 0.2)',
        'Exit Velocity',
        'Exit Velocity (mph)',
        'Density',
        hitspeed_mph,
        pred_vel,
        'Exit Velocity (True)',
        'Exit Velocity (Predicted)'
    )

    return fig_dict


def plot_launch_angle_distribution(hiteventId, sc_hit_preds, hit_contact, la_model, la_scaler_X, la_scaler_y, ev_model, ev_scaler_X, ev_scaler_y, change_in_z=None, change_in_bat_plane=None, change_in_bat_speed=None):
    la_cols = ['differential_z', 'bat_vel_at_contact_z']
    ev_cols = [
        'ball_pos_at_contact_x', 'ball_pos_at_contact_y', 'ball_pos_at_contact_z',
        'bat_pos_at_contact_x', 'bat_pos_at_contact_y', 'bat_pos_at_contact_z',
        'differential_x', 'differential_y', 'differential_z',
        'bat_vel_at_contact_x', 'bat_vel_at_contact_y', 'bat_vel_at_contact_z',
        'distance_from_handle', 'bat_speed_at_contact', 'angle_from_z'
    ]

    row = hit_contact[hit_contact['hiteventId'] == hiteventId]
    
    if row.empty:
        raise ValueError(f"hiteventId {hiteventId} not found in the dataframe.")
    
    row = row.iloc[0]

    tan=row['bat_vel_at_contact_z'] / row['bat_vel_at_contact_y']
    angle_radians = math.atan(tan)
    og_bat_plane = math.degrees(angle_radians)

    if change_in_bat_plane is None:
        bat_plane = og_bat_plane
    else:
        bat_plane = og_bat_plane + change_in_bat_plane
    
    if change_in_z is not None:
        row['differential_z'] += change_in_z
        row['bat_pos_at_contact_x'] += change_in_z
        row['bat_pos_at_contact_y'] += change_in_z
        row['bat_pos_at_contact_z'] += change_in_z
        row['bat_head_at_contact_x'] += change_in_z
        row['bat_head_at_contact_y'] += change_in_z
        row['bat_head_at_contact_z'] += change_in_z
        row['bat_handle_at_contact_x'] += change_in_z
        row['bat_handle_at_contact_y'] += change_in_z
        row['bat_handle_at_contact_z'] += change_in_z

    if change_in_bat_speed is not None:
        row['bat_speed_at_contact'] = row['bat_speed_at_contact'] + change_in_bat_speed

    row['bat_vel_at_contact_z'] = row['bat_speed_at_contact'] * math.sin(math.radians(bat_plane))
    row['bat_vel_at_contact_y'] = row['bat_speed_at_contact'] * math.cos(math.radians(bat_plane))
    
    if ev_model is None:
        pred_vel = row['hitspeed_mph']
    else:
        X_new = row[ev_cols].values.reshape(1, -1)
        X_new_scaled = ev_scaler_X.transform(X_new)
        y_new_scaled = ev_model.predict(X_new_scaled)
        pred_vel = ev_scaler_y.inverse_transform(y_new_scaled.reshape(-1, 1)).flatten()[0]

    if la_model is not None:
        X_new = row[la_cols].values.reshape(1, -1)
        X_new_scaled = la_scaler_X.transform(X_new)
        y_new_scaled = la_model.predict(X_new_scaled).flatten()
        pred_angle = la_scaler_y.inverse_transform(y_new_scaled.reshape(-1, 1)).flatten()[0]
    else:
        pred_angle = row['hitangle2']
    
    # Extract the specific hit event data
    hit_event = hit_contact[hit_contact['hiteventId'] == hiteventId].iloc[0]
    hitangle2 = hit_event['hitangle2']
    
    # Plot launch angle distribution
    fig_dict = plot_distribution(
        sc_hit_preds['launch_angle'],
        hitangle2,
        'rgba(255, 100, 0, 0.2)',
        'Launch Angle',
        'Launch Angle (degrees)',
        'Density',
        hitangle2,
        pred_angle,
        'Launch Angle (True)',
        'Launch Angle (Predicted)'
    )

    return fig_dict