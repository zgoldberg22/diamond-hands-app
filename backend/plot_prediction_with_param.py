import math
import numpy as np
import plotly.graph_objects as go
import pandas as pd
import sklearn
import pickle
import os
import json
import plotly.io as pio

def plot_contact_pred(hiteventId, bat_tracking, hit_contact, sc_hit_preds, la_model, la_scaler_X, la_scaler_y, ev_model, ev_scaler_X, ev_scaler_y, change_in_z=None, bat_plane=None, change_in_bat_speed=None, bat_radius=0.219816 / 2, ball_radius=0.242782 / 2):
    # Calculate new params for the model based on adjusted (or not adjusted) params
    la_cols = ['differential_z', 'bat_vel_at_contact_z']
    ev_cols = [
        'ball_pos_at_contact_x', 'ball_pos_at_contact_y', 'ball_pos_at_contact_z',
        'bat_pos_at_contact_x', 'bat_pos_at_contact_y', 'bat_pos_at_contact_z',
        'differential_x', 'differential_y', 'differential_z',
        'bat_vel_at_contact_x', 'bat_vel_at_contact_y', 'bat_vel_at_contact_z',
        'distance_from_handle', 'bat_speed_at_contact', 
        'angle_from_z'#, 'distance_from_handle'
    ]

    fig = go.Figure()

    # Filter for the specific hiteventId
    one_bat = bat_tracking[bat_tracking['hiteventId'] == hiteventId]
    new_bat = hit_contact[hit_contact['hiteventId'] == hiteventId]

    if bat_plane is None:
        tan=new_bat['bat_vel_at_contact_x'].iloc[0] / new_bat['bat_vel_at_contact_y'].iloc[0]
        angle_radians = math.atan(tan)
        bat_plane = math.degrees(angle_radians)
        
        # Convert the angle from radians to degrees
        bat_angle = math.degrees(angle_radians)
    #else:
        #bat_vel_z = hit_contact['bat_speed_at_contact'] * math.sin(math.radians(bat_angle))

    if change_in_z is not None:
        new_bat['differential_z'].iloc[0] = new_bat['differential_z'].iloc[0] + change_in_z
        new_bat['bat_pos_at_contact_x'].iloc[0] = new_bat['bat_pos_at_contact_x'].iloc[0] + change_in_z
        new_bat['bat_pos_at_contact_y'].iloc[0] = new_bat['bat_pos_at_contact_y'].iloc[0] + change_in_z
        new_bat['bat_pos_at_contact_z'].iloc[0] = new_bat['bat_pos_at_contact_z'].iloc[0] + change_in_z
        new_bat['bat_head_at_contact_x'].iloc[0] = new_bat['bat_head_at_contact_x'].iloc[0] + change_in_z
        new_bat['bat_head_at_contact_y'].iloc[0] = new_bat['bat_head_at_contact_y'].iloc[0] + change_in_z
        new_bat['bat_head_at_contact_z'].iloc[0] = new_bat['bat_head_at_contact_z'].iloc[0] + change_in_z
        new_bat['bat_handle_at_contact_x'].iloc[0] = new_bat['bat_handle_at_contact_x'].iloc[0] + change_in_z
        new_bat['bat_handle_at_contact_y'].iloc[0] = new_bat['bat_handle_at_contact_y'].iloc[0] + change_in_z
        new_bat['bat_handle_at_contact_z'].iloc[0] = new_bat['bat_handle_at_contact_z'].iloc[0] + change_in_z

    if change_in_bat_speed is not None:
        new_bat['bat_speed_at_contact'].iloc[0] = new_bat['bat_speed_at_contact'].iloc[0] + change_in_bat_speed
        new_bat['bat_vel_at_contact_z'].iloc[0] = new_bat['bat_speed_at_contact'].iloc[0] * math.sin(math.radians(bat_plane))
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
    fig.add_trace(go.Surface(x=X.tolist(), y=Y.tolist(), z=Z.tolist(), colorscale=[[0, 'red'], [1,'red']], showscale=False))

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
    fig.add_trace(go.Surface(x=x_sphere.tolist(), y=y_sphere.tolist(), z=z_sphere.tolist(), colorscale='reds', showscale=False))

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
    fig.add_trace(go.Scatter3d(
        x=[ball_contact[0], ball_contact[0] + vx],
        y=[ball_contact[1], ball_contact[1] + vy],
        z=[ball_contact[2], ball_contact[2] + vz],
        mode='lines+markers',
        line=dict(color='orange', width=5),
        marker=dict(size=1, color='orange'),
        name='Ball Exit Vector'
    ))

    strike_zone = go.Mesh3d(
        x=[-1, 1, 1, -1],
        y=[0, 0, 0, 0],
        z=[1.5, 1.5, 3.75, 3.75],
        opacity=0.8,
        color='green',
        name='Strike Zone'
    )
    fig.add_trace(strike_zone)

    inch_to_foot = 1/12
    thickness = .03

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

    # return fig

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

    
    




# def get_json(file_name):
#     root = os.path.realpath(os.path.dirname(__file__))
#     full_file_path = os.path.join(root, file_name)

#     data = {}
#     with open(full_file_path, 'r') as f: 
#         data = json.load(f)

#     data_df = pd.DataFrame(data)

#     return data_df


# with open('la_model.pkl', 'rb') as f:
#     la_model_data = pickle.load(f)

# bat_tracking = get_json("bat_tracking_hits.json")
# hit_contact = get_json("hit_contact.json")
# hits_data = get_json("sc_data.json")

# plot_contact_pred('3cf58297-bb6f-4ba4-973a-56b849926fcb', bat_tracking, hit_contact, la_model_data, hits_data, ev_model=None, change_in_z=None, bat_angle=None, change_in_bat_speed=None)
