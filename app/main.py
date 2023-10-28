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
    reactions = solver.calc_vertical_reaction(f_positions, b_position)
    response_data = {"code": 200, "resultant": solver.calc_resultant_force(), "reactions": reactions}
    return jsonify(response_data)   

@app.route("/get-distributed", methods=["POST"])
def send_distributed():
    data = request.get_json()  
    print(data)

    solver = StaticsSolver(forces=[], angles=[])
    r = {}
    
    if(data['type'] == 'rectangle'):
        r = solver.calc_distributed_force(forces_d = data['force'], x=data['distance'], type='rectangle')
        response_data = {"code": 200, "position": r['point'], "resultant": r['r_force']}

    elif(data['type'] == 'trapezoid'):
        solver = StaticsSolver(forces=[data['force'], data['forceMenor']], angles=[90,90])
        r = solver.calc_distributed_force(x=data['distance'], type='trapezoid', orientation=data['orientation'])
        response_data = {"code": 200, "positions": r['points'], "resultants": r['r_forces']}
    elif(data['type'] == 'triangle'):
        r = solver.calc_distributed_force(x=data['distance'], type='triangle', orientation=data['orientation'], force_t=data['force'])
        response_data = {"code": 200, "position": r['point'], "resultant": r['r_force']}

 
    
    print("RESPONSE DATA", response_data)
    return jsonify(response_data)

@app.route("/f_resutant", methods=["POST"])
def send_f_resultant():
    data = request.get_json()
    vectors = data['vectors']
    forces = []
    angles = []
    for i in vectors:
        forces.append(i['force'])
        angles.append(i['angle'])
    
    solver = StaticsSolver(forces=forces, angles=angles)
    r = solver.calc_resultant_force()

    response_data = {"code": 200, "resultant": r}

    return jsonify(response_data)

if __name__ == '__main__':
    app.run(debug=True)

