let valoresArvore = []; // Lista de valores inseridos

$(document).ready(function () {
    console.log("jQuery carregado com sucesso!");
});

function validarValor() {
    const inputValor = document.getElementById('valor').value.trim();  // Remove espaços extras

    // Verifica se o valor não está vazio e é um número
    if (inputValor === "" || isNaN(inputValor)) {
        alert("Preencha o campo corretamente!");
        return;  // Se o valor for inválido, a execução da função é interrompida
    }

    valoresArvore.push(Number(inputValor)); // Adiciona o valor na lista
    document.getElementById('valor').value = ''; // Limpa o campo de entrada

    inserirArvore(Number(inputValor)); // Insere o valor na árvore e atualiza o desenho
}

function inserirArvore(valor) {
    avlTree.insertValue(valor); // Insere o valor na árvore AVL
    desenharArvore(avlTree.root); // Atualiza o desenho da árvore no canvas
}

function desenharArvore(root) {
    const canvas = document.getElementById('tree-canvas');
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas

    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";

    // Função recursiva para desenhar os nós
    function desenharNo(node, x, y, gap) {
        if (!node) return;

        // Desenha o nó (círculo)
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, Math.PI * 2);
        ctx.fillStyle = "lightblue";
        ctx.fill();
        ctx.stroke();

        // Desenha o valor no nó
        ctx.fillStyle = "black";
        ctx.fillText(node.value, x, y + 5);

        //Cordenadas da linha
        let comecaX = x - 25;
        let comecaY = y;

        // Desenha as linhas para os filhos
        if (node.left) {
            ctx.beginPath();
            ctx.moveTo(comecaX, comecaY);
            ctx.lineTo(x - gap, y + 70);
            ctx.stroke();
            desenharNo(node.left, x - gap, y + 70, gap / 2);
        }

        if (node.right) {

            const comecaX = x + 25;
            const comecaY = y;

            ctx.beginPath();
            ctx.moveTo(comecaX, comecaY);
            ctx.lineTo(x + gap, y + 70);
            ctx.stroke();
            desenharNo(node.right, x + gap, y + 70, gap / 2);
        }
    }

    // Inicia o desenho da árvore
    desenharNo(root, canvas.width / 2, 50, 150);
}

class Node {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.height = 1;  // Altura inicial do nó
    }
}

class AVLTree {
    constructor() {
        this.root = null;
    }

    // Função para obter a altura de um nó
    height(node) {
        if (!node) return 0;
        return node.height;
    }

    // Função para obter o fator de balanceamento de um nó
    balanceFactor(node) {
        if (!node) return 0;
        return this.height(node.left) - this.height(node.right);
    }

    // Função de rotação à direita
    rightRotate(y) {
        let x = y.left;
        let T2 = x.right;

        // Rotaciona
        x.right = y;
        y.left = T2;

        // Atualiza alturas
        y.height = Math.max(this.height(y.left), this.height(y.right)) + 1;
        x.height = Math.max(this.height(x.left), this.height(x.right)) + 1;

        return x; // Retorna a nova raiz
    }

    // Função de rotação à esquerda
    leftRotate(x) {
        let y = x.right;
        let T2 = y.left;

        // Rotaciona
        y.left = x;
        x.right = T2;

        // Atualiza alturas
        x.height = Math.max(this.height(x.left), this.height(x.right)) + 1;
        y.height = Math.max(this.height(y.left), this.height(y.right)) + 1;

        return y; // Retorna a nova raiz
    }

