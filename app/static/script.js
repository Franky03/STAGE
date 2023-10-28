const canvas = document.getElementById('vector-canvas');
const context = canvas.getContext('2d');
const forceInput = document.getElementById('force-input');
const angleInput = document.getElementById('angle-input');
const addVectorButton = document.getElementById('add-vector');
const undoVectorButton = document.getElementById('undo-vector');
const clearVectorsButton = document.getElementById('clear-vectors');
const comprimentoRange = document.getElementById('comprimento-range');

let rectangleForce = {};  // Variáveis para força retangular
let triangleForce = {};   // Variáveis para força triangular
let trapezoidForce = {};  // Variáveis para força trapezoidal

const vectors = [];

let isAddingVectors = false;
let barraAdicionada = false;
let trianguloAdicionado = false;

let isDraggingTriangleRec = false;

let triangleSize = 80; // Tamanho do triângulo

let selectedOriginX = null;
let selectedOriginY = null;
const ctx = canvas.getContext('2d');
let isDragging = false;
let isDraggingTriangle = false;
let offsetX = 0;
let offsetY = 0;
let offsetX_T = 0;
let offsetY_T = 0;
let barraX = canvas.width/2;  // Posição inicial da barra
let barraY = canvas.height/2 - 20;
let barraComprimento = 300;
let barraAltura = 20;

var triangleX = canvas.width/2; // Coordenada X do vértice superior do triângulo
var triangleY = canvas.height/2 - 20; // Coordenada Y do vértice superior do triângulo
var triangleBase = 20; // Largura da base do triângulo
var triangleHeight = 20; // Altura do triângulo

const triangles = [];
const maxTriangles = 2;

let kn = false;
let lastSupportPosition = null;

let data_to_tensor = {
    vectors: vectors,
    f_positions: [],
    b_position: [],
}

let clickX = null;
let clickY = null;
let isClicking = false;
let isClickingTrap = false;
let isClinckingTriangle = false;

let axesL = 50;

updateCanvas();

comprimentoRange.addEventListener('input', () => {
    // Obtenha o valor do controle deslizante
    const novoComprimento = parseInt(comprimentoRange.value);

    // Atualize o comprimento da barra
    barraComprimento = novoComprimento;

    // Redesenhe a barra
    updateCanvas();
});

// Barra
canvas.addEventListener('mousedown', (e) => {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;

    // Verifique se o clique foi dentro da barra
    if (mouseX >= barraX && mouseX <= barraX + barraComprimento && mouseY >= barraY && mouseY <= barraY + barraAltura) {
        isDragging = true;
        offsetX = mouseX - barraX;
        offsetY = mouseY - barraY;
    }
});

// Barra
canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const mouseX = e.clientX - canvas.getBoundingClientRect().left;
        const mouseY = e.clientY - canvas.getBoundingClientRect().top;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Atualize a posição da barra com base no movimento do mouse
        barraX = mouseX - offsetX;
        barraY = mouseY - offsetY;
        drawBarra();
        updateCanvas();
    }
});

// Triângulo
canvas.addEventListener('mousedown', (e) => {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;

    for (const triangle of triangles) {
        if (mouseX >= triangle.x && mouseX <= triangle.x + triangle.base && mouseY >= triangle.y && mouseY <= triangle.y + triangle.height) {
            isDraggingTriangle = true;
            offsetX_T = mouseX - triangle.x;
            offsetY_T = mouseY - triangle.y;
        }
    }
});

// Triângulo
canvas.addEventListener('mousemove', (e) => {
    if (isDraggingTriangle) {
        const mouseX = e.clientX - canvas.getBoundingClientRect().left;
        const mouseY = e.clientY - canvas.getBoundingClientRect().top;

        const movingTriangle = triangles.find((triangle) => {
            return (
                mouseX >= triangle.x &&
                mouseX <= triangle.x + triangle.base &&
                mouseY >= triangle.y &&
                mouseY <= triangle.y + triangle.height
            );
        });

        if (movingTriangle) {
            movingTriangle.x = mouseX - offsetX_T;
            movingTriangle.y = mouseY - offsetY_T;
            updateCanvas();
        }
    }
});


