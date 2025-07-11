let estadosArvore = [];
let indiceAtual = -1;
let animacaoPausada = true;
let animacaoEmExecucao = false;
let animationController = null; // Controlador para a animação atual

$(document).ready(() => console.log("jQuery carregado com sucesso!"));

async function inserirValor() {
    if (animacaoEmExecucao) {
        exibirMensagem("erro", "Aguarde a animação atual terminar.");
        return;
    }
    const input = document.getElementById('valorInserir');
    const valor = input.value.trim();
    if (!valor || isNaN(valor)) {
        exibirMensagem("erro", "Preencha o campo corretamente!");
        return;
    }

    // Se voltamos no tempo, o novo estado irá sobrepor o futuro
    if (indiceAtual < estadosArvore.length - 1) {
        estadosArvore = estadosArvore.slice(0, indiceAtual + 1);
    }

    animacaoEmExecucao = true;
    animacaoPausada = false;
    animationController = { skip: false };
    document.querySelectorAll('button, input').forEach(el => el.disabled = true);
    document.getElementById('pause-btn').disabled = false;
    document.getElementById('skip-forward-btn').disabled = false;

    await avlTree.insertValueAnimado(Number(valor), animationController);

    if (animationController.skip) {
        avlTree.root = avlTree.insert(avlTree.root, Number(valor));
    }
    
    desenharArvore(avlTree.root);
    salvarEstado();

    document.querySelectorAll('button, input').forEach(el => el.disabled = false);
    input.value = "";
    animacaoEmExecucao = false;
    animacaoPausada = true;
    animationController = null;
}

function removerValor() {
    const input = document.getElementById('valorRemove');
    const valor = input.value.trim();
    if (!valor || isNaN(valor)) {
        exibirMensagem("erro", "Preencha o campo corretamente!");
        return;
    }
    avlTree.root = avlTree.removeNode(avlTree.root, Number(valor));
    atualizarVisualizacao();
    input.value = "";
}

function atualizarVisualizacao() {
    desenharArvore(avlTree.root);
    salvarEstado();
}

function limparArvore() {
    avlTree = new AVLTree();
    estadosArvore = [];
    indiceAtual = -1;
    animacaoEmExecucao = false;
    animacaoPausada = true;
    desenharArvore(avlTree.root);
    salvarEstado();
    exibirMensagem("sucesso", "Árvore resetada com sucesso!");
    document.getElementById("caminhoBox").style.display = "none";
    document.getElementById("caminhoTexto").textContent = "---";
}

async function consultarCaminho() {
    if (animacaoEmExecucao) return;
    const tipo = [...document.getElementsByName("caminho")].find(r => r.checked)?.value;
    if (!tipo) return exibirMensagem("erro", "Selecione um tipo de percurso.");
    
    const percursosTexto = { A: preOrder, B: inOrder, C: posOrder };
    const resultado = percursosTexto[tipo](avlTree.root).join(" → ");
    document.getElementById("caminhoTexto").textContent = resultado;
    document.getElementById("caminhoBox").style.display = "block";

    animacaoEmExecucao = true;
    animacaoPausada = false;
    animationController = { skip: false };
    document.querySelectorAll('button, input').forEach(el => el.disabled = true);
    document.getElementById('pause-btn').disabled = false;
    document.getElementById('skip-forward-btn').disabled = false;
    
    const root = avlTree.root;
    if (root) {
        const canvas = document.getElementById('tree-canvas');
        const animacoes = { A: preOrderAnimado, B: inOrderAnimado, C: posOrderAnimado };
        await animacoes[tipo](root, canvas.width / 2, 60, 0, animationController);
    }

    desenharArvore(avlTree.root);
    animacaoEmExecucao = false;
    animacaoPausada = true;
    animationController = null;
    document.querySelectorAll('button, input').forEach(el => el.disabled = false);
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
        document.querySelectorAll('button, input').forEach(el => el.disabled = true);
        document.getElementById('pause-btn').disabled = false;
        document.getElementById('skip-forward-btn').disabled = false;

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
        document.querySelectorAll('button, input').forEach(el => el.disabled = false);
    }
}

async function stepForward() {
    if (animacaoEmExecucao) return;
    if (indiceAtual < estadosArvore.length - 1) {
        animacaoEmExecucao = true;
        animacaoPausada = false;
        animationController = { skip: false };
        document.querySelectorAll('button, input').forEach(el => el.disabled = true);
        document.getElementById('pause-btn').disabled = false;
        document.getElementById('skip-forward-btn').disabled = false;

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
        document.querySelectorAll('button, input').forEach(el => el.disabled = false);
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
        exibirMensagem("erro", "Digite um número válido para buscar.");
        return;
    }

    animacaoEmExecucao = true;
    animacaoPausada = false;
    animationController = { skip: false };
    document.querySelectorAll('button, input').forEach(el => el.disabled = true);
    document.getElementById('pause-btn').disabled = false;
    document.getElementById('skip-forward-btn').disabled = false;

    const canvas = document.getElementById('tree-canvas');
    await avlTree.buscaBinaria(avlTree.root, Number(value), canvas.width / 2, 60, 0, animationController);
    
    desenharArvore(avlTree.root);
    animacaoEmExecucao = false;
    animacaoPausada = true;
    animationController = null;
    document.querySelectorAll('button, input').forEach(el => el.disabled = false);
    input.value = "";
}
