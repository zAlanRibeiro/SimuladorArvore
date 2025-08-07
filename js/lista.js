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
        if (posicao < 0 || posicao > this.length) {
            return false;
        }
        if (posicao === this.length) {
            this.inserirValor(valor);
            return true;
        }
        
        const novoNo = new Node(valor);
        if (posicao === 0) {
            novoNo.proximo = this.inicio;
            this.inicio = novoNo;
            if (this.length === 0) {
                this.fim = novoNo;
            }
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
}
