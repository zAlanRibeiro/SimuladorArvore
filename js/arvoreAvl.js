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
        if (node == null) return node;
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

    minValueNode(node) {
        let current = node;
        while (current.left !== null) {
            current = current.left;
        }
        return current;
    }

    async buscaBinaria(node, value, x, y, nivel, controller) {
        if (!node || (controller && controller.skip)) return;
        await destacarNo(node, x, y, controller);
        if (value === node.value) {
            exibirMensagem("sucesso", `Valor ${value} encontrado na árvore!`);
            return;
        }
        const deslocamento = document.getElementById('tree-canvas').width / Math.pow(2, nivel + 2);
        if (value < node.value) {
            await this.buscaBinaria(node.left, value, x - deslocamento, y + 80, nivel + 1, controller);
        } else {
            await this.buscaBinaria(node.right, value, x + deslocamento, y + 80, nivel + 1, controller);
        }
    }

    async insertValueAnimado(value, controller) {
        const canvas = document.getElementById('tree-canvas');
        const ctx = canvas.getContext('2d');
        desenharNoPendente(ctx, value, 50, 50);
        await this.pausableDelay(500, controller);
        if (controller.skip) return;
        this.root = await this.insertAnimadoRecursivo(this.root, value, canvas.width / 2, 60, 0, controller);
    }
    
    async pausableDelay(ms, controller) {
        let remaining = ms;
        while (remaining > 0) {
            if (controller.skip) return;
            if (!animacaoPausada) {
                const delay = Math.min(remaining, 50);
                await new Promise(r => setTimeout(r, delay));
                remaining -= delay;
            } else {
                await new Promise(r => setTimeout(r, 50));
            }
        }
    }

    async animateNodeFlight(startX, startY, endX, endY, value, controller) {
        const duration = 500;
        let startTime = null;
        let timeSpentPaused = 0;
        let lastPauseTime = null;
        return new Promise(resolve => {
            const step = (currentTime) => {
                if (controller.skip) { resolve(); return; }
                if (animacaoPausada) {
                    if (lastPauseTime === null) lastPauseTime = currentTime;
                    requestAnimationFrame(step);
                    return;
                }
                if (lastPauseTime !== null) {
                    timeSpentPaused += (currentTime - lastPauseTime);
                    lastPauseTime = null;
                }
                if (startTime === null) startTime = currentTime;
                const elapsedTime = currentTime - startTime - timeSpentPaused;
                const progress = Math.min(elapsedTime / duration, 1);
                const easeOutQuad = t => t * (2 - t);
                const easedProgress = easeOutQuad(progress);
                const currentX = startX + (endX - startX) * easedProgress;
                const currentY = startY + (endY - startY) * easedProgress;
                desenharArvore(this.root);
                const canvas = document.getElementById('tree-canvas');
                const ctx = canvas.getContext('2d');
                this.drawNode(ctx, currentX, currentY, value, "springgreen");
                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    resolve();
                }
            };
            requestAnimationFrame(step);
        });
    }

    async insertAnimadoRecursivo(node, value, x, y, nivel, controller) {
        if (controller.skip) return node;
        if (!node) {
            await this.animateNodeFlight(50, 50, x, y, value, controller);
            return controller.skip ? null : new Node(value);
        }
        if (value === node.value) {
            exibirMensagem("erro", `O valor ${value} já existe na árvore.`);
            desenharArvore(this.root);
            return node;
        }
        await destacarNo(node, x, y, controller);
        if (controller.skip) return node;
        const canvas = document.getElementById('tree-canvas');
        const deslocamento = canvas.width / Math.pow(2, nivel + 2);
        if (value < node.value) {
            node.left = await this.insertAnimadoRecursivo(node.left, value, x - deslocamento, y + 80, nivel + 1, controller);
        } else if (value > node.value) {
            node.right = await this.insertAnimadoRecursivo(node.right, value, x + deslocamento, y + 80, nivel + 1, controller);
        }
        if (controller.skip) return node;
        node.height = 1 + Math.max(this.height(node.left), this.height(node.right));
        const balance = this.balanceFactor(node);
        if (Math.abs(balance) > 1) {
            let rotationType = '';
            if (balance > 1 && value < node.left.value) rotationType = 'LL';
            else if (balance < -1 && value > node.right.value) rotationType = 'RR';
            else if (balance > 1 && value > node.left.value) rotationType = 'LR';
            else if (balance < -1 && value < node.right.value) rotationType = 'RL';
            if (rotationType) {
                await this.animateRotation(node, x, y, nivel, rotationType, controller);
            }
            return controller.skip ? node : this.performLogicalRotation(node, rotationType);
        }
        return node;
    }

    cloneNode(node) {
        if (!node) return null;
        const newNode = new Node(node.value);
        newNode.height = node.height;
        newNode.left = this.cloneNode(node.left);
        newNode.right = this.cloneNode(node.right);
        return newNode;
    }

    getNodePositions(node, startX, startY, nivel, positionsMap) {
        if (!node) return;
        positionsMap.set(node.value, { x: startX, y: startY, node: node });
        const canvas = document.getElementById('tree-canvas');
        const deslocamento = canvas.width / Math.pow(2, nivel + 2);
        this.getNodePositions(node.left, startX - deslocamento, startY + 80, nivel + 1, positionsMap);
        this.getNodePositions(node.right, startX + deslocamento, startY + 80, nivel + 1, positionsMap);
    }

    performLogicalRotation(node, rotationType) {
        switch (rotationType) {
            case 'LL': return this.rightRotate(node);
            case 'RR': return this.leftRotate(node);
            case 'LR': node.left = this.leftRotate(node.left); return this.rightRotate(node);
            case 'RL': node.right = this.rightRotate(node.right); return this.leftRotate(node);
            default: return node;
        }
    }

    async animateRotation(unbalancedNode, x, y, nivel, rotationType, controller) {
        exibirMensagem("sucesso", `Desbalanceamento detectado! Rotacionando...`);
        const initialPositions = new Map();
        this.getNodePositions(unbalancedNode, x, y, nivel, initialPositions);
        const clonedNode = this.cloneNode(unbalancedNode);
        const finalSubtreeRoot = this.performLogicalRotation(clonedNode, rotationType);
        const finalPositions = new Map();
        this.getNodePositions(finalSubtreeRoot, x, y, nivel, finalPositions);
        const duration = 800;
        let startTime = null;
        let timeSpentPaused = 0;
        let lastPauseTime = null;
        return new Promise(resolve => {
            const step = (currentTime) => {
                if (controller.skip) { resolve(); return; }
                if (animacaoPausada) {
                    if (lastPauseTime === null) lastPauseTime = currentTime;
                    requestAnimationFrame(step);
                    return;
                }
                if (lastPauseTime !== null) {
                    timeSpentPaused += (currentTime - lastPauseTime);
                    lastPauseTime = null;
                }
                if (startTime === null) startTime = currentTime;
                const elapsedTime = currentTime - startTime - timeSpentPaused;
                const progress = Math.min(elapsedTime / duration, 1);
                const ease = t => t * (2 - t);
                const easedProgress = ease(progress);
                const canvas = document.getElementById('tree-canvas');
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const drawStaticPart = (node, currentX, currentY, currentNivel) => {
                    if (!node || initialPositions.has(node.value)) return;
                    this.drawNode(ctx, currentX, currentY, node.value, 'lightblue');
                    const d = canvas.width / Math.pow(2, currentNivel + 2);
                    if (node.left && !initialPositions.has(node.left.value)) {
                        ctx.beginPath(); ctx.moveTo(currentX, currentY); ctx.lineTo(currentX - d, currentY + 80); ctx.stroke();
                    }
                    drawStaticPart(node.left, currentX - d, currentY + 80, currentNivel + 1);
                    if (node.right && !initialPositions.has(node.right.value)) {
                        ctx.beginPath(); ctx.moveTo(currentX, currentY); ctx.lineTo(currentX + d, currentY + 80); ctx.stroke();
                    }
                    drawStaticPart(node.right, currentX + d, currentY + 80, currentNivel + 1);
                };
                drawStaticPart(this.root, canvas.width / 2, 60, 0);
                for (const [value, initialPos] of initialPositions.entries()) {
                    const finalPos = finalPositions.get(value);
                    if (!finalPos) continue;
                    finalPos.currentX = initialPos.x + (finalPos.x - initialPos.x) * easedProgress;
                    finalPos.currentY = initialPos.y + (finalPos.y - initialPos.y) * easedProgress;
                }
                for (const [value, finalPosData] of finalPositions.entries()) {
                    this.drawNode(ctx, finalPosData.currentX, finalPosData.currentY, value, 'orange');
                    const parentNode = this.findParent(finalSubtreeRoot, value);
                    if (parentNode) {
                        const parentPosData = finalPositions.get(parentNode.value);
                        if (parentPosData) {
                            ctx.beginPath();
                            ctx.moveTo(finalPosData.currentX, finalPosData.currentY);
                            ctx.lineTo(parentPosData.currentX, parentPosData.currentY);
                            ctx.stroke();
                        }
                    }
                }
                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    resolve();
                }
            };
            requestAnimationFrame(step);
        });
    }

    drawNode(ctx, x, y, value, color) {
        const raio = 25;
        ctx.beginPath();
        ctx.arc(x, y, raio, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "black";
        ctx.fillText(value, x, y + 6);
    }

    findParent(root, value) {
        if (!root || root.value === value) return null;
        let current = root;
        let parent = null;
        while (current && current.value !== value) {
            parent = current;
            if (value < current.value) {
                current = current.left;
            } else {
                current = current.right;
            }
        }
        return parent;
    }
    
    rebuildTreeFromState(structuredNode) {
        if (!structuredNode) {
            return null;
        }
        const newNode = new Node(structuredNode.value);
        newNode.left = this.rebuildTreeFromState(structuredNode.left);
        newNode.right = this.rebuildTreeFromState(structuredNode.right);
        newNode.height = 1 + Math.max(this.height(newNode.left), this.height(newNode.right));
        return newNode;
    }

    // --- NOVAS FUNÇÕES PARA ANIMAÇÃO DO HISTÓRICO ---

    getStructuredNodePositions(structuredNode, startX, startY, nivel, positionsMap) {
        if (!structuredNode) return;
        positionsMap.set(structuredNode.value, { x: startX, y: startY });
        const canvas = document.getElementById('tree-canvas');
        const deslocamento = canvas.width / Math.pow(2, nivel + 2);
        this.getStructuredNodePositions(structuredNode.left, startX - deslocamento, startY + 80, nivel + 1, positionsMap);
        this.getStructuredNodePositions(structuredNode.right, startX + deslocamento, startY + 80, nivel + 1, positionsMap);
    }

    findParentInStructure(root, value) {
        if (!root || root.value === value) return null;
        let current = root;
        let parent = null;
        while (current && current.value !== value) {
            parent = current;
            if (value < current.value) current = current.left;
            else current = current.right;
        }
        return parent;
    }

    async animateStateTransition(initialTree, finalTree, controller) {
        const canvas = document.getElementById('tree-canvas');
        const initialPositions = new Map();
        this.getStructuredNodePositions(initialTree, canvas.width / 2, 60, 0, initialPositions);
        const finalPositions = new Map();
        this.getStructuredNodePositions(finalTree, canvas.width / 2, 60, 0, finalPositions);
        const allValues = new Set([...initialPositions.keys(), ...finalPositions.keys()]);
        const duration = 600;
        let startTime = null;
        let timeSpentPaused = 0;
        let lastPauseTime = null;

        return new Promise(resolve => {
            const step = (currentTime) => {
                if (controller.skip) { resolve(); return; }
                if (animacaoPausada) {
                    if (lastPauseTime === null) lastPauseTime = currentTime;
                    requestAnimationFrame(step);
                    return;
                }
                if (lastPauseTime !== null) {
                    timeSpentPaused += (currentTime - lastPauseTime);
                    lastPauseTime = null;
                }
                if (startTime === null) startTime = currentTime;
                const elapsedTime = currentTime - startTime - timeSpentPaused;
                const progress = Math.min(elapsedTime / duration, 1);
                const ease = t => t * (2 - t);
                const easedProgress = ease(progress);
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                for (const value of allValues) {
                    const finalPos = finalPositions.get(value);
                    if (!finalPos) continue;
                    const parentValue = this.findParentInStructure(finalTree, value)?.value;
                    if (parentValue) {
                        const parentFinalPos = finalPositions.get(parentValue);
                        if (parentFinalPos) {
                            const initialParentPos = initialPositions.get(parentValue) || parentFinalPos;
                            const initialChildPos = initialPositions.get(value) || finalPos;
                            const parentX = initialParentPos.x + (parentFinalPos.x - initialParentPos.x) * easedProgress;
                            const parentY = initialParentPos.y + (parentFinalPos.y - initialParentPos.y) * easedProgress;
                            const childX = initialChildPos.x + (finalPos.x - initialChildPos.x) * easedProgress;
                            const childY = initialChildPos.y + (finalPos.y - initialChildPos.y) * easedProgress;
                            ctx.beginPath();
                            ctx.moveTo(parentX, parentY);
                            ctx.lineTo(childX, childY);
                            ctx.stroke();
                        }
                    }
                }

                for (const value of allValues) {
                    const initialPos = initialPositions.get(value);
                    const finalPos = finalPositions.get(value);
                    let currentX, currentY, color;
                    let opacity = 1;
                    if (initialPos && finalPos) {
                        currentX = initialPos.x + (finalPos.x - initialPos.x) * easedProgress;
                        currentY = initialPos.y + (finalPos.y - initialPos.y) * easedProgress;
                        color = 'lightblue';
                    } else if (!initialPos && finalPos) {
                        currentX = finalPos.x;
                        currentY = finalPos.y;
                        color = 'springgreen';
                        opacity = easedProgress;
                    } else if (initialPos && !finalPos) {
                        currentX = initialPos.x;
                        currentY = initialPos.y;
                        color = 'tomato';
                        opacity = 1 - easedProgress;
                    } else {
                        continue;
                    }
                    ctx.globalAlpha = opacity;
                    this.drawNode(ctx, currentX, currentY, value, color);
                    ctx.globalAlpha = 1;
                }

                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    resolve();
                }
            };
            requestAnimationFrame(step);
        });
    }
}

let avlTree = new AVLTree();
