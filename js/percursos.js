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

async function preOrderAnimado(node, x, y, nivel) {
    if (!node) return;
    await destacarNo(node, x, y);
    let deslocamento = document.getElementById('tree-canvas').width / Math.pow(2, nivel + 2);
    await preOrderAnimado(node.left, x - deslocamento, y + 80, nivel + 1);
    await preOrderAnimado(node.right, x + deslocamento, y + 80, nivel + 1);
}

async function inOrderAnimado(node, x, y, nivel) {
    if (!node) return;
    const deslocamento = document.getElementById('tree-canvas').width / Math.pow(2, nivel + 2);
    await inOrderAnimado(node.left, x - deslocamento, y + 80, nivel + 1);
    await destacarNo(node, x, y);
    await inOrderAnimado(node.right, x + deslocamento, y + 80, nivel + 1);
}

async function posOrderAnimado(node, x, y, nivel) {
    if (!node) return;
    const deslocamento = document.getElementById('tree-canvas').width / Math.pow(2, nivel + 2);
    await posOrderAnimado(node.left, x - deslocamento, y + 80, nivel + 1);
    await posOrderAnimado(node.right, x + deslocamento, y + 80, nivel + 1);
    await destacarNo(node, x, y);
}

async function destacarNo(node, x, y) {
    const canvas = document.getElementById('tree-canvas');
    const ctx = canvas.getContext('2d');
    const raio = 25;

    ctx.beginPath();
    ctx.arc(x, y, raio, 0, 2 * Math.PI);
    ctx.fillStyle = "limegreen";
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "black";
    ctx.fillText(node.value, x, y + 6);

    await new Promise(r => setTimeout(r, 600));

    while (animacaoPausada) {
        await new Promise(r => setTimeout(r, 100));
    }

    ctx.beginPath();
    ctx.arc(x, y, raio, 0, 2 * Math.PI);
    ctx.fillStyle = "lightblue";
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "black";
    ctx.fillText(node.value, x, y + 6);
}




