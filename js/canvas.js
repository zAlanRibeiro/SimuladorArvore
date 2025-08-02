function updateCanvasSize(root) {
    const canvas = document.getElementById('tree-canvas');
    if (!canvas) return; // Adiciona uma verificação de segurança
    const profundidade = alturaArvore(root);
    const totalNos = contarNos(root);

    canvas.width = Math.max(1200, totalNos * 110);
    canvas.height = Math.max(600, profundidade * 150);
}

function desenharArvore(tree, animationOverrides = {}) {
    const canvas = document.getElementById('tree-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const root = tree.root; // Extrai o nó raiz da instância da árvore

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.strokeStyle = "#1f2937";

    const desenharLinhas = (node, x, y, nivel) => {
        if (!node) return;
        const raio = 25;
        const deslocamento = canvas.width / Math.pow(2, nivel + 2);

        if (node.left) {
            const childX = x - deslocamento;
            const childY = y + 80;
            const angle = Math.atan2(childY - y, childX - x);
            const startX = x + raio * Math.cos(angle);
            const startY = y + raio * Math.sin(angle);
            const endX = childX - raio * Math.cos(angle);
            const endY = childY - raio * Math.sin(angle);
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            desenharLinhas(node.left, childX, childY, nivel + 1);
        }

        if (node.right) {
            const childX = x + deslocamento;
            const childY = y + 80;
            const angle = Math.atan2(childY - y, childX - x);
            const startX = x + raio * Math.cos(angle);
            const startY = y + raio * Math.sin(angle);
            const endX = childX - raio * Math.cos(angle);
            const endY = childY - raio * Math.sin(angle);
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            desenharLinhas(node.right, childX, childY, nivel + 1);
        }
    };

    const desenharNos = (node, x, y, nivel) => {
        if (!node) return;
        const raio = 25;
        const deslocamento = canvas.width / Math.pow(2, nivel + 2);

        const override = animationOverrides[node.value];
        const color = override && override.color ? override.color : "#e0f2fe";
        
        ctx.globalAlpha = override && override.opacity !== undefined ? override.opacity : 1;

        ctx.beginPath();
        ctx.arc(x, y, raio, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#1f2937";
        ctx.fillText(node.value, x, y + 6);

        if (node.height !== undefined) {
            const originalAlign = ctx.textAlign;
            const originalFont = ctx.font;
            ctx.font = "16px Arial";
            ctx.fillStyle = "#150655";
            ctx.textAlign = "center";

            if (override && override.heightInfo) {
                const { newHeight, oldHeight, oldOpacity, newOpacity } = override.heightInfo;
                ctx.globalAlpha = oldOpacity;
                ctx.fillText(oldHeight, x, y - raio - 8);
                ctx.globalAlpha = newOpacity;
                ctx.fillText(newHeight, x, y - raio - 8);
            } else {
                ctx.fillText(node.height, x, y - raio - 8);
            }

            ctx.textAlign = originalAlign;
            ctx.font = originalFont;
        }
        
        ctx.globalAlpha = 1.0;

        desenharNos(node.left, x - deslocamento, y + 80, nivel + 1);
        desenharNos(node.right, x + deslocamento, y + 80, nivel + 1);
    };

    desenharLinhas(root, canvas.width / 2, 60, 0);
    desenharNos(root, canvas.width / 2, 60, 0);

    if (tree.pendingNodeInfo) {
        const { value, x, y, text } = tree.pendingNodeInfo;
        desenharNoPendente(ctx, value, x, y, text);
    }
}

function alturaArvore(node) {
    return node ? 1 + Math.max(alturaArvore(node.left), alturaArvore(node.right)) : 0;
}

function contarNos(node) {
    return node ? 1 + contarNos(node.left) + contarNos(node.right) : 0;
}

function desenharNoPendente(ctx, valor, x, y, text = "Inserindo...") {
    const raio = 25;
    const color = text.includes("Removendo") ? "tomato" : "gold";
    ctx.beginPath();
    ctx.arc(x, y, raio, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "black";
    ctx.fillText(valor, x, y + 6);
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#374151";
    ctx.fillText(text, x, y + 50);
    ctx.font = "20px Arial";
}