function drawSupport(triangle) {
    ctx.beginPath();
    ctx.moveTo(triangle.x, triangle.y + triangle.height); // Vértice inferior
    ctx.lineTo(triangle.x + triangle.base, triangle.y + triangle.height); // Vértice direito
    ctx.lineTo(triangle.x + (triangle.base / 2), triangle.y); // Vértice superior
    ctx.closePath();

    ctx.fillStyle = '#27374D';
    ctx.fill();
    ctx.stroke();
}
 

function addSupport(x, y) {
    if (triangles.length < maxTriangles) {
        let overlap = false;
        const newTriangle = { x, y, base: 20, height: 24 }; // Defina a base e altura desejadas

        // Verifique se a nova posição se sobrepõe a algum triângulo existente
        for (const triangle of triangles) {
            if (
                x < triangle.x + triangle.base &&
                x + newTriangle.base > triangle.x &&
                y < triangle.y + triangle.height &&
                y + newTriangle.height > triangle.y
            ) {
                overlap = true;
                break;
            }
        }

        if (!overlap) {
            triangles.push(newTriangle);
            updateCanvas();
        } else {
            alert("Triângulos não podem se sobrepor.");
        }

        if(triangles.length == maxTriangles){
            document.getElementById('add-support').classList.add('cuidado');
        }

    } else {
        alert("Você só pode adicionar 2 suportes.");
    }
}

document.getElementById('add-support').addEventListener('click', () => {
    addSupport(canvas.width/2 - 20, canvas.height/2 -20);
});

canvas.addEventListener('mouseup', () => {
    isDraggingTriangle = false;
    lastSupportPosition = Math.max(...triangles.map(triangle => triangle.x + triangle.base/2));
    // diminuir a posição do ultimo suporte - a posição do suporte anterior
    // para obter a distância entre os suportes

    lastSupportPosition -= Math.min(...triangles.map(triangle => triangle.x + triangle.base/2));

});


canvas.addEventListener('mouseup', () => {
    isDragging= false;
});



document.getElementById("toggle-add-vector").addEventListener("click", () => {
    isAddingVectors = !isAddingVectors; // Inverta o estado
    if (isAddingVectors) {
        document.getElementById("toggle-add-vector").textContent = "Parar Vetores";
    } else {
        document.getElementById("toggle-add-vector").textContent = "Adicionar Vetores";
    }
});


canvas.addEventListener('click', (event) => {
    if (isAddingVectors) {
        const rect = canvas.getBoundingClientRect();
        const originX = event.clientX - rect.left;
        const originY = event.clientY - rect.top;
        console.log(originX, originY);

        const force = parseFloat(forceInput.value);
        const angle = parseFloat(angleInput.value);

        if (!isNaN(force) && !isNaN(angle)) {
            const radians = (angle * Math.PI) / 180;
            
            const x = force * Math.cos(radians);
            const y = force * Math.sin(radians);

            const adjustedOriginX = originX - x * 6;
            const adjustedOriginY = originY - y * 6;

            vectors.push({ x, y, force, angle, originX: adjustedOriginX, originY: adjustedOriginY });
            
            updateCanvas();
        }
    }


    else if(isClicking){
        const rect = canvas.getBoundingClientRect();
        clickX = event.clientX - rect.left;
        clickY = event.clientY - rect.top;

        isClicking = !isClicking;
        recDist.click();
    }

    else if(isClickingTrap){
        const rect = canvas.getBoundingClientRect();
        clickX = event.clientX - rect.left;
        clickY = event.clientY - rect.top;

        isClickingTrap = !isClickingTrap;
        trapDist.click();
    }

    else if(isClinckingTriangle){
        const rect = canvas.getBoundingClientRect();
        clickX = event.clientX - rect.left;
        clickY = event.clientY - rect.top;

        isClinckingTriangle = !isClinckingTriangle;
        triDist.click();
    }

});

undoVectorButton.addEventListener('click', () => {
    if (vectors.length > 0) {
        vectors.pop();
        updateCanvas();
    }
});

