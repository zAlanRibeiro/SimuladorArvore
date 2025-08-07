let listaAtual = null;
let animacaoEmExecucao = false;

let highlightedElements = new Set(); 

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function calcularDeslocamento(posicao) {
    const nodeWidth = 60;
    const pointerWidth = 40;
    
    const shiftDistance = nodeWidth + pointerWidth;

    const shiftStartIndex = posicao * 2;

    return { shiftStartIndex, shiftDistance };
}

async function animarInsercao(valor, posicao) {
    listaAtual.pendingNode = { valor, x: 60, y: 60, text: 'Inserindo...' };
    desenharLista();
    await sleep(500);

    let noAtual = listaAtual.inicio;
    for (let i = 0; i < posicao; i++) {
        highlightedElements.add(`node-${i}`);
        desenharLista();
        await sleep(600);
        highlightedElements.delete(`node-${i}`);
        
        highlightedElements.add(`pointer-${i}`);
        desenharLista();
        await sleep(600);
        highlightedElements.delete(`pointer-${i}`);

        if (noAtual) {
            noAtual = noAtual.proximo;
        }
    }
    
    if (posicao === listaAtual.length && listaAtual.length > 0) {
        const lastPointerIndex = listaAtual.length - 1;
        highlightedElements.add(`pointer-${lastPointerIndex}`);
        desenharLista();
        await sleep(600);
        highlightedElements.delete(`pointer-${lastPointerIndex}`);
    }
    
    desenharLista();
    await sleep(100);

    let shiftConfig = null;
    if (posicao <= listaAtual.length && listaAtual.length > 0) {
        shiftConfig = calcularDeslocamento(posicao);
        desenharLista(null, shiftConfig); 
        await sleep(500);
    }

    const canvas = document.getElementById('list-canvas');
    const listContainer = document.querySelector('.list-container');
    const allNodes = listContainer.querySelectorAll('.list-node');
    const nodeWidth = 60;
    const targetY = canvas.offsetHeight / 2;
    let targetX;

    const containerOffset = listContainer.offsetLeft;

    if (posicao >= allNodes.length) {
        if (allNodes.length === 0) {
             targetX = containerOffset + (nodeWidth / 2);
        } else {
            const lastNodeEl = allNodes[allNodes.length - 1];
            const computedStyle = window.getComputedStyle(listContainer);
            const gap = parseFloat(computedStyle.gap);
            const pointerWidth = 40;
            targetX = containerOffset + lastNodeEl.offsetLeft + nodeWidth + gap + pointerWidth + gap + (nodeWidth / 2);
        }
    } else {
        const targetNodeEl = allNodes[posicao];
        targetX = containerOffset + targetNodeEl.offsetLeft + (nodeWidth / 2);
    }

    await animarVoo(targetX, targetY, shiftConfig);
}

function animarVoo(targetX, targetY, shiftConfig) {
    return new Promise(resolve => {
        const duration = 700;
        let startTime = null;
        const startX = listaAtual.pendingNode.x;
        const startY = listaAtual.pendingNode.y;

        function animationStep(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easeOutQuad = t => t * (2 - t);
            const easedProgress = easeOutQuad(progress);

            listaAtual.pendingNode.x = startX + (targetX - startX) * easedProgress;
            listaAtual.pendingNode.y = startY + (targetY - startY) * easedProgress;
            listaAtual.pendingNode.text = '';

            desenharLista(null, shiftConfig); 

            if (progress < 1) {
                requestAnimationFrame(animationStep);
            } else {
                listaAtual.pendingNode = null;
                resolve();
            }
        }
        requestAnimationFrame(animationStep);
    });
}

