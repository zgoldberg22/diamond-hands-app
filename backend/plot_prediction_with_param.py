import math
import numpy as np
import plotly.graph_objects as go
import pandas as pd
import sklearn
import pickle
import os
import json

def plot_contact_pred(hiteventId, bat_tracking, hit_contact, la_model, sc_hit_preds, ev_model=None, change_in_z=None, bat_angle=None, change_in_bat_speed=None, bat_radius=0.219816 / 2, ball_radius=0.242782 / 2):
    # Define radii
    fig = go.Figure()

    # Filter for the specific hiteventId
    one_bat = bat_tracking[bat_tracking['hiteventId'] == hiteventId]
    new_bat = hit_contact[hit_contact['hiteventId'] == hiteventId]

    if bat_angle is None:
        tan=new_bat['bat_vel_at_contact_x'].iloc[0] / new_bat['bat_vel_at_contact_y'].iloc[0]
        angle_radians = math.atan(tan)
        
        # Convert the angle from radians to degrees
        bat_angle = math.degrees(angle_radians)
    #else:
        #bat_vel_z = hit_contact['bat_speed_at_contact'] * math.sin(math.radians(bat_angle))

    if change_in_z is None:
        diff_z = new_bat['differential_z'].iloc[0]
    else:
        diff_z = new_bat['differential_z'].iloc[0] + change_in_z

    if change_in_bat_speed is None:
        bat_speed = new_bat['bat_speed_at_contact'].iloc[0]
        bat_vel_z = new_bat['bat_vel_at_contact_z'].iloc[0]
    else:
        bat_speed = new_bat['bat_speed_at_contact'].iloc[0] + change_in_bat_speed
        bat_vel_z = bat_speed * math.sin(math.radians(bat_angle))
    
    #if ev_model is None:
    pred_vel = new_bat['hitspeed_mph'].iloc[0]

    pred_angle = la_model.predict([[diff_z, bat_vel_z]])[0]

    same_specs = sc_hit_preds[(sc_hit_preds['launch_speed'].round() == pred_vel.round()) & (sc_hit_preds['launch_angle'] == pred_angle.round())]
    hit_prob = 1 - same_specs['out'].mean()

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
    annotation_text = f"Predicted Hit Speed: {hitspeed:.2f} mph<br>Horizontal Exit Angle: {hitangle1:.2f}°<br>Predicted Vertical Exit Angle: {pred_angle:.2f}°<br>Actual Vertical Exit Angle: {new_bat['hitangle2'].iloc[0]:.2f}<br>Outs on Play: {new_bat['outsplay'].iloc[0]:.2f}<br>Hit Probability: {hit_prob:.2f}"
    fig.add_trace(go.Scatter3d(
        x=[ball_contact[0]], y=[ball_contact[1]], z=[ball_contact[2]],
        mode='text',
        text=[annotation_text],
        textposition='top right',
        name='Hit Info'
    ))

    
    # Set plot layout
    fig.update_layout(
        scene=dict(
            xaxis_title='X Axis',
            yaxis_title='Y Axis',
            zaxis_title='Z Axis'
        ),
        title='3D Scatter Plot of Bat Points with Ball Exit Direction',
        title_x=0.5,
        showlegend=True, 
        width=575
    )

    

    # Show the plot
    return fig




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
