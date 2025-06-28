let estadosArvore = [];
let indiceAtual = -1;
let animacaoPausada = true;
let valoresArvore = [];
let animacaoEmExecucao = false;

$(document).ready(() => console.log("jQuery carregado com sucesso!"));

function inserirValor() {
    const input = document.getElementById('valorInserir');
    const valor = input.value.trim();

    if (!valor || isNaN(valor)) {
        exibirMensagem("erro", "Preencha o campo corretamente!");
        return;
    }

    avlTree.insertValue(Number(valor));
    atualizarVisualizacao();

    input.value = "";
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
    valoresArvore = [];
    estadosArvore = [];
    indiceAtual = -1;
    animacaoEmExecucao = false;  
    animacaoPausada = false;     
    atualizarVisualizacao();
    exibirMensagem("sucesso", "Árvore resetada com sucesso!");
    document.getElementById("caminhoBox").style.display = "none";
    document.getElementById("caminhoTexto").textContent = "---";
}


function consultarCaminho() {
    const tipo = [...document.getElementsByName("caminho")].find(r => r.checked)?.value;
    if (!tipo) return exibirMensagem("erro", "Selecione um tipo de percurso.");

    // Mostrar texto do percurso
    const percursosTexto = {
        A: preOrder,
        B: inOrder,
        C: posOrder
    };

    const resultado = percursosTexto[tipo](avlTree.root).join(" → ");
    document.getElementById("caminhoTexto").textContent = resultado;
    document.getElementById("caminhoBox").style.display = "block";

    // Executar animação
    animarPercurso(tipo);
}

async function animarPercurso(tipo) {
    if (animacaoEmExecucao) {
        exibirMensagem("erro", "A animação ainda está em execução ou pausada.");
        return;
    }

    animacaoEmExecucao = true;
    animacaoPausada = false;
    document.getElementById("pause-btn").innerHTML = "⏸ Pausar";

    const root = avlTree.root;
    if (!root) {
        animacaoEmExecucao = false;
        return;
    }

    const canvas = document.getElementById('tree-canvas');
    const largura = canvas.width;
    const centroX = largura / 2;

    const animacoes = {
        A: preOrderAnimado,
        B: inOrderAnimado,
        C: posOrderAnimado
    };

    await animacoes[tipo](root, centroX, 60, 0);

    animacaoEmExecucao = false;
}




// Controles de navegação
function skipBack() {
    if (estadosArvore.length === 0) {
        exibirMensagem("erro", "Nenhum estado disponível.");
        return;
    }

    if (indiceAtual !== 0) {
        indiceAtual = 0;
        desenharArvore(estadosArvore[indiceAtual]);
    } else {
        exibirMensagem("erro", "Você já está no início da árvore.");
    }
}


function stepBack() {
    if (estadosArvore.length === 0) {
        exibirMensagem("erro", "Nenhum estado anterior disponível.");
        return;
    }

    if (indiceAtual > 0) {
        indiceAtual--;
        desenharArvore(estadosArvore[indiceAtual]);
    } else {
        exibirMensagem("erro", "Não é possível retroceder mais.");
    }
}


function stepForward() {
    if (indiceAtual < estadosArvore.length - 1) {
        indiceAtual++;
        desenharArvore(estadosArvore[indiceAtual]);
    }
}

function skipForward() {
    if (estadosArvore.length > 0) {
        indiceAtual = estadosArvore.length - 1;
        desenharArvore(estadosArvore[indiceAtual]);
    }
}

function pauseAnimacao() {
    animacaoPausada = true;
}

async function executarBusca() {
    const input = document.getElementById("valorBusca");
    const value = input.value.trim();

    if (value === "" || isNaN(value)) {
        exibirMensagem("erro", "Digite um número válido para buscar.");
        return;
    }

    const canvas = document.getElementById('tree-canvas');
    const centroX = canvas.width / 2;

    await avlTree.buscaBinaria(avlTree.root, Number(value), centroX, 60, 0);

    input.value = "";
}



