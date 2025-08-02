function exibirMensagem(tipo, texto) {
    const div = document.getElementById("mensagem");
    div.className = "mensagem mensagem-" + tipo;
    div.textContent = texto;
    div.style.display = "block";
    setTimeout(() => div.style.display = "none", 3000);
}

/**
 * Define o texto da legenda da animação.
 * @param {string} text - O texto a ser exibido. Se for vazio, limpa a legenda.
 */
function setSubtitle(text = '') {
    const subtitleEl = document.getElementById('animation-subtitle');
    if (subtitleEl) {
        subtitleEl.textContent = text;
    }
}

function salvarEstado() {
    // Garante que não há estados futuros se voltamos no tempo e inserimos um novo
    if (indiceAtual < estadosArvore.length - 1) {
        estadosArvore = estadosArvore.slice(0, indiceAtual + 1);
    }
    estadosArvore.push(estruturar(avlTree.root));
    indiceAtual = estadosArvore.length - 1;
}

function estruturar(node) {
    // Adiciona a altura ao estado guardado
    return node ? { value: node.value, height: node.height, left: estruturar(node.left), right: estruturar(node.right) } : null;
}

// Função de controlo de pausa/continuação
function alternarAnimacao() {
    animacaoPausada = !animacaoPausada;
    const pauseBtn = document.getElementById("pause-btn");
    if (animacaoPausada) {
        pauseBtn.innerHTML = "▶️ Continuar";
    } else {
        pauseBtn.innerHTML = "⏸ Pausar";
    }
}
