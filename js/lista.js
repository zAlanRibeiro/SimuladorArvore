class Node {
    constructor(valor) {
        this.valor = valor;
        this.proximo = null;
        this.anterior = null;
    }
}

class ListaSimplesmenteEncadeada {
    constructor() {
        this.inicio = null;
        this.fim = null;
        this.length = 0;
        this.pendingNode = null;
    }

    inserirValor(valor) {
        const novoNo = new Node(valor);
        if (this.inicio === null) {
            this.inicio = novoNo;
            this.fim = novoNo;
        } else {
            this.fim.proximo = novoNo;
            this.fim = novoNo;
        }
        this.length++;
    }

    inserirEmPosicao(valor, posicao) {
        if (posicao < 0 || posicao > this.length) return false;
        if (posicao === this.length) {
            this.inserirValor(valor);
            return true;
        }
        
        const novoNo = new Node(valor);
        if (posicao === 0) {
            novoNo.proximo = this.inicio;
            this.inicio = novoNo;
        } else {
            let noAnterior = this.inicio;
            for (let i = 0; i < posicao - 1; i++) {
                noAnterior = noAnterior.proximo;
            }
            novoNo.proximo = noAnterior.proximo;
            noAnterior.proximo = novoNo;
        }
        this.length++;
        return true;
    }

    removerValor(valor) {
        if (!this.inicio) return;
        if (this.inicio.valor == valor) {
            this.inicio = this.inicio.proximo;
            if (this.inicio === null) this.fim = null;
            this.length--;
            return;
        }

        let noAnterior = this.inicio;
        let noAtual = this.inicio.proximo;
        while (noAtual !== null && noAtual.valor != valor) {
            noAnterior = noAtual;
            noAtual = noAtual.proximo;
        }

        if (noAtual !== null) {
            noAnterior.proximo = noAtual.proximo;
            if (noAnterior.proximo === null) this.fim = noAnterior;
            this.length--;
        }
    }

    buscar(valor) {
        if (!this.inicio) return null;
        let noAtual = this.inicio;
        while (noAtual !== null && noAtual.valor != valor) {
            noAtual = noAtual.proximo;
        }
        return noAtual;
    }

    encontrarPosicao(valor) {
        let noAtual = this.inicio;
        let index = 0;
        while (noAtual !== null) {
            if (noAtual.valor == valor) return index;
            noAtual = noAtual.proximo;
            index++;
        }
        return -1;
    }

    limpar() {
        this.inicio = null;
        this.fim = null;
        this.length = 0;
    }

    inverter() {
        if (this.length <= 1) return;

        let anterior = null;
        let atual = this.inicio;
        let proximo = null;
        this.fim = this.inicio;

        while (atual !== null) {
            proximo = atual.proximo;
            atual.proximo = anterior;
            anterior = atual;
            atual = proximo;
        }
        this.inicio = anterior;
    }
}

class ListaDuplamenteEncadeada extends ListaSimplesmenteEncadeada {
    inserirValor(valor) {
        const novoNo = new Node(valor);
        if (this.inicio === null) {
            this.inicio = novoNo;
            this.fim = novoNo;
        } else {
            novoNo.anterior = this.fim;
            this.fim.proximo = novoNo;
            this.fim = novoNo;
        }
        this.length++;
    }

    inserirEmPosicao(valor, posicao) {
        if (posicao < 0 || posicao > this.length) return false;
        if (posicao === this.length) {
            this.inserirValor(valor);
            return true;
        }

        const novoNo = new Node(valor);
        if (posicao === 0) {
            novoNo.proximo = this.inicio;
            if (this.inicio) {
                this.inicio.anterior = novoNo;
            } else {
                this.fim = novoNo; // Se a lista estava vazia
            }
            this.inicio = novoNo;
        } else {
            let noAnterior = this.inicio;
            for (let i = 0; i < posicao - 1; i++) {
                noAnterior = noAnterior.proximo;
            }
            const noSeguinte = noAnterior.proximo;

            novoNo.proximo = noSeguinte;
            novoNo.anterior = noAnterior;

            noAnterior.proximo = novoNo;
            if (noSeguinte) {
                noSeguinte.anterior = novoNo;
            } else {
                this.fim = novoNo; // Se inseriu no final
            }
        }
        this.length++;
        return true;
    }

    removerValor(valor) {
        if (!this.inicio) return;
        let noParaRemover = this.buscar(valor);

        if (!noParaRemover) return;

        if (noParaRemover === this.inicio) this.inicio = noParaRemover.proximo;
        if (noParaRemover === this.fim) this.fim = noParaRemover.anterior;
        if (noParaRemover.proximo) noParaRemover.proximo.anterior = noParaRemover.anterior;
        if (noParaRemover.anterior) noParaRemover.anterior.proximo = noParaRemover.proximo;
        
        this.length--;
    }

    buscar(valor) {
        if (!this.inicio) return null;
        let noAtual = this.inicio;
        while (noAtual !== null && noAtual.valor != valor) {
            noAtual = noAtual.proximo;
        }
        return noAtual;
    }

    buscarDoFim(valor) {
        if (!this.fim) return null;
        let noAtual = this.fim;
        while (noAtual !== null && noAtual.valor != valor) {
            noAtual = noAtual.anterior;
        }
        return noAtual;
    }

    inverter() {
        if (this.length <= 1) return;

        let atual = this.inicio;
        let temp = null;

        // Troca os ponteiros anterior e proximo de todos os nós
        while (atual) {
            temp = atual.anterior;
            atual.anterior = atual.proximo;
            atual.proximo = temp;
            atual = atual.anterior; // Move para o próximo nó (que agora é o 'anterior')
        }

        // Troca o início e o fim da lista
        temp = this.inicio;
        this.inicio = this.fim;
        this.fim = temp;
    }
}

class ListaCircular extends ListaSimplesmenteEncadeada {
    inserirValor(valor) {
        const novoNo = new Node(valor);
        if (this.inicio === null) {
            this.inicio = novoNo;
            this.fim = novoNo;
            novoNo.proximo = this.inicio;
        } else {
            novoNo.proximo = this.inicio;
            this.fim.proximo = novoNo;
            this.fim = novoNo;
        }
        this.length++;
    }

    inserirEmPosicao(valor, posicao) {
        if (posicao < 0 || posicao > this.length) return false;
        if (posicao === this.length) {
            this.inserirValor(valor);
            return true;
        }

        const novoNo = new Node(valor);
        if (posicao === 0) {
            novoNo.proximo = this.inicio;
            this.inicio = novoNo;
            this.fim.proximo = this.inicio;
        } else {
            let noAnterior = this.inicio;
            for (let i = 0; i < posicao - 1; i++) {
                noAnterior = noAnterior.proximo;
            }
            novoNo.proximo = noAnterior.proximo;
            noAnterior.proximo = novoNo;
        }
        this.length++;
        return true;
    }

    removerValor(valor) {
        if (!this.inicio) return;
        let noAtual = this.inicio;
        let noAnterior = this.fim;
        
        for(let i = 0; i < this.length; i++) {
            if(noAtual.valor == valor) {
                if (this.length === 1) {
                    this.inicio = null;
                    this.fim = null;
                } else {
                    noAnterior.proximo = noAtual.proximo;
                    if (noAtual === this.inicio) this.inicio = noAtual.proximo;
                    if (noAtual === this.fim) this.fim = noAnterior;
                }
                this.length--;
                return;
            }
            noAnterior = noAtual;
            noAtual = noAtual.proximo;
        }
    }
}