    // Função de inserção
    insert(node, value) {
        // Passo 1: Realiza a inserção normal na árvore binária
        if (node === null) {
            return new Node(value);
        }

        if (value < node.value) {
            node.left = this.insert(node.left, value);
        } else if (value > node.value) {
            node.right = this.insert(node.right, value);
        } else {
            return node; // Não permite valores duplicados
        }

        // Passo 2: Atualiza a altura do nó
        node.height = 1 + Math.max(this.height(node.left), this.height(node.right));

        // Passo 3: Verifica o fator de balanceamento e realiza as rotações
        let balance = this.balanceFactor(node);

        // Caso 1: Desbalanceamento à esquerda
        if (balance > 1 && value < node.left.value) {
            return this.rightRotate(node);
        }

        // Caso 2: Desbalanceamento à direita
        if (balance < -1 && value > node.right.value) {
            return this.leftRotate(node);
        }

        // Caso 3: Desbalanceamento à esquerda-direita
        if (balance > 1 && value > node.left.value) {
            node.left = this.leftRotate(node.left);
            return this.rightRotate(node);
        }

        // Caso 4: Desbalanceamento à direita-esquerda
        if (balance < -1 && value < node.right.value) {
            node.right = this.rightRotate(node.right);
            return this.leftRotate(node);
        }

        // Retorna o nó (possivelmente alterado por uma rotação)
        return node;
    }

    // Função para inserir o valor na árvore
    insertValue(value) {
        this.root = this.insert(this.root, value);
    }

    // Função para buscar um valor na árvore
    search(node, value) {
        if (node === null) {
            return null; // Valor não encontrado
        }
        if (value === node.value) {
            return node; // Valor encontrado
        }
        if (value < node.value) {
            return this.search(node.left, value); // Busca à esquerda
        }
        return this.search(node.right, value); // Busca à direita
    }

    // Função para remover um nó da árvore
    removeNode(node, value) {
        if (node === null) {
            return node;
        }

        // Passo 1: Busca o nó a ser removido
        if (value < node.value) {
            node.left = this.removeNode(node.left, value);
        } else if (value > node.value) {
            node.right = this.removeNode(node.right, value);
        } else {
            // Nó encontrado, vamos removê-lo
            if (node.left === null) {
                return node.right; // Substitui o nó com seu filho direito
            } else if (node.right === null) {
                return node.left; // Substitui o nó com seu filho esquerdo
            }

            // Caso 3: O nó tem dois filhos, encontramos o sucessor (menor valor na subárvore direita)
            node.value = this.minValueNode(node.right).value;
            node.right = this.removeNode(node.right, node.value); // Remove o sucessor
        }

        // Passo 2: Atualiza a altura do nó
        node.height = 1 + Math.max(this.height(node.left), this.height(node.right));

        // Passo 3: Verifica o fator de balanceamento e realiza as rotações
        let balance = this.balanceFactor(node);

        // Caso 1: Desbalanceamento à esquerda
        if (balance > 1 && this.balanceFactor(node.left) >= 0) {
            return this.rightRotate(node);
        }

        // Caso 2: Desbalanceamento à direita
        if (balance < -1 && this.balanceFactor(node.right) <= 0) {
            return this.leftRotate(node);
        }

        // Caso 3: Desbalanceamento à esquerda-direita
        if (balance > 1 && this.balanceFactor(node.left) < 0) {
            node.left = this.leftRotate(node.left);
            return this.rightRotate(node);
        }

        // Caso 4: Desbalanceamento à direita-esquerda
        if (balance < -1 && this.balanceFactor(node.right) > 0) {
            node.right = this.rightRotate(node.right);
            return this.leftRotate(node);
        }

        return node;
    }

    // Função para encontrar o nó com o valor mínimo (usado na remoção)
    minValueNode(node) {
        let current = node;
        while (current.left !== null) {
            current = current.left;
        }
        return current;
    }

}

let avlTree = new AVLTree();

function removerValor() {
    const removeValor = document.getElementById('valorRemove').value.trim(); // Obtém o valor a ser removido
    if (!removeValor || isNaN(removeValor)) {
        alert("Preencha o campo corretamente!");
        return;
    }

    if (!avlTree.root) {
        alert("Árvore vazia!");
        return;
    }

    avlTree.root = avlTree.removeNode(avlTree.root, Number(removeValor)); // Remove o nó da árvore
    desenharArvore(avlTree.root); // Atualiza a visualização da árvore
}