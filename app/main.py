import sys
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.dirname(SCRIPT_DIR))

from utils import StaticsSolver

solver = StaticsSolver(forces=[8000, -3000], angles=[90, 90])

print(solver.calc_resultant_force())

distances_a = [2, 6]
print(solver.calc_moment(distances_a))

print(
    solver.calc_vertical_reaction(
        f_positions=[2, 6],
        b_position=4
    )
)

 