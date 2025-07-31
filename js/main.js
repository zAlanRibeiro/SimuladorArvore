let estadosArvore = [];
let indiceAtual = -1;
let animacaoPausada = true;
let animacaoEmExecucao = false;
let animationController = null;
let animationSpeedMultiplier = 1.0;

// --- FUNÇÕES DE CONTROLE DA UI ---

function disableAnimationControls() {
    document.querySelectorAll('button, input').forEach(el => el.disabled = true);
    document.getElementById('speed-slider').disabled = false;
    document.getElementById('pause-btn').disabled = false;
    document.getElementById('skip-forward-btn').disabled = false;
}

function enableAllControls() {
    document.querySelectorAll('button, input').forEach(el => el.disabled = false);
}


// --- LÓGICA PRINCIPAL ---

$(document).ready(() => {
    console.log("jQuery carregado com sucesso!");
    const speedSlider = document.getElementById('speed-slider');
    const speedValue = document.getElementById('speed-value');

    speedSlider.addEventListener('input', (e) => {
        animationSpeedMultiplier = parseFloat(e.target.value);
        speedValue.textContent = `${animationSpeedMultiplier.toFixed(2)}x`;
    });
});

async function inserirValor() {
    if (animacaoEmExecucao) {
        setSubtitle("Aguarde a animação atual terminar.");
        return;
    }
    const input = document.getElementById('valorInserir');
    const valor = input.value.trim();
    if (!valor || isNaN(valor)) {
        setSubtitle("Por favor, insira um valor numérico válido.");
        return;
    }

    if (indiceAtual < estadosArvore.length - 1) {
        estadosArvore = estadosArvore.slice(0, indiceAtual + 1);
    }

    animacaoEmExecucao = true;
    animacaoPausada = false;
    animationController = { skip: false };
    setSubtitle('');
    disableAnimationControls();

    await avlTree.insertValueAnimado(Number(valor), animationController);

    if (animationController.skip) {
        avlTree.root = avlTree.insert(avlTree.root, Number(valor));
    }
    
    desenharArvore(avlTree.root);
    salvarEstado();

    if (!animationController.skip && avlTree.lastOperationSuccess) {
        setSubtitle('Operação concluída.');
    }
    enableAllControls();
    input.value = "";
    animacaoEmExecucao = false;
    animacaoPausada = true;
    animationController = null;
}

async function removerValor() {
    if (animacaoEmExecucao) {
        setSubtitle("Aguarde a animação atual terminar.");
        return;
    }
    const input = document.getElementById('valorRemove');
    const valor = input.value.trim();
    if (!valor || isNaN(valor)) {
        setSubtitle("Por favor, insira um valor numérico válido.");
        return;
    }
    
    if (indiceAtual < estadosArvore.length - 1) {
        estadosArvore = estadosArvore.slice(0, indiceAtual + 1);
    }

    animacaoEmExecucao = true;
    animacaoPausada = false;
    animationController = { skip: false };
    setSubtitle('');
    disableAnimationControls();

    await avlTree.removeValueAnimado(Number(valor), animationController);
    
    if (animationController.skip) {
        avlTree.root = avlTree.removeNode(avlTree.root, Number(valor));
    }

    desenharArvore(avlTree.root);
    salvarEstado();

    if (!animationController.skip && avlTree.lastOperationSuccess) {
        setSubtitle('Operação concluída.');
    }
    enableAllControls();
    input.value = "";
    animacaoEmExecucao = false;
    animacaoPausada = true;
    animationController = null;
}

function limparArvore() {
    avlTree = new AVLTree();
    estadosArvore = [];
    indiceAtual = -1;
    animacaoEmExecucao = false;
    animacaoPausada = true;
    desenharArvore(avlTree.root);
    salvarEstado();
    setSubtitle('Árvore limpa.');
}

async function consultarCaminho() {
    if (animacaoEmExecucao) return;
    const tipo = [...document.getElementsByName("caminho")].find(r => r.checked)?.value;
    if (!tipo) {
        setSubtitle("Por favor, selecione um tipo de percurso.");
        return;
    }
    
    const percursosTexto = { A: preOrder, B: inOrder, C: posOrder };
    const resultado = percursosTexto[tipo](avlTree.root).join(" → ");

    animacaoEmExecucao = true;
    animacaoPausada = false;
    animationController = { skip: false };
    setSubtitle('Iniciando percurso...');
    disableAnimationControls();
    
    const root = avlTree.root;
    if (root) {
        const canvas = document.getElementById('tree-canvas');
        const animacoes = { A: preOrderAnimado, B: inOrderAnimado, C: posOrderAnimado };
        await animacoes[tipo](root, canvas.width / 2, 60, 0, animationController);
    }

    desenharArvore(avlTree.root);
    setSubtitle(`Percurso concluído: ${resultado}`); // <-- ALTERAÇÃO AQUI
    animacaoEmExecucao = false;
    animacaoPausada = true;
    animationController = null;
    enableAllControls();
}

function skipBack() {
    if (animacaoEmExecucao) return;
    if (indiceAtual > 0) {
        indiceAtual = 0;
        avlTree.root = avlTree.rebuildTreeFromState(estadosArvore[indiceAtual]);
        desenharArvore(avlTree.root);
    }
}

async function stepBack() {
    if (animacaoEmExecucao) return;
    if (indiceAtual > 0) {
        animacaoEmExecucao = true;
        animacaoPausada = false;
        animationController = { skip: false };
        disableAnimationControls();

        const initialState = estadosArvore[indiceAtual];
        const finalState = estadosArvore[indiceAtual - 1];
        
        await avlTree.animateStateTransition(initialState, finalState, animationController);

        indiceAtual--;
        avlTree.root = avlTree.rebuildTreeFromState(estadosArvore[indiceAtual]);
        
        if (!animationController.skip) {
            desenharArvore(avlTree.root);
        }

        animacaoEmExecucao = false;
        animacaoPausada = true;
        animationController = null;
        enableAllControls();
    }
}

async function stepForward() {
    if (animacaoEmExecucao) return;
    if (indiceAtual < estadosArvore.length - 1) {
        animacaoEmExecucao = true;
        animacaoPausada = false;
        animationController = { skip: false };
        disableAnimationControls();

        const initialState = estadosArvore[indiceAtual];
        const finalState = estadosArvore[indiceAtual + 1];

        await avlTree.animateStateTransition(initialState, finalState, animationController);

        indiceAtual++;
        avlTree.root = avlTree.rebuildTreeFromState(estadosArvore[indiceAtual]);

        if (!animationController.skip) {
            desenharArvore(avlTree.root);
        }

        animacaoEmExecucao = false;
        animacaoPausada = true;
        animationController = null;
        enableAllControls();
    }
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
        desenharArvore(avlTree.root);
    }
}

async function executarBusca() {
    if (animacaoEmExecucao) return;
    const input = document.getElementById("valorBusca");
    const value = input.value.trim();
    if (value === "" || isNaN(value)) {
        setSubtitle("Por favor, insira um valor numérico válido para buscar.");
        return;
    }

    animacaoEmExecucao = true;
    animacaoPausada = false;
    animationController = { skip: false };
    setSubtitle('');
    disableAnimationControls();

    const canvas = document.getElementById('tree-canvas');
    await avlTree.buscaBinaria(avlTree.root, Number(value), canvas.width / 2, 60, 0, animationController);
    
    desenharArvore(avlTree.root);
    animacaoEmExecucao = false;
    animacaoPausada = true;
    animationController = null;
    enableAllControls();
    input.value = "";
}
