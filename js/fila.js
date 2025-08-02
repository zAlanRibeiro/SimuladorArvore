class Queue {
    /**
     * Construtor da Fila.
     * @param {number} id - Um identificador único para a fila.
     * @param {string} nome - O nome de exibição da fila.
     */
    constructor(id, nome) {
        this.id = id;
        this.nome = nome;
        this.front = null;
        this.rear = null;
        this.size = 0;
        this.maxSize = 10; 
    }

    enqueue(value) {
        if (this.isFull()) return false;
        const newNode = new Node(value);
        if (this.isEmpty()) {
            this.front = newNode;
            this.rear = newNode;
        } else {
            this.rear.next = newNode;
            this.rear = newNode;
        }
        this.size++;
        return true;
    }

    dequeue() {
        if (this.isEmpty()) return null;
        const removedNode = this.front;
        this.front = this.front.next;
        this.size--;
        if (this.isEmpty()) {
            this.rear = null;
        }
        return removedNode.value;
    }

    peek() {
        return this.isEmpty() ? null : this.front.value;
    }

    isEmpty() {
        return this.size === 0;
    }

    isFull() {
        return this.size >= this.maxSize;
    }

    clear() {
        this.front = null;
        this.rear = null;
        this.size = 0;
    }
}

class Node {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}
