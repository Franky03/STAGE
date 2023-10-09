import math as m

class StaticsSolver:

    def __init__(self, forces, angles):
        self.forces = forces
        self.angles = angles
        self.x_components = [force * m.cos(m.radians(angle)) for force, angle in zip(self.forces, self.angles)]
        self.y_components = [force * m.sin(m.radians(angle)) for force, angle in zip(self.forces, self.angles)]

    
    def calc_resultant_force(self):
        x_component = sum(self.x_components)
        y_component = sum(self.y_components)

        resultant_magnitude = m.sqrt(x_component**2 + y_component**2)
        resultant_direction = m.degrees(m.atan2(y_component, x_component))

        return {
            "x_component": x_component,
            "y_component": y_component,
            "resultant_magnitude": resultant_magnitude,
            "resultant_direction": resultant_direction
        }
    
    def calc_moment(self, f_positions):

        if not isinstance(f_positions, list):
            f_positions = [f_positions]

        if len(self.forces) != len(f_positions):
            raise ValueError("The number of forces and positions must be equal.")
        
        moments = [force * f_position for force, f_position in zip(self.y_components, f_positions)]

        return sum(moments)
    
    def calc_vertical_reaction(self, f_positions, b_position):

        if not isinstance(f_positions, list):
            f_positions = [f_positions]

        if len(self.forces) != len(f_positions):
            raise ValueError("The number of forces and positions must be equal.")

        b_reaction =  (- self.calc_moment(f_positions)) / b_position
        a_reaction = (self.calc_resultant_force()['y_component']) - b_reaction

        return {
            'a_reaction': a_reaction,
            'b_reaction': b_reaction
        }

    def calc_horizontal_reaction(self, f_positions, b_position, **kwargs):
        if len(self.x_components) == 0:
            return 0
        
        if not isinstance(f_positions, list):
            f_positions = [f_positions]
        
        if len(self.forces) != len(f_positions):
            raise ValueError("The number of forces and positions must be equal.")
        
        num_horizontal_reactions = kwargs.get('num_horizontal_reactions')

        if num_horizontal_reactions > 1:
            raise ValueError("The number of horizontal reactions must be 0 or 1.")
        
        h_reaction =  - sum(self.x_components)

        return h_reaction
    
    def calc_distributed_force(self, x, type, **kwargs):
        """
        Distribute a force in a beam.
        :param force: list of forces
        :param x: length of the beam
        :param type: type of force distribution
        :param kwargs: keyword arguments (orientation for triangle force distribution)
        :return: dictionary with the resultant force and the point of application

        """
        
        if not isinstance(self.forces, list):
            self.forces = [self.forces]

        result = {}

        if type == 'triangle':
            orientation = kwargs.get('orientation')

            if orientation not in ['left', 'right']:
                raise ValueError("Invalid orientation for triangle force distribution.")

            r_force = x * self.forces[0] / 2
            
            if orientation == 'left':
                point = x/3
            elif orientation == 'right':
                point = x - x/3
            
            result = {
                "r_force": round(r_force, 4),
                "point": round(point, 4)
            }

        elif type == 'rectangle':
            r_force = x * self.forces[0]
            point = x/2

            result = {
                "r_force": round(r_force, 4),
                "point": round(point, 4)
            }

        elif type == 'trapezoid':
            # divide into triangle and rectangle
            force = self.forces[:2]
            force_triangle = max(force) - min(force)
            force_rectangle = min(force)

            # recursive call
            triangle = self.calc_distributed_force(x, 'triangle', orientation= kwargs.get('orientation'))
            rectangle = self.calc_distributed_force(x, 'rectangle')

            r_forces = {'triangle': triangle['r_force'], 'rectangle': rectangle['r_force']}

            points = {'triangle': triangle['point'], 'rectangle': rectangle['point']}

            result = {
                'r_force': r_forces,
                'point': points
            }

        else:
            raise ValueError("Invalid type of force distribution.")
        
        return result

class CentroidSolver:
    