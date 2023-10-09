import sys
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.dirname(SCRIPT_DIR))

from utils import *

forces = [20, 30, 40]
angles = [30, 45, 60]

result = calc_resultant_force(forces, angles)
print(result)

# força distribuida

force = [10, 20]
x = 10

result = distribute_force(force, x, 'trapezoid', orientation='left')
print(result)