function desenharLista(noDestacado = null, shiftConfig = null) {
    const canvas = document.getElementById('list-canvas');
    canvas.innerHTML = '';

    if (!listaAtual) return;

    if (listaAtual.pendingNode) {
        const { valor, x, y, text } = listaAtual.pendingNode;
        const pendingContainer = document.createElement('div');
        pendingContainer.className = 'pending-node-container';
        pendingContainer.style.left = `${x}px`;
        pendingContainer.style.top = `${y}px`;

        const pendingDiv = document.createElement('div');
        pendingDiv.className = 'list-node pending-node';
        pendingDiv.textContent = valor;
        pendingContainer.appendChild(pendingDiv);

        if (text) {
            const textDiv = document.createElement('div');
            textDiv.className = 'pending-node-text';
            textDiv.textContent = text;
            pendingContainer.appendChild(textDiv);
        }
        canvas.appendChild(pendingContainer);
    }
    
    const listContainer = document.createElement('div');
    listContainer.className = 'list-container';
    canvas.appendChild(listContainer);

    if (listaAtual.length === 0) {
        if (!listaAtual.pendingNode) listContainer.textContent = 'Lista Vazia!';
        return;
    }

    let noAtual = listaAtual.inicio;
    let nodeIndex = 0;
    let elementCounter = 0;
    while (noAtual !== null) {
        const noDiv = document.createElement('div');
        noDiv.className = 'list-node';
        noDiv.textContent = noAtual.valor;
        if (noAtual === noDestacado) noDiv.classList.add('highlight');
        if (highlightedElements.has(`node-${nodeIndex}`)) noDiv.classList.add('highlight-path');
        
        if (shiftConfig && elementCounter >= shiftConfig.shiftStartIndex) {
            noDiv.style.transform = `translateX(${shiftConfig.shiftDistance}px)`;
        }
        
        listContainer.appendChild(noDiv);
        elementCounter++;

        if (noAtual.proximo !== null) {
            const setaDiv = document.createElement('div');
            setaDiv.className = 'list-pointer';
            if (highlightedElements.has(`pointer-${nodeIndex}`)) setaDiv.classList.add('highlight-path');
            
            if (shiftConfig && elementCounter >= shiftConfig.shiftStartIndex) {
                setaDiv.style.transform = `translateX(${shiftConfig.shiftDistance}px)`;
            }

            listContainer.appendChild(setaDiv);
            elementCounter++;
        }
        noAtual = noAtual.proximo;
        nodeIndex++;
    }

    if (listaAtual.length > 0) {
        const finalPointer = document.createElement('div');
        finalPointer.className = 'list-pointer';
        if (highlightedElements.has(`pointer-${listaAtual.length - 1}`)) {
            finalPointer.classList.add('highlight-path');
        }
        if (shiftConfig && elementCounter >= shiftConfig.shiftStartIndex) {
            finalPointer.style.transform = `translateX(${shiftConfig.shiftDistance}px)`;
        }
        listContainer.appendChild(finalPointer);

        const nullEl = document.createElement('div');
        nullEl.className = 'null-element';
        nullEl.textContent = 'NULL';
        if (shiftConfig && (elementCounter + 1) >= shiftConfig.shiftStartIndex) {
            nullEl.style.transform = `translateX(${shiftConfig.shiftDistance}px)`;
        }
        listContainer.appendChild(nullEl);
    }
}

function alternarControles(habilitar) {
    animacaoEmExecucao = !habilitar;
    document.querySelectorAll('#list-controls button, #list-controls input, .list-header button').forEach(el => {
        el.disabled = !habilitar;
    });
}

function escolherLista() {
    const tipoListaInput = document.querySelector('input[name="tipo_lista"]:checked');
    if (!tipoListaInput) {
        alert('Por favor, selecione um tipo de lista primeiro!');
        return;
    }
    if (tipoListaInput.value === 'A') {
        listaAtual = new ListaSimplesmenteEncadeada();
    }
    document.getElementById('list-controls').style.display = 'flex';
    desenharLista();
}

async function acaoInserir() {
    if (animacaoEmExecucao || !listaAtual) return;
    const inputValor = document.getElementById('valorInserir');
    const inputPosicao = document.getElementById('posicaoInserir');
    const valor = inputValor.value.trim();
    const posicaoStr = inputPosicao.value.trim();

    if (!valor) {
        alert('Por favor, insira um valor.');
        return;
    }

    alternarControles(false);

    if (posicaoStr === '') {
        const posicao = listaAtual.length;
        await animarInsercao(valor, posicao);
        listaAtual.inserirValor(valor);
    } else {
        const posicao = parseInt(posicaoStr, 10);
        if (isNaN(posicao) || posicao < 0 || posicao > listaAtual.length) {
            alert('Posição inválida!');
            alternarControles(true);
            return;
        }
        await animarInsercao(valor, posicao);
        listaAtual.inserirEmPosicao(valor, posicao);
    }

    desenharLista();
    alternarControles(true);
    inputValor.value = '';
    inputPosicao.value = '';
    inputValor.focus();
}

function acaoRemover() {
    if (animacaoEmExecucao || !listaAtual) return;
    const inputValor = document.getElementById('valorRemover');
    const valor = inputValor.value.trim();
    if (valor) {
        listaAtual.removerValor(valor);
        desenharLista();
        inputValor.value = '';
    } else {
        alert('Por favor, insira um valor para remover.');
    }
}

function acaoBuscar() {
    if (animacaoEmExecucao || !listaAtual) return;
    const inputValor = document.getElementById('valorBuscar');
    const valor = inputValor.value.trim();
    if (valor) {
        const noEncontrado = listaAtual.buscar(valor);
        desenharLista(noEncontrado);
        if (!noEncontrado) setTimeout(() => desenharLista(), 1500);
        inputValor.value = '';
    } else {
        alert('Por favor, insira um valor para buscar.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const escolherBtn = document.querySelector('.list-header button');
    if (escolherBtn) escolherBtn.addEventListener('click', escolherLista);

    const inserirBtn = document.querySelector('.control-group:nth-child(1) button');
    if (inserirBtn) inserirBtn.addEventListener('click', acaoInserir);
    
    const removerBtn = document.querySelector('.control-group:nth-child(2) button');
    if (removerBtn) removerBtn.addEventListener('click', acaoRemover);

    const buscarBtn = document.querySelector('.control-group:nth-child(3) button');
    if (buscarBtn) buscarBtn.addEventListener('click', acaoBuscar);

    console.log("Simulador de lista pronto e eventos conectados.");
});
