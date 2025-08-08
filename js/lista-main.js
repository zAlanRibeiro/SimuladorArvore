let listaAtual = null;
let animacaoEmExecucao = false;
let highlightedElements = new Set(); 

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function calcularDeslocamento(posicao) {
    const nodeWidth = 60;
    const pointerWidth = 40;
    const listContainer = document.querySelector('.list-container');
    const gap = listContainer ? parseFloat(window.getComputedStyle(listContainer).gap) : 24;
    
    const shiftDistance = nodeWidth + gap + pointerWidth;
    
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
        await sleep(700);
        highlightedElements.delete(`node-${i}`);
        
        highlightedElements.add(`pointer-${i}`);
        desenharLista();
        await sleep(700);
        highlightedElements.delete(`pointer-${i}`);

        if (noAtual) {
            noAtual = noAtual.proximo;
        }
    }
    
    desenharLista();
    await sleep(100);

    const canvas = document.getElementById('list-canvas');
    const listContainer = document.querySelector('.list-container');
    const allNodeWrappers = listContainer.querySelectorAll('.node-wrapper');
    const nodeWidth = 60;
    const targetY = canvas.offsetHeight / 2;
    let targetX;
    const canvasRect = canvas.getBoundingClientRect();

    if (posicao >= listaAtual.length) {
        if (listaAtual.length === 0) {
            const containerStyle = window.getComputedStyle(listContainer);
            const containerLeft = parseFloat(containerStyle.left);
            const containerPadding = parseFloat(containerStyle.paddingLeft);
            targetX = containerLeft + containerPadding + (nodeWidth / 2);
        } else {
            const lastWrapperEl = allNodeWrappers[allNodeWrappers.length - 1];
            const lastWrapperRect = lastWrapperEl.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(listContainer);
            const gap = parseFloat(computedStyle.gap);
            const pointerWidth = 40;
            targetX = (lastWrapperRect.right - canvasRect.left) + gap + pointerWidth + gap + (nodeWidth / 2);
        }
    } else { 
        const targetWrapperEl = allNodeWrappers[posicao];
        const targetWrapperRect = targetWrapperEl.getBoundingClientRect();
        targetX = (targetWrapperRect.left - canvasRect.left) + (targetWrapperRect.width / 2);
    }

    let shiftConfig = null;
    if (listaAtual.length > 0 && posicao <= listaAtual.length) {
        shiftConfig = calcularDeslocamento(posicao);
        desenharLista(null, shiftConfig);
        await sleep(500);
    }

    await animarVoo(targetX, targetY, shiftConfig, { valor, posicao });
}

function animarVoo(targetX, targetY, shiftConfig, insertData) {
    return new Promise(resolve => {
        const duration = 1000;
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
                if (insertData.posicao >= listaAtual.length) {
                    listaAtual.inserirValor(insertData.valor);
                } else {
                    listaAtual.inserirEmPosicao(insertData.valor, insertData.posicao);
                }
                desenharLista();
                resolve();
            }
        }
        requestAnimationFrame(animationStep);
    });
}

async function animarRemocao(valor) {
    const posicao = listaAtual.encontrarPosicao(valor);
    if (posicao === -1) {
        alert('Valor não encontrado na lista!');
        return false;
    }

    for (let i = 0; i < posicao; i++) {
        highlightedElements.add(`node-${i}`);
        desenharLista();
        await sleep(700);
        highlightedElements.delete(`node-${i}`);
        
        highlightedElements.add(`pointer-${i}`);
        desenharLista();
        await sleep(700);
        highlightedElements.delete(`pointer-${i}`);
    }

    highlightedElements.add(`node-${posicao}`);
    desenharLista();
    await sleep(800);

    const listContainer = document.querySelector('.list-container');
    const allWrappers = listContainer.querySelectorAll('.node-wrapper');
    const wrapperToRemove = allWrappers[posicao];
    wrapperToRemove.classList.add('removing');
    await sleep(500);

    const nodeWidth = 60;
    const pointerWidth = 40;
    const gap = parseFloat(window.getComputedStyle(listContainer).gap);
    const shiftDistance = nodeWidth + gap + pointerWidth;

    for (let i = posicao + 1; i < allWrappers.length; i++) {
        allWrappers[i].style.transform = `translateX(-${shiftDistance}px)`;
    }
    const pointers = listContainer.querySelectorAll('.list-pointer');
    for (let i = posicao; i < pointers.length; i++) {
        pointers[i].style.transform = `translateX(-${shiftDistance}px)`;
    }
    const nullEl = listContainer.querySelector('.null-element');
    if (nullEl) {
        nullEl.style.transform = `translateX(-${shiftDistance}px)`;
    }

    await sleep(500);
    highlightedElements.clear();
    return true;
}