clearVectorsButton.addEventListener('click', () => {
    vectors.length = 0;
    updateCanvas();
});


function drawBarra() {
    // Desenhe a barra como retângulo
    context.fillStyle = '#686D76'; // Cor da barra
    context.fillRect(barraX, barraY, barraComprimento, barraAltura);
    context.stroke();
}

function addBarra() {
    if (barraAdicionada) {
        // Se a barra já estiver presente, remova-a
        barraAdicionada = false;
        document.getElementById('choice-fig-bar').classList.remove('has-bar'); // Remove a classe
    } else {
        // Se a barra não estiver presente, adicione-a
        barraAdicionada = true;
        document.getElementById('choice-fig-bar').classList.add('has-bar'); // Adiciona a classe
    }

    // Chama a função de atualização do canvas para redesenhar tudo
    toggleComprimentoRangeVisibility(); 
    updateCanvas();
}

function toggleComprimentoRangeVisibility() {
    const comprimentoRange = document.getElementById('div-range');
    if (barraAdicionada) {
        comprimentoRange.classList.remove('hidden');
    } else {
        comprimentoRange.classList.add('hidden');
    }
}


document.getElementById('choice-fig-bar').addEventListener('click', addBarra);

let randomPositionsList = [];

function drawVector(x, y, force, originX, originY, color = "black", is_reaction=null, fillwhere=null, is_resultant=null) {
    
    const vectorScale = 6;
    const arrowSize = 6;

    // Check if the force is greater than 100 N.

    const arrowX = originX + x * vectorScale;
    let arrowY = originY + y * vectorScale;
    

    context.beginPath();
    context.strokeStyle = is_reaction || is_resultant ? "#19D3DA" : color;
    
    context.moveTo(originX, originY);
    context.lineTo(arrowX, arrowY);
    context.stroke();

    const angle = Math.atan2(y, x);

    context.beginPath();
    context.moveTo(arrowX, arrowY);
    context.lineTo(arrowX - arrowSize * Math.cos(angle - Math.PI / 6), arrowY - arrowSize * Math.sin(angle - Math.PI / 6));
    context.lineTo(arrowX - arrowSize * Math.cos(angle + Math.PI / 6), arrowY - arrowSize * Math.sin(angle + Math.PI / 6));
    context.closePath();
    context.fill();

    context.font = "14px Arial";
    context.fillStyle = color;

    // GERAR UM NUMERO ALEATORIO ENTRE 30 E 270
    let randomPosition = Math.floor(Math.random() * (270 - 30 + 1) + 30);

    while(randomPositionsList.includes(randomPosition)){
        randomPosition = Math.floor(Math.random() * (270 - 30 + 1) + 30);
    }

    randomPositionsList.push(randomPosition);


    if (force >= 45 && !is_resultant) {
        // If the force is greater than 100 N, display the scaled force value in kN.
        context.fillText(`${force.toFixed(2)/1000}kN`, originX, randomPosition);
    } else {
        // Otherwise, display the original force value in N.
        if(fillwhere){
            context.fillText(`${force.toFixed(2)}N`, originX, fillwhere);
        }
        else{
            context.fillText(`${force.toFixed(2)}N`, originX, originY);
        }
        
    }

}

