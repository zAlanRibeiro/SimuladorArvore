document.addEventListener('DOMContentLoaded', () => {
    const addFilaBtn = document.getElementById('add-fila-btn');
    const addPilhaBtn = document.getElementById('add-pilha-btn');
    const workspace = document.getElementById('workspace');
    const mensagemDiv = document.getElementById('mensagem');

    let estruturas = [];
    let proximoId = 1;

    function renderizarTudo() {
        workspace.innerHTML = '';
        estruturas.forEach(est => {
            workspace.appendChild(criarElementoEstrutura(est));
        });
    }

    function criarElementoEstrutura(est) {
        const container = document.createElement('div');
        container.className = 'structure-container';
        container.dataset.id = est.id;

        const tipo = est instanceof Queue ? 'Fila' : 'Pilha';
        const isQueue = tipo === 'Fila';

        const header = document.createElement('div');
        header.className = 'structure-header';
        header.innerHTML = `
            <div class="structure-title-group">
                <h3>${est.nome}</h3>
                <button class="delete-btn" data-action="delete" title="Apagar Estrutura">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            <div class="structure-controls">
                <input type="text" class="input-field value-input" placeholder="Valor...">
                <button class="btn btn-success" data-action="add">${isQueue ? 'Enfileirar' : 'Empilhar'}</button>
                <button class="btn btn-danger" data-action="remove">${isQueue ? 'Desenfileirar' : 'Desempilhar'}</button>
                <button class="btn btn-primary" data-action="transfer">Mover ➔</button>
            </div>
        `;
        container.appendChild(header);

        const body = document.createElement('div');
        body.className = `structure-body ${isQueue ? 'queue-body' : 'stack-body'}`;
        
        const elementos = isQueue ? getQueueElements(est) : est.itens;
        elementos.forEach(item => {
            const el = document.createElement('div');
            el.className = 'data-element';
            el.textContent = item;
            body.appendChild(el);
        });
        container.appendChild(body);

        const infoPanel = document.createElement('div');
        infoPanel.className = 'structure-info';
        const tamanho = isQueue ? est.size : est.tamanho();
        const maxTamanho = est.maxSize;
        const proximoElemento = isQueue ? est.peek() : est.espiarTopo();
        infoPanel.innerHTML = `
            <div>
                <h4>Tamanho</h4>
                <p class="${tamanho === maxTamanho ? 'full' : ''}">${tamanho} / ${maxTamanho}</p>
            </div>
            <div>
                <h4>${isQueue ? 'Próximo a Sair' : 'Topo'}</h4>
                <p>${proximoElemento !== undefined && proximoElemento !== null ? proximoElemento : '-'}</p>
            </div>
        `;
        container.appendChild(infoPanel);

        return container;
    }
    
    function getQueueElements(queue) {
        const elements = [];
        let current = queue.front;
        while(current) {
            elements.push(current.value);
            current = current.next;
        }
        return elements;
    }

    addFilaBtn.addEventListener('click', () => {
        if (estruturas.length >= 2) {
            exibirMensagem("O limite de 2 estruturas foi atingido.", "erro");
            return;
        }
        const nome = `Fila ${proximoId}`;
        const novaFila = new Queue(proximoId, nome);
        estruturas.push(novaFila);
        proximoId++;
        renderizarTudo();
    });

    addPilhaBtn.addEventListener('click', () => {
        if (estruturas.length >= 2) {
            exibirMensagem("O limite de 2 estruturas foi atingido.", "erro");
            return;
        }
        const nome = `Pilha ${proximoId}`;
        const novaPilha = new Pilha(proximoId, nome);
        estruturas.push(novaPilha);
        proximoId++;
        renderizarTudo();
    });

    workspace.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        const container = target.closest('.structure-container');
        if (!container) return;

        const id = Number(container.dataset.id);
        const est = estruturas.find(s => s.id === id);
        if (!est) return;

        const action = target.dataset.action;
        let stateChanged = false;

        if (action === 'add') {
            const input = container.querySelector('.value-input');
            const valor = input.value.trim();
            if (valor) {
                const success = est instanceof Queue ? est.enqueue(valor) : est.empilhar(valor);
                if (success) {
                    stateChanged = true;
                    input.value = '';
                } else {
                    exibirMensagem(`A estrutura '${est.nome}' está cheia!`, 'erro');
                }
            }
        } else if (action === 'remove' || action === 'transfer') {
            const body = container.querySelector('.structure-body');
            // CORREÇÃO: Seleciona o elemento correto para a Fila (primeiro) e para a Pilha (último)
            const elementoParaRemover = est instanceof Queue ? body.firstElementChild : body.lastElementChild;

            if (elementoParaRemover) {
                const animationClass = est instanceof Queue ? 'exiting-queue' : 'exiting-stack';
                elementoParaRemover.classList.add(animationClass);

                setTimeout(() => {
                    if (action === 'remove') {
                        est instanceof Queue ? est.dequeue() : est.desempilhar();
                    } else { // Lógica de transferência
                        const indexAtual = estruturas.findIndex(s => s.id === id);
                         if (estruturas.length < 2) {
                            exibirMensagem('É preciso ter outra estrutura para transferir.', 'erro');
                            renderizarTudo();
                            return;
                        }
                        const indexDestino = (indexAtual + 1) % estruturas.length;
                        const destino = estruturas[indexDestino];
                        const elemento = est instanceof Queue ? est.dequeue() : est.desempilhar();

                        if (elemento !== undefined && elemento !== null) {
                            const success = destino instanceof Queue ? destino.enqueue(elemento) : destino.empilhar(elemento);
                            if (!success) {
                                est instanceof Queue ? est.enqueue(elemento) : est.empilhar(elemento);
                                exibirMensagem(`A estrutura de destino '${destino.nome}' está cheia!`, 'erro');
                            }
                        }
                    }
                    renderizarTudo();
                }, 500);
            } else {
                exibirMensagem(`A estrutura '${est.nome}' está vazia!`, 'erro');
            }
            return;
        } else if (action === 'delete') {
            estruturas = estruturas.filter(s => s.id !== id);
            stateChanged = true;
        }
        
        if (stateChanged) {
            renderizarTudo();
        }
    });

    function exibirMensagem(texto, tipo = 'erro') {
        mensagemDiv.textContent = texto;
        mensagemDiv.className = `mensagem mensagem-${tipo}`;
        mensagemDiv.style.display = 'block';
        setTimeout(() => {
            mensagemDiv.style.display = 'none';
        }, 3000);
    }
});
