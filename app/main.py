import sys
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.dirname(SCRIPT_DIR))

from utils import calc_resultant_force

forces = [20, 30, 40]
angles = [30, 45, 60]

result = calc_resultant_force(forces, angles)
print(result)
