// Variáveis de estado global
let estadosArvore = [];
let indiceAtual = -1;
let animacaoPausada = false;
let animacaoEmExecucao = false;
let animationController = null;
let animationSpeedMultiplier = 1.0;
let stepTimeoutId = null; 
let isStepping = false;

// --- FUNÇÕES DE CONTROLE DA UI ---

function disableAnimationControls() {
    document.querySelectorAll('button, input').forEach(el => el.disabled = true);
    document.getElementById('speed-slider').disabled = false;
    document.getElementById('pause-btn').disabled = false;
    document.getElementById('skip-forward-btn').disabled = false;
    document.querySelector('.navigation-controls > *:nth-child(5)').disabled = false; 
}

function enableAllControls() {
    document.querySelectorAll('button, input').forEach(el => el.disabled = false);
}

// --- FUNÇÕES DE CONTROLE DE ANIMAÇÃO CENTRALIZADAS ---

function atualizarBotaoPausa() {
    const pauseBtn = document.getElementById("pause-btn");
    if (animacaoPausada) {
        pauseBtn.innerHTML = "▶️ Continuar";
    } else {
        pauseBtn.innerHTML = "⏸ Pausar";
    }
}

function alternarAnimacao() {
    animacaoPausada = !animacaoPausada;
    atualizarBotaoPausa();
}

function iniciarAnimacao() {
    if (animacaoEmExecucao) return false;
    animacaoEmExecucao = true;
    animationController = { skip: false };
    setSubtitle('');
    disableAnimationControls();
    return true;
}

function finalizarAnimacao(mensagemFinal = '', sucesso = true) {
    if (stepTimeoutId) {
        clearTimeout(stepTimeoutId);
        stepTimeoutId = null;
    }

    if (sucesso && mensagemFinal) {
        setSubtitle(mensagemFinal);
    }
    enableAllControls();
    animacaoEmExecucao = false;
    
    if (isStepping) {
        animacaoPausada = true;
    }
    
    animationController = null;
    isStepping = false;

    atualizarBotaoPausa();
}


// --- LÓGICA PRINCIPAL ---

$(document).ready(() => {
    const speedSlider = document.getElementById('speed-slider');
    const speedValue = document.getElementById('speed-value');

    speedSlider.addEventListener('input', (e) => {
        animationSpeedMultiplier = parseFloat(e.target.value);
        speedValue.textContent = `${animationSpeedMultiplier.toFixed(2)}x`;
    });

    document.getElementById('pause-btn').addEventListener('click', alternarAnimacao);
    atualizarBotaoPausa();
});

async function inserirValor() {
    const input = document.getElementById('valorInserir');
    const valor = input.value.trim();
    if (!valor || isNaN(valor)) {
        setSubtitle("Por favor, insira um valor numérico válido.");
        return;
    }

    if (!iniciarAnimacao()) return;

    if (indiceAtual < estadosArvore.length - 1) {
        estadosArvore = estadosArvore.slice(0, indiceAtual + 1);
    }

    await avlTree.insertValueAnimado(Number(valor), animationController);

    if (animationController.skip) {
        avlTree.root = avlTree.insert(avlTree.root, Number(valor));
    }
    
    desenharArvore(avlTree);
    salvarEstado();
    
    finalizarAnimacao('Operação concluída.', avlTree.lastOperationSuccess);
    input.value = "";
}

async function removerValor() {
    const input = document.getElementById('valorRemove');
    const valor = input.value.trim();
    if (!valor || isNaN(valor)) {
        setSubtitle("Por favor, insira um valor numérico válido.");
        return;
    }

    if (!iniciarAnimacao()) return;
    
    if (indiceAtual < estadosArvore.length - 1) {
        estadosArvore = estadosArvore.slice(0, indiceAtual + 1);
    }

    await avlTree.removeValueAnimado(Number(valor), animationController);
    
    if (animationController.skip) {
        avlTree.root = avlTree.removeNode(avlTree.root, Number(valor));
    }

    desenharArvore(avlTree);
    salvarEstado();

    finalizarAnimacao('Operação concluída.', avlTree.lastOperationSuccess);
    input.value = "";
}

