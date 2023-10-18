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
let isDraggingBarra = false;
let offsetX = 0;
let offsetY = 0;
let barraX = 100;  // Posição inicial da barra
let barraY = 300;
let barraComprimento = 300;
let barraAltura = 20;

let kn = false;

updateCanvas();


const ctx = canvas.getContext('2d');
        let isDragging = false;

      

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

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

function drawBarra() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'blue'; // Cor da barra
    ctx.fillRect(barraX, barraY, barraComprimento, barraAltura);
}

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
    context.fillStyle = 'blue'; // Cor da barra
    context.fillRect(barraX, barraY, barraComprimento, barraAltura);
    context.stroke();
}

function drawVector(x, y, force, originX, originY) {
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
    if (kn) {
        context.fillText(`${force}kN`, originX, originY);
    } else {
        context.fillText(`${force}N`, originX, originY);
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
}

function drawVectors() {
    for (const vector of vectors) {
        drawVector(vector.x, vector.y, vector.force, vector.originX, vector.originY);
    }
}

function drawVector(x, y, force, originX, originY) {
    const vectorScale = 6;
    const arrowSize = 6;

    const arrowX = originX + x * vectorScale;
    const arrowY = originY + y * vectorScale; // Altere de "-" para "+"

    context.beginPath();
    context.moveTo(originX, originY);
    context.lineTo(arrowX, arrowY);
    context.stroke();

    const angle = Math.atan2(y, x); // Remova o sinal negativo

    context.beginPath();
    context.moveTo(arrowX, arrowY);
    context.lineTo(arrowX - arrowSize * Math.cos(angle - Math.PI / 6), arrowY - arrowSize * Math.sin(angle - Math.PI / 6));
    context.lineTo(arrowX - arrowSize * Math.cos(angle + Math.PI / 6), arrowY - arrowSize * Math.sin(angle + Math.PI / 6));
    context.closePath();
    context.fill();

    context.font = "14px Arial";
    // fazer com que identifique kN e N
    if(kn){
        context.fillText(`${force}kN`, originX, originY);
    }
    else{
        context.fillText(`${force}N`, originX, originY);
    }
    
}

function drawResultantVector(resultantVector) {
    const resultantMagnitude = document.getElementById("resultant-magnitude");
    const resultantDirection = document.getElementById("resultant-direction");

    resultantMagnitude.textContent = `Magnitude: ${resultantVector.resultant_magnitude}`;
    resultantDirection.textContent = `Direction: ${resultantVector.resultant_direction} degrees`;

    // Agora você pode desenhar o vetor no Canvas usando as informações do resultado
    const magnitude = resultantVector.resultant_magnitude; // Use a magnitude para definir o comprimento do vetor
    const direction = resultantVector.resultant_direction; // Use a direção para definir o ângulo do vetor

    const radians = (direction * Math.PI) / 180; // Converter graus em radianos
    const x = magnitude * Math.cos(radians);
    const y = magnitude * Math.sin(radians);

    // Desenhe o vetor no Canvas, você pode usar a função drawVector que você já tem
    drawVector(x, y, magnitude, canvas.width / 2, canvas.height / 2);
}

document.getElementById("get-vectors").addEventListener("click", function () {
    
    // Realizar uma solicitação POST ao servidor Flask
    fetch("/get-vectors", {
        method: "POST",
        body: JSON.stringify(vectors),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => response.json())
    .then(result => {
        // Manipular a resposta do Flask (se necessário)
        console.log(result);
        if (result.resultant) {
            drawResultantVector(result.resultant);
        }
    })
    .catch(error => {
        console.error("Erro ao enviar dados:", error);
    });
});