function drawAxes() {
    const axisColor = "#999";
    const labelColor = "#000";

    // Eixo X (horizontal)
    context.strokeStyle = axisColor;
    context.beginPath();
    context.moveTo(0, canvas.height / 2);
    context.lineTo(canvas.width, canvas.height / 2);
    context.stroke();

    // Rótulos no eixo X
    const stepX = canvas.width / axesL   ; // Espaçamento entre os rótulos

    for (let x = stepX; x < canvas.width; x += stepX) {
        context.beginPath();
        context.moveTo(x, canvas.height / 2 - 5);
        context.lineTo(x, canvas.height / 2 + 5);
        context.stroke();

        context.fillStyle = labelColor;
        context.font = "10px Arial"; // Defina o tamanho e a fonte do rótulo
        context.fillText((x - canvas.width / 2) / (canvas.width / 100), x - 3, canvas.height / 2 + 15);
    }

    // Eixo Y (vertical)
    context.beginPath();
    context.moveTo(canvas.width / 2, 0);
    context.lineTo(canvas.width / 2, canvas.height);
    context.stroke();

    // Rótulos no eixo Y
    const stepY = canvas.height / 20; // Espaçamento entre os rótulos

    for (let y = stepY; y < canvas.height; y += stepY) {
        context.beginPath();
        context.moveTo(canvas.width / 2 - 5, y);
        context.lineTo(canvas.width / 2 + 5, y);
        context.stroke();

        context.fillStyle = labelColor;
        context.font = "10px Arial"; // Defina o tamanho e a fonte do rótulo
        context.fillText((canvas.height / 2 - y) / (canvas.height / 100), canvas.width / 2 - 30, y + 5);
    }
}

function updateCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    drawAxes(); // Desenha o plano cartesiano
    drawVectors(); // Desenha os vetores

    if (barraAdicionada) {
        drawBarra();
    }

    if(trianguloAdicionado){
        drawRightTriangle();
    }

    for (const triangle of triangles) {
        drawSupport(triangle);
    }
}

function drawVectors() {
    for (const vector of vectors) {
        drawVector(vector.x, vector.y, vector.force, vector.originX, vector.originY);
    }
}


function drawResultantVector(resultantVector) {
    const resultantMagnitude = document.getElementById("resultant-magnitude");
    const resultantDirection = document.getElementById("resultant-direction");

    // arredondar a magnitude para 2 casas decimais
    resultantMagnitude.textContent = `Magnitude: ${resultantVector.resultant_magnitude.toFixed(2)}`;

    resultantDirection.textContent = `Direction: ${resultantVector.resultant_direction.toFixed(2)}°`;

    // Agora você pode desenhar o vetor no Canvas usando as informações do resultado
    const magnitude = resultantVector.resultant_magnitude; // Use a magnitude para definir o comprimento do vetor
    const direction = resultantVector.resultant_direction; // Use a direção para definir o ângulo do vetor

    const radians = (direction * Math.PI) / 180; // Converter graus em radianos
    const x = magnitude * Math.cos(radians);
    const y = magnitude * Math.sin(radians);

    // Desenhe o vetor no Canvas, você pode usar a função drawVector que você já tem
    drawVector(x, y, magnitude, triangles[0].x + 10, triangles[0].y);
}

function drawReactions(reactions){
    // Desenhe as reações no Canvas
    const reactionA = reactions.a_reaction;
    const reactionB = reactions.b_reaction;

    console.log(reactionA, reactionB, "REAÇÕES")


    drawVector(0, reactionA * -1, reactionA, triangles[0].x + triangles[0].base/2, triangles[0].y, "#19D3DA", true);
    drawVector(0, reactionB * -1, reactionB, triangles[1].x + triangles[1].base/2, triangles[1].y, "#19D3DA", true);

}

