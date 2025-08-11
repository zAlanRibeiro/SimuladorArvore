let listaAtual = null;
let animacaoEmExecucao = false;
let highlightedElements = new Set(); 

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function setAnimationCaption(text = '') {
    const canvas = document.getElementById('list-canvas');
    let captionEl = document.getElementById('animation-caption');

    if (text) {
        if (!captionEl) {
            captionEl = document.createElement('div');
            captionEl.id = 'animation-caption';
            captionEl.className = 'animation-caption';
            canvas.appendChild(captionEl);
        }
        captionEl.innerHTML = text;
        captionEl.style.display = 'block';
    } else {
        if (captionEl) {
            captionEl.style.display = 'none';
        }
    }
}

function updateVariableDisplay(anterior, atual, proximo) {
    const canvas = document.getElementById('list-canvas');
    let displayEl = document.getElementById('variable-display');

    if (!displayEl) {
        displayEl = document.createElement('div');
        displayEl.id = 'variable-display';
        displayEl.className = 'variable-display';
        canvas.appendChild(displayEl);
    }

    const antVal = anterior ? anterior.valor : 'NULL';
    const atuVal = atual ? atual.valor : 'NULL';
    const proxVal = proximo ? proximo.valor : 'NULL';

    const anteriorLabel = (listaAtual instanceof ListaDuplamenteEncadeada) 
        ? "NÓ ANTERIOR" 
        : "VAR ANTERIOR";

    displayEl.innerHTML = `
        <div class="variable-box">
            <div class="label">${anteriorLabel}</div>
            <div class="value" style="background-color: #a7f3d0;">${antVal}</div>
        </div>
        <div class="variable-box">
            <div class="label">ATUAL</div>
            <div class="value" style="background-color: #fde047;">${atuVal}</div>
        </div>
        <div class="variable-box">
            <div class="label">PRÓXIMO</div>
            <div class="value" style="background-color: #a5f3fc;">${proxVal}</div>
        </div>
    `;
    displayEl.style.display = 'flex';
}

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
    if (listaAtual.length >= 0 && posicao <= listaAtual.length) { 
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
        exibirMensagem('Valor não encontrado na lista!');
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
        exibirMensagem(`Valor ${valor} não encontrado na lista!`);
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

async function animarBuscaReversa(valor) {
    const noEncontrado = listaAtual.buscarDoFim(valor);
    if (!noEncontrado) {
        exibirMensagem(`Valor ${valor} não encontrado na lista!`);
        return;
    }

    let noAtual = listaAtual.fim;
    let index = listaAtual.length - 1;
    while(noAtual !== null) {
        highlightedElements.add(`node-${index}`);
        desenharLista();
        await sleep(700);

        if (noAtual.valor == valor) break;

        highlightedElements.delete(`node-${index}`);
        highlightedElements.add(`back-pointer-${index}`);
        desenharLista();
        await sleep(700);
        highlightedElements.delete(`back-pointer-${index}`);
        
        noAtual = noAtual.anterior;
        index--;
    }

    highlightedElements.clear();
    desenharLista(noEncontrado);
    setTimeout(() => desenharLista(), 2500);
}

async function animarLimpeza() {
    const wrappers = document.querySelectorAll('.node-wrapper');
    wrappers.forEach((wrapper, i) => {
        setTimeout(() => {
            wrapper.classList.add('removing');
        }, i * 100);
    });
    await sleep(wrappers.length * 100 + 500);
    listaAtual.limpar();
    desenharLista();
}

async function animarInversao() {
    if (listaAtual.length <= 1) return;

    let noAnterior = null;
    let noAtual = listaAtual.inicio;
    let noProximo = null;

    for (let i = 0; i < listaAtual.length; i++) {
        noProximo = noAtual.proximo;

        updateVariableDisplay(noAnterior, noAtual, noProximo);
        if(noAnterior) noAnterior.highlight = 'highlight-dest';
        if(noAtual) noAtual.highlight = 'highlight';
        if(noProximo) noProximo.highlight = 'highlight-aux';
        desenharLista();
        await sleep(2000);

        setAnimationCaption(`Desligando o ponteiro 'próximo' do nó <b>${noAtual.valor}</b>.`);
        desenharLista(null, null, { brokenPointer: i });
        await sleep(1500);

        setAnimationCaption(`Religando o ponteiro 'próximo' do nó <b>${noAtual.valor}</b> para <b>${noAnterior ? noAnterior.valor : 'NULL'}</b>.`);
        await sleep(1500);

        if (listaAtual instanceof ListaDuplamenteEncadeada && noAnterior) {
            setAnimationCaption(`Religando o ponteiro 'anterior' do nó <b>${noAnterior.valor}</b> para <b>${noAtual.valor}</b>.`);
             await sleep(1500);
        }

        if(noAnterior) delete noAnterior.highlight;
        if(noAtual) delete noAtual.highlight;
        if(noProximo) delete noProximo.highlight;
        
        noAnterior = noAtual;
        noAtual = noProximo;
    }
    
    setAnimationCaption("Inversão completa!");
    listaAtual.inverter();
    desenharLista();
    await sleep(2000);
    setAnimationCaption();
    const varDisplay = document.getElementById('variable-display');
    if (varDisplay) varDisplay.style.display = 'none';
}

function drawCircularPointer(canvas, firstEl, lastEl) {
    if (!firstEl || !lastEl) return;

    const canvasRect = canvas.getBoundingClientRect();
    const firstRect = firstEl.getBoundingClientRect();
    const lastRect = lastEl.getBoundingClientRect();

    const startX = lastRect.left + (lastRect.width / 2) - canvasRect.left;
    const startY = lastRect.bottom - canvasRect.top - 20;
    
    const endX = firstRect.left + (firstRect.width / 2) - canvasRect.left;
    const endY = firstRect.bottom - canvasRect.top - 20;

    const controlY = startY + 60;

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute('class', 'circular-svg');
    
    const path = document.createElementNS(svgNS, "path");
    const d = `M ${startX} ${startY} Q ${(startX + endX) / 2} ${controlY}, ${endX} ${endY}`;
    path.setAttribute('d', d);
    path.setAttribute('stroke', '#f9a8d4');
    path.setAttribute('stroke-width', '3');
    path.setAttribute('fill', 'none');
    path.setAttribute('marker-end', 'url(#arrowhead-circular)');

    const defs = document.createElementNS(svgNS, 'defs');
    const marker = document.createElementNS(svgNS, 'marker');
    marker.setAttribute('id', 'arrowhead-circular');
    marker.setAttribute('viewBox', '0 0 10 10');
    marker.setAttribute('refX', '8');
    marker.setAttribute('refY', '5');
    marker.setAttribute('markerWidth', '6');
    marker.setAttribute('markerHeight', '6');
    marker.setAttribute('orient', 'auto-start-reverse');
    const arrowPath = document.createElementNS(svgNS, 'path');
    arrowPath.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
    arrowPath.setAttribute('fill', '#f9a8d4');
    
    marker.appendChild(arrowPath);
    defs.appendChild(marker);
    svg.appendChild(defs);
    svg.appendChild(path);
    
    canvas.appendChild(svg);
}


function desenharLista(noDestacado = null, shiftConfig = null, animOverrides = {}) {
    const canvas = document.getElementById('list-canvas');
    if (!document.getElementById('variable-display') || document.getElementById('variable-display').style.display === 'none') {
        canvas.innerHTML = '';
    } else {
        const listContainer = canvas.querySelector('.list-container');
        if (listContainer) listContainer.remove();
        const pendingNode = canvas.querySelector('.pending-node-container');
        if (pendingNode) pendingNode.remove();
    }


    if (!listaAtual) return;

    if (!canvas.querySelector('.list-description')) {
        const descriptionDiv = document.createElement('div');
        descriptionDiv.className = 'list-description';
        if (listaAtual instanceof ListaDuplamenteEncadeada) {
            descriptionDiv.innerHTML = '<b>Lista Duplamente Encadeada:</b> Cada nó aponta para o <span>próximo</span> e para o <span>anterior</span>.';
        } else if (listaAtual instanceof ListaCircular) {
            descriptionDiv.innerHTML = '<b>Lista Circular:</b> O último nó aponta de volta para o <span>início</span>, criando um ciclo.';
        } else {
            descriptionDiv.innerHTML = '<b>Lista Simplesmente Encadeada:</b> Cada nó aponta apenas para o <span>próximo</span>.';
        }
        canvas.prepend(descriptionDiv);
    }


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
    
    do {
        const nodeWrapper = document.createElement('div');
        nodeWrapper.className = 'node-wrapper';
        const noDiv = document.createElement('div');
        noDiv.className = 'list-node';
        
        if(noDestacado === noAtual) noDiv.classList.add('highlight');
        if(highlightedElements.has(`node-${nodeIndex}`)) noDiv.classList.add('highlight-path');
        if(noAtual && noAtual.highlight) noDiv.classList.add(noAtual.highlight);

        noDiv.textContent = noAtual.valor;
        
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

        if (noAtual.proximo !== null && (nodeIndex < listaAtual.length - 1 || !(listaAtual instanceof ListaCircular))) {
            const setaDiv = document.createElement('div');
            setaDiv.className = 'list-pointer';
            if (highlightedElements.has(`pointer-${nodeIndex}`)) setaDiv.classList.add('highlight-path');
            if (animOverrides.brokenPointer === nodeIndex) setaDiv.classList.add('pointer-broken');
            if (shiftConfig && elementCounter >= shiftConfig.shiftStartIndex) {
                setaDiv.style.transform = `translateX(${shiftConfig.shiftDistance}px)`;
            }
            listContainer.appendChild(setaDiv);
            elementCounter++;
        }
        
        if (listaAtual instanceof ListaDuplamenteEncadeada && noAtual.anterior) {
            const backPointerDiv = document.createElement('div');
            backPointerDiv.className = 'back-pointer';
            if (highlightedElements.has(`back-pointer-${nodeIndex}`)) {
                backPointerDiv.classList.add('highlight-path-back');
            }
            nodeWrapper.appendChild(backPointerDiv);
        }
        
        noAtual = noAtual.proximo;
        nodeIndex++;
    } while (noAtual !== null && noAtual !== listaAtual.inicio);


    if (listaAtual.length > 0) {
        if (listaAtual instanceof ListaCircular) {
            const allWrappers = listContainer.querySelectorAll('.node-wrapper');
            const firstNodeEl = allWrappers[0];
            const lastNodeEl = allWrappers[allWrappers.length - 1];
            drawCircularPointer(canvas, firstNodeEl, lastNodeEl);
        } else {
            const finalPointer = document.createElement('div');
            finalPointer.className = 'list-pointer';
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
}

function alternarControles(habilitar) {
    animacaoEmExecucao = !habilitar;
    document.querySelectorAll('#actions-container button, .list-header button').forEach(el => {
        el.disabled = !habilitar;
    });
}

function escolherLista() {
    const tipoListaInput = document.querySelector('input[name="tipo_lista"]:checked');
    if (!tipoListaInput) {
        exibirMensagem('Por favor, selecione um tipo de lista primeiro!');
        return;
    }
    
    switch(tipoListaInput.value) {
        case 'A':
            listaAtual = new ListaSimplesmenteEncadeada();
            document.getElementById('buscarFimBtn').style.display = 'none';
            break;
        case 'B':
            listaAtual = new ListaDuplamenteEncadeada();
            document.getElementById('buscarFimBtn').style.display = 'inline-block';
            break;
        case 'C':
            listaAtual = new ListaCircular();
            document.getElementById('buscarFimBtn').style.display = 'none';
            break;
    }

    document.getElementById('actions-container').style.display = 'flex';
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
        exibirMensagem('Por favor, insira um valor.');
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
            exibirMensagem('Posição inválida!');
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
        exibirMensagem('Por favor, insira um valor para remover.');
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
        exibirMensagem('Por favor, insira um valor para buscar.');
        return;
    }

    alternarControles(false);
    canvas.classList.add('insert-mode'); 

    await animarBusca(valor);

    canvas.classList.remove('insert-mode');
    alternarControles(true);
    inputValor.value = '';
}

async function acaoBuscarReversa() {
    if (animacaoEmExecucao || !listaAtual) return;
    const canvas = document.getElementById('list-canvas');
    const inputValor = document.getElementById('valorBuscar');
    const valor = inputValor.value.trim();

    if (!valor) {
        exibirMensagem('Por favor, insira um valor para buscar.');
        return;
    }

    alternarControles(false);
    canvas.classList.add('reverse-search-mode'); 

    await animarBuscaReversa(valor);

    canvas.classList.remove('reverse-search-mode');
    alternarControles(true);
    inputValor.value = '';
}

async function acaoInverter() {
    if (animacaoEmExecucao || !listaAtual) return;
    alternarControles(false);
    await animarInversao();
    alternarControles(true);
}

async function acaoLimpar() {
    if (animacaoEmExecucao || !listaAtual) return;
    alternarControles(false);
    await animarLimpeza();
    alternarControles(true);
}

document.addEventListener('DOMContentLoaded', () => {
    const escolherBtn = document.querySelector('.list-header button');
    if (escolherBtn) escolherBtn.addEventListener('click', escolherLista);

    const inserirBtn = document.querySelector('.control-group:nth-child(1) button');
    if (inserirBtn) inserirBtn.addEventListener('click', acaoInserir);
    
    const removerBtn = document.querySelector('.control-group:nth-child(2) button');
    if (removerBtn) removerBtn.addEventListener('click', acaoRemover);

    const buscarBtn = document.querySelector('.control-group:nth-child(3) button:first-child');
    if (buscarBtn) buscarBtn.addEventListener('click', acaoBuscar);

    const buscarFimBtn = document.getElementById('buscarFimBtn');
    if(buscarFimBtn) buscarFimBtn.addEventListener('click', acaoBuscarReversa);

    const inverterBtn = document.getElementById('inverterBtn');
    if(inverterBtn) inverterBtn.addEventListener('click', acaoInverter);

    const limparBtn = document.getElementById('limparBtn');
    if(limparBtn) limparBtn.addEventListener('click', acaoLimpar);

    console.log("Simulador de lista pronto e eventos conectados.");
});
