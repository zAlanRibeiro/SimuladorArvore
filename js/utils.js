function exibirMensagem(tipo, texto) {
    const div = document.getElementById("mensagem");
    div.className = "mensagem mensagem-" + tipo;
    div.textContent = texto;
    div.style.display = "block";
    setTimeout(() => div.style.display = "none", 3000);
}

function salvarEstado() {
    estadosArvore = estadosArvore.slice(0, indiceAtual + 1);
    estadosArvore.push(estruturar(avlTree.root));
    indiceAtual = estadosArvore.length - 1;
}

function estruturar(node) {
    return node ? { value: node.value, left: estruturar(node.left), right: estruturar(node.right) } : null;
}

function alternarAnimacao() {
    animacaoPausada = !animacaoPausada;

    const pauseBtn = document.getElementById("pause-btn");

    if (animacaoPausada) {
        pauseBtn.innerHTML = "▶️ Continuar";
    } else {
        pauseBtn.innerHTML = "⏸ Pausar";
    }
}
