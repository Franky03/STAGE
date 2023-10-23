from flask import render_template, request, Flask, jsonify
import sys
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.dirname(SCRIPT_DIR))

from utils import StaticsSolver


app = Flask(__name__, template_folder='templates')

@app.route('/')
def index():
    return render_template('index.html')

@app.route("/get-vectors", methods=["POST"])
def send_data():
    data = request.get_json()  
    print(data)
   
    vectors = data['vectors']
    f_positions = data['f_positions']
    b_position = data['b_position']

    print(f_positions, "Posições das forças")
    print(b_position, "Posição do suporte b")

    forces = []
    angles = []
    for i in vectors:
        forces.append(i['force'])
        angles.append(i['angle'])
    print(forces)
    print(angles)

    solver = StaticsSolver(forces=forces, angles=angles)
    print(solver.calc_resultant_force())

    #calcula o momento 
    reactions = solver.calc_vertical_reaction(f_positions, b_position)
 
    response_data = {"code": 200, "resultant": solver.calc_resultant_force(), "reactions": reactions}
    return jsonify(response_data)   

if __name__ == '__main__':
    app.run(debug=True)

