function desenharArvore(root) {
    const canvas = document.getElementById('tree-canvas');
    const profundidade = alturaArvore(root);
    const totalNos = contarNos(root);

    canvas.width = Math.max(1200, totalNos * 100);
    canvas.height = Math.max(600, profundidade * 150);

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "20px Arial";
    ctx.textAlign = "center";

    const desenharNo = (node, x, y, nivel) => {
        if (!node) return;
        const raio = 25;
        const deslocamento = canvas.width / Math.pow(2, nivel + 2);

        ctx.beginPath();
        ctx.arc(x, y, raio, 0, 2 * Math.PI);
        ctx.fillStyle = "lightblue";
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "black";
        ctx.fillText(node.value, x, y + 6);

        if (node.left) {
            ctx.beginPath();
            ctx.moveTo(x - raio, y);
            ctx.lineTo(x - deslocamento, y + 80);
            ctx.stroke();
            desenharNo(node.left, x - deslocamento, y + 80, nivel + 1);
        }

        if (node.right) {
            ctx.beginPath();
            ctx.moveTo(x + raio, y);
            ctx.lineTo(x + deslocamento, y + 80);
            ctx.stroke();
            desenharNo(node.right, x + deslocamento, y + 80, nivel + 1);
        }
    };

    desenharNo(root, canvas.width / 2, 60, 0);
}

function alturaArvore(node) {
    return node ? 1 + Math.max(alturaArvore(node.left), alturaArvore(node.right)) : 0;
}

function contarNos(node) {
    return node ? 1 + contarNos(node.left) + contarNos(node.right) : 0;
}

function desenharNoPendente(ctx, valor, x, y) {
    const raio = 25;

    // Limpa a área para o novo nó
    ctx.clearRect(x - raio - 5, y - raio - 5, raio * 2 + 10, raio * 2 + 10);
    
    ctx.beginPath();
    ctx.arc(x, y, raio, 0, 2 * Math.PI);
    ctx.fillStyle = "gold"; // Cor para indicar que está pendente
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "black";
    ctx.fillText(valor, x, y + 6);

    ctx.font = "16px Arial";
    ctx.fillText("Inserindo...", x, y + 50);
    ctx.font = "20px Arial"; // Volta para a fonte padrão
}