document.getElementById("get-vectors").addEventListener("click", function () {

    forcePositions = vectors.map((vector) => {
        return Math.abs(lastSupportPosition - vector.originX);
    });

    // retirar também o x do primeiro suporte das forcesPositions

    forcePositions = forcePositions.map((position) => {
        return position - Math.min(...triangles.map(triangle => triangle.x + triangle.base/2));
    });

    data_to_tensor = {
        vectors: vectors,
        f_positions: forcePositions,
        b_position: lastSupportPosition,
    }
    
    // Realizar uma solicitação POST ao servidor Flask
    fetch("/get-vectors", {
        method: "POST",
        body: JSON.stringify(data_to_tensor),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => response.json())
    .then(result => {
        // Manipular a resposta do Flask (se necessário)
        console.log(result, "RESULTADO");
        if(result){
            drawReactions(result.reactions);
        }
        // if (result.resultant) {
        //     drawResultantVector(result.resultant);
        // }
    })
    .catch(error => {
        console.error("Erro ao enviar dados:", error);
    });
});

let forceType = null;

var modal = document.getElementById("myModal");
var closeModalButton = document.getElementById("closeModal");

var recDist = document.getElementById('add-rectangle');
var triDist = document.getElementById('add-triangle');
var trapDist = document.getElementById('add-trapezoid');

function deactiveButtons(){
    recDist.classList.remove('modal-on');
    triDist.classList.remove('modal-on');
    trapDist.classList.remove('modal-on');
}

recDist.addEventListener('click', function(){

    document.getElementById('force-menor-input-distributed').style.display = 'none'; // Ocultar o campo
    document.getElementById('orientation').style.display = 'none';
    document.getElementById("modal-content-change").style.height = "30%"
    recDist.classList.add('modal-on');
    isClicking = !isClicking;

    // esperar o click do mouse e só abrir o modal depois
    if(clickX && clickY){
        modal.style.display = "block";
    }
    
    forceType = 'rectangle';
    
})


triDist.addEventListener('click', function(){
    document.getElementById('force-menor-input-distributed').style.display = 'none'; // Ocultar o campo
    document.getElementById('orientation').style.display = 'block';
    document.getElementById("modal-content-change").style.height = "40%"
    triDist.classList.add('modal-on');

    isClinckingTriangle = !isClinckingTriangle;

    if(clickX && clickY){
        modal.style.display = "block";
    }

    forceType = 'triangle';
    
})

trapDist.addEventListener('click', function(){
    document.getElementById('force-menor-input-distributed').style.display = 'block';
    document.getElementById('orientation').style.display = 'block';
    document.getElementById("modal-content-change").style.height = "48%"
    trapDist.classList.add('modal-on');

    isClickingTrap = !isClickingTrap;

    // esperar o click do mouse e só abrir o modal depois
    if(clickX && clickY){
        modal.style.display = "block";
    }

    forceType = 'trapezoid';
    
})

closeModalButton.addEventListener("click", function() {
    modal.style.display = "none";
    deactiveButtons();

});

window.addEventListener("click", function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
        deactiveButtons();
    }
});

let getModalInputsButton = document.getElementById('add-distributed-force');

