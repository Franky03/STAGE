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
            'a_reaction': b_reaction,
            'b_reaction': a_reaction
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
    
    def calc_distributed_force(self, x, type, orientation='right' ,**kwargs):
        """
        Distribute a force in a beam.
        :param force: list of forces
        :param x: length of the beam
        :param type: type of force distribution
        :param kwargs: keyword arguments (orientation for triangle force distribution)
        :return: dictionary with the resultant force and the point of application

        """
        forces = kwargs.get('forces_d')
        force_t = kwargs.get('force_t')
        
        if not isinstance(forces, list):
            forces = [forces]

        result = {}

        if type == 'triangle':
            orientation = orientation.lower()

            if orientation not in ['left', 'right']:
                raise ValueError("Invalid orientation for triangle force distribution.")

            r_force = x * force_t / 2
            
            if orientation == 'left':
                point = x/3
            elif orientation == 'right':
                point = x - x/3
            
            result = {
                "r_force": round(r_force, 4),
                "point": round(point, 4)
            }

        elif type == 'rectangle':

            r_force = x * forces[0]
            point = x/2

            result = {
                "r_force": round(r_force, 2),
                "point": round(point, 2)
            }

        elif type == 'trapezoid':
            # divide into triangle and rectangle
            force = self.forces[:2]
            force_triangle = max(force) - min(force)
            force_rectangle = min(force)

            print(force_triangle, force_rectangle, "FOces")

            # recursive call
            triangle = self.calc_distributed_force(x, 'triangle', orientation= orientation, force_t = force_triangle)
            rectangle = self.calc_distributed_force(x, 'rectangle', forces_d = [force_rectangle])

            r_forces = {'triangle': triangle['r_force'], 'rectangle': rectangle['r_force']}

            points = {'triangle': triangle['point'], 'rectangle': rectangle['point']}

            print("r_forces", r_forces, "points", points)

            result = {
                'r_forces': r_forces,
                'points': points
            }

        else:
            raise ValueError("Invalid type of force distribution.")
        
        return result

# class CentroidSolver:
class CentrodeMassa:

        def calcular_centro_de_massa(particulas):
            soma_massas = 0
            soma_x_pesos = 0
            soma_y_pesos = 0

            for particula in particulas:
                massa = particula['massa']
                x = particula['x']
                y = particula['y']

                soma_massas += massa
                soma_x_pesos += massa * x
                soma_y_pesos += massa * y

            centro_de_massa_x = soma_x_pesos / soma_massas
            centro_de_massa_y = soma_y_pesos / soma_massas

            return centro_de_massa_x, centro_de_massa_y

        # Exemplo de uso
        particulas = [
            {'massa': 2, 'x': 0, 'y': 0},
            {'massa': 3, 'x': 1, 'y': 2},
            {'massa': 5, 'x': 4, 'y': 1}
        ]

        centro_de_massa = calcular_centro_de_massa(particulas)
        print(f"Centro de Massa: ({centro_de_massa[0]}, {centro_de_massa[1]})")
class Centroide:
    def calcular_centroide_com_comprimentos(pontos, comprimentos):
        # Inicialize as somas para x, y, z e os somatórios dos comprimentos
        soma_x = 0
        soma_y = 0
        soma_z = 0
        soma_comprimentos = 0

        # Loop através dos pontos e comprimentos
        for ponto, comprimento in zip(pontos, comprimentos):
            x, y, z = ponto
            soma_x += x * comprimento
            soma_y += y * comprimento
            soma_z += z * comprimento
            soma_comprimentos += comprimento

        # Calcule o centroide
        centroide_x = soma_x / soma_comprimentos
        centroide_y = soma_y / soma_comprimentos
        centroide_z = soma_z / soma_comprimentos

        return centroide_x, centroide_y, centroide_z

    # Exemplo de uso
    pontos = [(0, 100, 0), (127.32, 127.32, 0), (200, 0, 200), (100, 0, 200)]
    comprimentos = [200, 314.15, 400, 447.21]
    centroide = calcular_centroide_com_comprimentos(pontos, comprimentos)
    print(f"Centroide: ({centroide[0]}, {centroide[1]}, {centroide[2]})")