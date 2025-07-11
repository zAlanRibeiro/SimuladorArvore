function preOrder(node, result = []) {
    if (node) {
        result.push(node.value);
        preOrder(node.left, result);
        preOrder(node.right, result);
    }
    return result;
}

function inOrder(node, result = []) {
    if (node) {
        inOrder(node.left, result);
        result.push(node.value);
        inOrder(node.right, result);
    }
    return result;
}

function posOrder(node, result = []) {
    if (node) {
        posOrder(node.left, result);
        posOrder(node.right, result);
        result.push(node.value);
    }
    return result;
}

async function preOrderAnimado(node, x, y, nivel, controller) {
    if (!node || (controller && controller.skip)) return;
    await destacarNo(node, x, y, controller);
    let deslocamento = document.getElementById('tree-canvas').width / Math.pow(2, nivel + 2);
    await preOrderAnimado(node.left, x - deslocamento, y + 80, nivel + 1, controller);
    await preOrderAnimado(node.right, x + deslocamento, y + 80, nivel + 1, controller);
}

async function inOrderAnimado(node, x, y, nivel, controller) {
    if (!node || (controller && controller.skip)) return;
    const deslocamento = document.getElementById('tree-canvas').width / Math.pow(2, nivel + 2);
    await inOrderAnimado(node.left, x - deslocamento, y + 80, nivel + 1, controller);
    await destacarNo(node, x, y, controller);
    await inOrderAnimado(node.right, x + deslocamento, y + 80, nivel + 1, controller);
}

async function posOrderAnimado(node, x, y, nivel, controller) {
    if (!node || (controller && controller.skip)) return;
    const deslocamento = document.getElementById('tree-canvas').width / Math.pow(2, nivel + 2);
    await posOrderAnimado(node.left, x - deslocamento, y + 80, nivel + 1, controller);
    await posOrderAnimado(node.right, x + deslocamento, y + 80, nivel + 1, controller);
    await destacarNo(node, x, y, controller);
}

// Função de destaque agora aceita o controlador
async function destacarNo(node, x, y, controller) {
    if (controller && controller.skip) return;

    const canvas = document.getElementById('tree-canvas');
    const ctx = canvas.getContext('2d');
    const raio = 25;

    // Função para desenhar o destaque
    const drawHighlight = (color) => {
        ctx.beginPath();
        ctx.arc(x, y, raio, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "black";
        ctx.fillText(node.value, x, y + 6);
    };

    drawHighlight("limegreen");

    // Pausa pausavel e pulavel
    let remaining = 500;
    while (remaining > 0) {
        if (controller && controller.skip) return;
        if (!animacaoPausada) {
            remaining -= 50;
        }
        await new Promise(r => setTimeout(r, 50));
    }

    drawHighlight("lightblue");
}
