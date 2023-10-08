import math as m

def calc_resultant_force(forces: list, angles: list):
    if len(forces) != len(angles):
        raise ValueError("The number of forces and angles must be equal.")
    
    x_component = 0
    y_component = 0

    for index, force in enumerate(forces):

        angles[index] = m.radians(angles[index]) # Convert to radians

        x_component += force * m.cos(angles[index])
        y_component += force * m.sin(angles[index])
        print(f"X: {x_component}, Y: {y_component}")
        

    x_component = round(x_component, 4)
    y_component = round(y_component, 4)


    resultant_magnitude = m.sqrt(x_component**2 + y_component**2)
    resultant_magnitude = round(resultant_magnitude, 4)

    resultant_direction = 0.0

    if x_component == 0.0 and y_component == 0.0:
        resultant_direction = 0.0
    elif x_component == 0.0 and y_component > 0.0:
        resultant_direction = 90.0
    elif x_component == 0.0 and y_component < 0.0:
        resultant_direction = -90.0
    else:
        resultant_direction = m.atan2(y_component, x_component)
        resultant_direction = m.degrees(resultant_direction)
    
    return {
        "x_component": x_component,
        "y_component": y_component,
        "resultant_magnitude": resultant_magnitude,
        "resultant_direction": resultant_direction
    }

