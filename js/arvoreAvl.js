class Node {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.height = 1;
    }
}

class AVLTree {
    constructor() {
        this.root = null;
    }

    height(node) {
        return node ? node.height : 0;
    }

    balanceFactor(node) {
        return node ? this.height(node.left) - this.height(node.right) : 0;
    }

    rightRotate(y) {
        const x = y.left;
        const T2 = x.right;

        x.right = y;
        y.left = T2;

        y.height = Math.max(this.height(y.left), this.height(y.right)) + 1;
        x.height = Math.max(this.height(x.left), this.height(x.right)) + 1;

        return x;
    }

    leftRotate(x) {
        const y = x.right;
        const T2 = y.left;

        y.left = x;
        x.right = T2;

        x.height = Math.max(this.height(x.left), this.height(x.right)) + 1;
        y.height = Math.max(this.height(y.left), this.height(y.right)) + 1;

        return y;
    }

    insert(node, value) {
        if (!node) return new Node(value);
        if (value < node.value) node.left = this.insert(node.left, value);
        else if (value > node.value) node.right = this.insert(node.right, value);
        else return node;

        node.height = 1 + Math.max(this.height(node.left), this.height(node.right));
        const balance = this.balanceFactor(node);

        if (balance > 1 && value < node.left.value) return this.rightRotate(node);
        if (balance < -1 && value > node.right.value) return this.leftRotate(node);
        if (balance > 1 && value > node.left.value) {
            node.left = this.leftRotate(node.left);
            return this.rightRotate(node);
        }
        if (balance < -1 && value < node.right.value) {
            node.right = this.rightRotate(node.right);
            return this.leftRotate(node);
        }

        return node;
    }

    insertValue(value) {
        this.root = this.insert(this.root, value);
    }

    minValueNode(node) {
        while (node.left) node = node.left;
        return node;
    }
    
    removeNode(node, value) {
        if (!node) return node;

        if (value < node.value) node.left = this.removeNode(node.left, value);
        else if (value > node.value) node.right = this.removeNode(node.right, value);
        else {
            if (!node.left) return node.right;
            if (!node.right) return node.left;

            node.value = this.minValueNode(node.right).value;
            node.right = this.removeNode(node.right, node.value);
        }

        node.height = 1 + Math.max(this.height(node.left), this.height(node.right));
        const balance = this.balanceFactor(node);

        if (balance > 1 && this.balanceFactor(node.left) >= 0) return this.rightRotate(node);
        if (balance < -1 && this.balanceFactor(node.right) <= 0) return this.leftRotate(node);
        if (balance > 1 && this.balanceFactor(node.left) < 0) {
            node.left = this.leftRotate(node.left);
            return this.rightRotate(node);
        }
        if (balance < -1 && this.balanceFactor(node.right) > 0) {
            node.right = this.rightRotate(node.right);
            return this.leftRotate(node);
        }

        return node;
    }

    async buscaBinaria(node, value, x = 600, y = 60, nivel = 0) {
        if (!node) {
            exibirMensagem("erro", `Valor ${value} não encontrado na árvore.`);
            return;
        }

        await destacarNo(node, x, y); // destaque visual do nó atual

        if (value === node.value) {
            exibirMensagem("sucesso", `Valor ${value} encontrado na árvore!`);
            return;
        }

        const deslocamento = document.getElementById('tree-canvas').width / Math.pow(2, nivel + 2);

        if (value < node.value) {
            await this.buscaBinaria(node.left, value, x - deslocamento, y + 80, nivel + 1);
        } else {
            await this.buscaBinaria(node.right, value, x + deslocamento, y + 80, nivel + 1);
        }
    }

}

let avlTree = new AVLTree();