async function animarBusca(valor) {
    const posicao = listaAtual.encontrarPosicao(valor);
    if (posicao === -1) {
        alert('Valor não encontrado na lista!');
        return null;
    }

    for (let i = 0; i <= posicao; i++) {
        highlightedElements.add(`node-${i}`);
        desenharLista();
        await sleep(700);
        
        if (i < posicao) {
            highlightedElements.delete(`node-${i}`);
        }
        
        if (i < posicao) {
            highlightedElements.add(`pointer-${i}`);
            desenharLista();
            await sleep(700);
            highlightedElements.delete(`pointer-${i}`);
        }
    }
    
    const noEncontrado = listaAtual.buscar(valor);
    highlightedElements.clear();
    desenharLista(noEncontrado);
    
    setTimeout(() => {
        const noAtualNaPosicao = listaAtual.buscar(valor);
        if(noAtualNaPosicao === noEncontrado) {
            desenharLista();
        }
    }, 2500);
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
        if (!listaAtual.pendingNode) {
            listContainer.textContent = 'Lista Vazia!';
            listContainer.style.justifyContent = 'center'; 
            listContainer.style.width = '100%';
        }
        return;
    }

    let noAtual = listaAtual.inicio;
    let nodeIndex = 0;
    let elementCounter = 0;
    while (noAtual !== null) {
        const nodeWrapper = document.createElement('div');
        nodeWrapper.className = 'node-wrapper';
        const noDiv = document.createElement('div');
        noDiv.className = 'list-node';
        noDiv.textContent = noAtual.valor;
        if (noAtual === noDestacado) noDiv.classList.add('highlight');
        if (highlightedElements.has(`node-${nodeIndex}`)) noDiv.classList.add('highlight-path');
        const indexDiv = document.createElement('div');
        indexDiv.className = 'node-index';
        indexDiv.textContent = nodeIndex;
        nodeWrapper.appendChild(noDiv);
        nodeWrapper.appendChild(indexDiv);
        if (shiftConfig && elementCounter >= shiftConfig.shiftStartIndex) {
            nodeWrapper.style.transform = `translateX(${shiftConfig.shiftDistance}px)`;
        }
        listContainer.appendChild(nodeWrapper);
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
        if (highlightedElements.has(`pointer-${nodeIndex - 1}`)) {
            finalPointer.classList.add('highlight-path');
        }
        if (shiftConfig && elementCounter >= shiftConfig.shiftStartIndex) {
            finalPointer.style.transform = `translateX(${shiftConfig.shiftDistance}px)`;
        }
        listContainer.appendChild(finalPointer);
        elementCounter++;

        const nullEl = document.createElement('div');
        nullEl.className = 'null-element';
        nullEl.textContent = 'NULL';
        if (shiftConfig && elementCounter >= shiftConfig.shiftStartIndex) {
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
    const canvas = document.getElementById('list-canvas');
    const inputValor = document.getElementById('valorInserir');
    const inputPosicao = document.getElementById('posicaoInserir');
    const valor = inputValor.value.trim();
    const posicaoStr = inputPosicao.value.trim();

    if (!valor) {
        alert('Por favor, insira um valor.');
        return;
    }

    alternarControles(false);
    canvas.classList.add('insert-mode');
    
    if (posicaoStr === '') {
        const posicao = listaAtual.length;
        await animarInsercao(valor, posicao);
    } else {
        const posicao = parseInt(posicaoStr, 10);
        if (isNaN(posicao) || posicao < 0 || posicao > listaAtual.length) {
            alert('Posição inválida!');
            alternarControles(true);
            return;
        }
        await animarInsercao(valor, posicao);
    }

    canvas.classList.remove('insert-mode');
    alternarControles(true);
    inputValor.value = '';
    inputPosicao.value = '';
    inputValor.focus();
}

async function acaoRemover() {
    if (animacaoEmExecucao || !listaAtual) return;
    const canvas = document.getElementById('list-canvas');
    const inputValor = document.getElementById('valorRemover');
    const valor = inputValor.value.trim();

    if (!valor) {
        alert('Por favor, insira um valor para remover.');
        return;
    }

    alternarControles(false);
    canvas.classList.add('remove-mode');
    const success = await animarRemocao(valor);
    if (success) {
        listaAtual.removerValor(valor);
        desenharLista();
    }
    canvas.classList.remove('remove-mode');
    alternarControles(true);
    inputValor.value = '';
}

async function acaoBuscar() {
    if (animacaoEmExecucao || !listaAtual) return;
    const canvas = document.getElementById('list-canvas');
    const inputValor = document.getElementById('valorBuscar');
    const valor = inputValor.value.trim();

    if (!valor) {
        alert('Por favor, insira um valor para buscar.');
        return;
    }

    alternarControles(false);
    canvas.classList.add('insert-mode'); 

    await animarBusca(valor);

    canvas.classList.remove('insert-mode');
    alternarControles(true);
    inputValor.value = '';
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
