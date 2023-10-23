const canvas = document.getElementById('vector-canvas');
const context = canvas.getContext('2d');
const forceInput = document.getElementById('force-input');
const angleInput = document.getElementById('angle-input');
const addVectorButton = document.getElementById('add-vector');
const undoVectorButton = document.getElementById('undo-vector');
const clearVectorsButton = document.getElementById('clear-vectors');

const vectors = [];
let isAddingVectors = false;

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

updateCanvas();

      
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


function drawTriangle(triangle) {
    ctx.beginPath();
    ctx.moveTo(triangle.x, triangle.y + triangle.height); // Vértice inferior
    ctx.lineTo(triangle.x + triangle.base, triangle.y + triangle.height); // Vértice direito
    ctx.lineTo(triangle.x + (triangle.base / 2), triangle.y); // Vértice superior
    ctx.closePath();

    ctx.fillStyle = 'gray';
    ctx.fill();
    ctx.stroke();
}

function addTriangle(x, y) {
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
    } else {
        alert("Limite máximo de triângulos atingido.");
    }
}

document.getElementById('add-support').addEventListener('click', () => {
    addTriangle(canvas.width/2 - 20, canvas.height/2 -20);
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


drawBarra(); // Inicialmente, desenhe a barra na posição inicial

document.getElementById("toggle-add-vector").addEventListener("click", () => {
    isAddingVectors = !isAddingVectors; // Inverta o estado
    if (isAddingVectors) {
        document.getElementById("toggle-add-vector").textContent = "Parar Adição de Vetores";
    } else {
        document.getElementById("toggle-add-vector").textContent = "Iniciar Adição de Vetores";
    }
});

canvas.addEventListener('click', (event) => {
    console.log(triangles)
    if (isAddingVectors) {
        const rect = canvas.getBoundingClientRect();
        const originX = event.clientX - rect.left;
        const originY = event.clientY - rect.top;

        const force = parseFloat(forceInput.value);
        const angle = parseFloat(angleInput.value);

        if (!isNaN(force) && !isNaN(angle)) {
            const radians = (angle * Math.PI) / 180;
            const x = force * Math.cos(radians);
            const y = force * Math.sin(radians);

            const adjustedOriginX = originX - x * 6;
            const adjustedOriginY = originY - y * 6;

            vectors.push({ x, y, force, angle, originX: adjustedOriginX, originY: adjustedOriginY });
            console.log(vectors);
            updateCanvas();
        }
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
    context.fillStyle = '#00A9FF'; // Cor da barra
    context.fillRect(barraX, barraY, barraComprimento, barraAltura);
    context.stroke();
}



function drawVector(x, y, force, originX, originY, color = "black") {
    const vectorScale = 6;
    const arrowSize = 6;

    const arrowX = originX + x * vectorScale;
    const arrowY = originY + y * vectorScale;

    context.beginPath();
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
    
    if (kn) {
        context.fillText(`${force.toFixed(2)}kN`, originX, originY);
        
    } else {
        context.fillText(`${force.toFixed(2)}N`, originX, originY);
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
    const stepX = canvas.width / 20; // Espaçamento entre os rótulos

    for (let x = stepX; x < canvas.width; x += stepX) {
        context.beginPath();
        context.moveTo(x, canvas.height / 2 - 5);
        context.lineTo(x, canvas.height / 2 + 5);
        context.stroke();

        context.fillStyle = labelColor;
        context.font = "12px Arial"; // Defina o tamanho e a fonte do rótulo
        context.fillText((x - canvas.width / 2) / (canvas.width / 100), x - 10, canvas.height / 2 + 20);
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
        context.font = "12px Arial"; // Defina o tamanho e a fonte do rótulo
        context.fillText((canvas.height / 2 - y) / (canvas.height / 100), canvas.width / 2 - 30, y + 5);
    }
}

function updateCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    drawAxes(); // Desenha o plano cartesiano
    drawVectors(); // Desenha os vetores
    drawBarra(); // Desenha a barra

    for (const triangle of triangles) {
        drawTriangle(triangle);
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
    // const reaction1 = document.getElementById("reaction1");
    // const reaction2 = document.getElementById("reaction2");

    // reaction1.textContent = `Reação 1: ${reactions.reaction1.toFixed(2)}`;
    // reaction2.textContent = `Reação 2: ${reactions.reaction2.toFixed(2)}`;

    // Desenhe as reações no Canvas
    const reactionA = reactions.a_reaction;
    const reactionB = reactions.b_reaction;

    console.log(reactionA, reactionB)

    console.log(triangles)

    drawVector(0, reactionA * -1, reactionA, triangles[0].x + triangles[0].base/2, triangles[0].y, "#000000");
    drawVector(0, reactionB * -1, reactionB, triangles[1].x + triangles[1].base/2, triangles[1].y, "#000000");

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
        console.log(result);
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