function limparArvore() {
    if (animacaoEmExecucao) return;
    avlTree = new AVLTree();
    estadosArvore = [];
    indiceAtual = -1;
    desenharArvore(avlTree);
    salvarEstado();
    setSubtitle('Árvore limpa.');
}

async function consultarCaminho() {
    const tipo = [...document.getElementsByName("caminho")].find(r => r.checked)?.value;
    if (!tipo) {
        setSubtitle("Por favor, selecione um tipo de percurso.");
        return;
    }
    
    if (!iniciarAnimacao()) return;
    
    const percursosTexto = { A: preOrder, B: inOrder, C: posOrder };
    const resultado = percursosTexto[tipo](avlTree.root).join(" → ");
    
    const root = avlTree.root;
    if (root) {
        const canvas = document.getElementById('tree-canvas'); // CORREÇÃO: Variável canvas definida
        const animacoes = { A: preOrderAnimado, B: inOrderAnimado, C: posOrderAnimado };
        await animacoes[tipo](root, canvas.width / 2, 60, 0, animationController);
    }

    desenharArvore(avlTree);
    finalizarAnimacao(`Percurso concluído: ${resultado}`);
}

function skipBack() {
    if (animacaoEmExecucao) return;
    if (indiceAtual > 0) {
        indiceAtual = 0;
        avlTree.root = avlTree.rebuildTreeFromState(estadosArvore[indiceAtual]);
        desenharArvore(avlTree);
    }
}

async function stepBack() {
    if (indiceAtual <= 0) return;
    if (!iniciarAnimacao()) return;

    const initialState = estadosArvore[indiceAtual];
    const finalState = estadosArvore[indiceAtual - 1];
    
    await avlTree.animateStateTransition(initialState, finalState, animationController);

    indiceAtual--;
    avlTree.root = avlTree.rebuildTreeFromState(estadosArvore[indiceAtual]);
    
    if (!animationController.skip) {
        desenharArvore(avlTree);
    }

    finalizarAnimacao();
}

async function stepForward() {
    if (animacaoEmExecucao && animacaoPausada) {
        if (isStepping) return;
        isStepping = true;
        const subtitleEl = document.getElementById('animation-subtitle');
        const initialSubtitle = subtitleEl.textContent;
        animacaoPausada = false;

        while (true) {
            await new Promise(resolve => requestAnimationFrame(resolve));
            const pauseBtn = document.getElementById("pause-btn");
            if (pauseBtn.textContent.includes("Pausar") || !animacaoEmExecucao) {
                break;
            }
            if (subtitleEl.textContent !== initialSubtitle) {
                animacaoPausada = true;
                break;
            }
        }
        isStepping = false;
        return;
    }

    if (animacaoEmExecucao) return;
    if (indiceAtual >= estadosArvore.length - 1) return;
    if (!iniciarAnimacao()) return;

    const initialState = estadosArvore[indiceAtual];
    const finalState = estadosArvore[indiceAtual + 1];

    await avlTree.animateStateTransition(initialState, finalState, animationController);

    indiceAtual++;
    avlTree.root = avlTree.rebuildTreeFromState(estadosArvore[indiceAtual]);

    if (!animationController.skip) {
        desenharArvore(avlTree);
    }

    finalizarAnimacao();
}

function skipForward() {
    if (animacaoEmExecucao && animationController) {
        animationController.skip = true;
        return;
    }
    if (animacaoEmExecucao) return;
    if (indiceAtual < estadosArvore.length - 1) {
        indiceAtual = estadosArvore.length - 1;
        avlTree.root = avlTree.rebuildTreeFromState(estadosArvore[indiceAtual]);
        desenharArvore(avlTree);
    }
}

async function executarBusca() {
    const input = document.getElementById("valorBusca");
    const value = input.value.trim();
    if (value === "" || isNaN(value)) {
        setSubtitle("Por favor, insira um valor numérico válido para buscar.");
        return;
    }

    if (!iniciarAnimacao()) return;

    const canvas = document.getElementById('tree-canvas');
    await avlTree.buscaBinaria(avlTree.root, Number(value), canvas.width / 2, 60, 0, animationController);
    
    desenharArvore(avlTree);
    finalizarAnimacao();
    input.value = "";
}
