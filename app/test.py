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
   
    forces = []
    angles = []
    for i in data:
        forces.append(i['force'])
        angles.append(i['angle'])
    print(forces)
    print(angles)

    solver = StaticsSolver(forces=forces, angles=angles)
    print(solver.calc_resultant_force())
 
    response_data = {"message": "Dados recebidos com sucesso!"}
    return jsonify(response_data)

if __name__ == '__main__':
    app.run(debug=True)

