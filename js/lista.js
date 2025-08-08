/**
 * Classe que define a estrutura de cada "elo" da lista.
 */
class Node {
    constructor(valor) {
        this.valor = valor;
        this.proximo = null;
        this.anterior = null;
    }
}

/**
 * Classe que gerencia a Lista Simplesmente Encadeada e suas operações.
 */
class ListaSimplesmenteEncadeada {
    constructor() {
        this.inicio = null;
        this.fim = null;
        this.length = 0;
        this.pendingNode = null; // Usado para a animação de inserção
    }

    /**
     * Adiciona um novo nó no final da lista (apenas a lógica).
     */
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

    /**
     * Insere um nó em uma posição específica (apenas a lógica).
     */
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

    /**
     * Remove o primeiro nó que encontrar com o valor especificado.
     */
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

    /**
     * Busca por um valor na lista.
     */
    buscar(valor) {
        if (!this.inicio) return null;
        let noAtual = this.inicio;
        while (noAtual !== null && noAtual.valor != valor) {
            noAtual = noAtual.proximo;
        }
        return noAtual;
    }

    /**
     * NOVO MÉTODO: Encontra o índice de um valor na lista.
     */
    encontrarPosicao(valor) {
        let noAtual = this.inicio;
        let index = 0;
        while (noAtual !== null) {
            if (noAtual.valor == valor) {
                return index;
            }
            noAtual = noAtual.proximo;
            index++;
        }
        return -1; // Retorna -1 se não encontrar
    }
}