getModalInputsButton.addEventListener('click', function(){

    let OK = null;

    let force = parseFloat(document.getElementById('force-input-distributed').value);
    let distance_t = parseFloat(document.getElementById('length-input-distributed').value);

    let distance = (distance_t/100) * canvas.width;

    let forceMenor = null;
    let radioButtons = null;

    if (forceType === 'trapezoid') {
        forceMenor = parseFloat(document.getElementById('force-menor-input-distributed').value);
    }
    
    if (forceType === 'triangle' || forceType === 'trapezoid') {
        radioButtons = document.getElementsByName("orientation");
        var selectedOption = null;
        for (var i = 0; i < radioButtons.length; i++) {
            if (radioButtons[i].checked) {
                selectedOption = radioButtons[i].value;
                break;
            }
        }

        if (selectedOption) {
            console.log("Opção selecionada: " + selectedOption);
        } else {
            console.log("Nenhuma opção selecionada");
        }
    }

    if(forceType == 'trapezoid'){
        if (force && distance_t && forceMenor){
            trapezoidForce = {force: force, distance: distance_t, forceMenor: forceMenor, type: forceType, orientation: selectedOption};

            fetch("/get-distributed", {
                method: "POST",
                body: JSON.stringify(trapezoidForce),
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            .then(result => {
                console.log(result, "RESULTADO")
                
                let rforces = result.resultants;
                let rdistances = result.positions;

                let rforce_a = rforces.rectangle;
                let rforce_b = rforces.triangle;

                let rdistance_a = (rdistances.rectangle/100) * canvas.width;
                let rdistance_b = (rdistances.triangle/100) * canvas.width;


                const radians = (90 * Math.PI) / 180;
                const x1 = rforce_a * Math.cos(radians);
                const y1 = rforce_a * Math.sin(radians);

                const x2 = rforce_b * Math.cos(radians);
                const y2 = rforce_b * Math.sin(radians);

                vectors.push({ x: x1, y: y1, force: rforce_a, angle: 90, originX: clickX + rdistance_a, originY: clickY-y1*6});
                drawVector(x1, y1, rforce_a, clickX + rdistance_a , clickY-y1*6 );

                vectors.push({ x: x2, y: y2, force: rforce_b, angle: 90, originX: clickX + rdistance_b, originY: clickY-y2*6});
                if(x1 == x2) drawVector(x2, y2, rforce_b, clickX + rdistance_b , (clickY-y2*6),"#000", null ,fillwhere =  (clickY-y2*6) + 20);
                else drawVector(x2, y2, rforce_b, clickX + rdistance_b , clickY-y2*6);
                clickX = null;
                clickY = null;

                isClickingTrap = false;
                
                
            })

            OK = true;
    
        } else {
            alert('Preencha todos os campos!');
        }
    }
    else{
        if (force && distance){
            if(forceType == 'rectangle'){
                rectangleForce = {force: force, distance: distance_t, type: forceType};

                fetch("/get-distributed", {
                    method: "POST",
                    body: JSON.stringify(rectangleForce),
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
                .then(response => response.json())
                .then(result => {
                    
                    
                    let rforce = result.resultant;
                    let rdistance = (result.position/100) * canvas.width ;

                    const radians = (90 * Math.PI) / 180;
                    const x = rforce * Math.cos(radians);
                    const y = rforce * Math.sin(radians);

                    vectors.push({ x, y, force: rforce, angle: 90, originX: clickX + rdistance, originY: clickY-y*6});
                    drawVector(x, y, rforce, clickX + rdistance , clickY-y*6 );

                    clickX = null;
                    clickY = null;

                    isClicking = false;
                    
                    
                })
                .catch(error => {
                    console.error("Erro ao enviar dados:", error);
                });

            }
            else if(forceType == 'triangle'){
                triangleForce = {force: force, distance: distance_t, type: forceType, orientation: selectedOption};

                fetch("/get-distributed", {
                    method: "POST",
                    body: JSON.stringify(triangleForce),
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
                .then(response => response.json())
                .then(result => {
                    console.log(result, "RESULTADOTRI")
                    
                    let rforce = result.resultant;
                    let rdistance = (result.position/100) * canvas.width;

                    const radians = (90 * Math.PI) / 180;
                    const x = rforce * Math.cos(radians);
                    const y = rforce * Math.sin(radians);

                    vectors.push({ x, y, force: rforce, angle: 90, originX: clickX + rdistance, originY: clickY-y*6});
                    drawVector(x, y, rforce, clickX + rdistance , clickY-y*6 );

                    clickX = null;
                    clickY = null;

                    isClinckingTriangle = false;
                    
                    
                })
                .catch(error => {
                    console.error("Erro ao enviar dados:", error);
                });
            }

            OK = true;
    
        } else {
            
            alert('Preencha todos os campos!');
        }
    }

    if(OK){
        modal.style.display = "none";
        deactiveButtons();
    }
}
);


document.getElementById('resultant-force').addEventListener('click', function(){
    data_to_tensor = {
        vectors: vectors,
    }

    fetch("/f_resutant", {
        method: "POST",
        body: JSON.stringify(data_to_tensor),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => response.json())
    .then(result => {
        console.log(result, "RESULTADO")

        // desenhar o vetor resultante
        let data = result.resultant;

        // {
        //     "resultant_direction": 90,
        //     "resultant_magnitude": 36,
        //     "x_component": 2.204364238465236e-15,
        //     "y_component": 36
        // }

        const angle = data.resultant_direction;
        const magnitude = data.resultant_magnitude;
        const x = data.x_component;
        const y = data.y_component;

        const radians = (angle * Math.PI) / 180;

        drawVector(x, y, magnitude, canvas.width/2, canvas.height/2, "#000", false, null, true);


    })
    .catch(error => {
        console.error("Erro ao enviar dados:", error);
    });
});

document.getElementById("clean-supports").addEventListener("click", function(){
    triangles.length = 0;
    updateCanvas();
    document.getElementById('add-support').classList.remove('cuidado');
});