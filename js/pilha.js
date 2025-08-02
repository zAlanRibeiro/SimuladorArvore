class Pilha {
    constructor(id, nome) {
        this.id = id;
        this.nome = nome;
        this.itens = [];
        this.maxSize = 10;
    }

    empilhar(elemento) {
        if (this.estaCheia()) return false;
        this.itens.push(elemento);
        return true;
    }

    desempilhar() {
        if (this.estaVazia()) return undefined;
        return this.itens.pop();
    }

    espiarTopo() {
        if (this.estaVazia()) return undefined;
        return this.itens[this.itens.length - 1];
    }

    estaVazia() {
        return this.itens.length === 0;
    }

    estaCheia() {
        return this.itens.length >= this.maxSize;
    }

    tamanho() {
        return this.itens.length;
    }

    limpar() {
        this.itens = [];
    }
}
