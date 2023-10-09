import math as m

def calc_resultant_force(forces: list, angles: list):
    """
    Calculate the resultant force of a system of forces.
    :param forces: list of forces
    :param angles: list of angles
    :return: dictionary with the x and y components, the resultant magnitude and the resultant direction
    """
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

def distribute_force(force: list, x: float, type: str, **kwargs):
    """
    Distribute a force in a beam.
    :param force: list of forces
    :param x: length of the beam
    :param type: type of force distribution
    :param kwargs: keyword arguments (orientation for triangle force distribution)
    :return: dictionary with the resultant force and the point of application

    """
    
    if not isinstance(force, list):
        force = [force]

    result = {}

    if type == 'triangle':
        orientation = kwargs.get('orientation')

        if orientation not in ['left', 'right']:
            raise ValueError("Invalid orientation for triangle force distribution.")

        r_force = x * force[0] / 2
        
        if orientation == 'left':
            point = x/3
        elif orientation == 'right':
            point = x - x/3
        
        result = {
            "r_force": round(r_force, 4),
            "point": round(point, 4)
        }

    elif type == 'rectangle':
        r_force = x * force[0]
        point = x/2

        result = {
            "r_force": round(r_force, 4),
            "point": round(point, 4)
        }

    elif type == 'trapezoid':
        # divide into triangle and rectangle
        force = force[:2]
        force_triangle = max(force) - min(force)
        force_rectangle = min(force)

        # recursive call
        triangle = distribute_force([force_triangle], x, 'triangle', orientation= kwargs.get('orientation'))
        rectangle = distribute_force([force_rectangle], x, 'rectangle')

        r_forces = {'triangle': triangle['r_force'], 'rectangle': rectangle['r_force']}

        points = {'triangle': triangle['point'], 'rectangle': rectangle['point']}

        result = {
            'r_force': r_forces,
            'point': points
        }

    else:
        raise ValueError("Invalid type of force distribution.")
    
    return result

def calc_moment(force: list, f_positions: list, **kwargs):

    if not isinstance(force, list):
        force = [force]

    if not isinstance(f_positions, list):
        f_positions = [f_positions]

    if len(force) != len(f_positions):
        raise ValueError("The number of forces and positions must be equal.")

    result = 0

    for index, f in enumerate(force):
        result += f * f_positions[index]

    return result