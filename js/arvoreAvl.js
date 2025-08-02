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
        this.PENDING_NODE_X = 80;
        this.PENDING_NODE_Y = 70;
        this.lastOperationSuccess = true;
        this.pendingNodeInfo = null;
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
            let temp = this.minValueNode(node.right);
            node.value = temp.value;
            node.right = this.removeNode(node.right, temp.value);
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

    async destacarNo(node, x, y, controller) {
        if (controller && controller.skip) return;

        // Desenha a árvore com o nó destacado, usando o sistema de overrides
        desenharArvore(this, { [node.value]: { color: "limegreen" } });

        await this.pausableDelay(500, controller);

        if (controller && controller.skip) {
             desenharArvore(this); // Limpa o destaque ao saltar
             return;
        }
        
        desenharArvore(this); // Remove o destaque
    }

    async buscaBinaria(node, value, x, y, nivel, controller) {
        if (!node || (controller && controller.skip)) {
            if (!node) setSubtitle(`Valor ${value} não encontrado.`);
            return;
        };
        
        setSubtitle(`Procurando... Comparando ${value} com ${node.value}.`);
        await this.destacarNo(node, x, y, controller);

        if (value === node.value) {
            setSubtitle(`Valor ${value} encontrado!`);
            return;
        }

        const deslocamento = document.getElementById('tree-canvas').width / Math.pow(2, nivel + 2);
        if (value < node.value) {
            setSubtitle(`${value} < ${node.value}. Indo para a esquerda.`);
            await this.pausableDelay(800, controller);
            await this.buscaBinaria(node.left, value, x - deslocamento, y + 80, nivel + 1, controller);
        } else {
            setSubtitle(`${value} > ${node.value}. Indo para a direita.`);
            await this.pausableDelay(800, controller);
            await this.buscaBinaria(node.right, value, x + deslocamento, y + 80, nivel + 1, controller);
        }
    }

    async insertValueAnimado(value, controller) {
        this.lastOperationSuccess = true;
        setSubtitle(`Inserindo o valor ${value}...`);
        
        this.pendingNodeInfo = { value, x: this.PENDING_NODE_X, y: this.PENDING_NODE_Y, text: "Inserindo..." };
        desenharArvore(this);

        await this.pausableDelay(1000, controller);
        if (controller.skip) {
            this.pendingNodeInfo = null;
            return;
        }
        
        const canvas = document.getElementById('tree-canvas');
        this.root = await this.insertAnimadoRecursivo(this.root, value, canvas.width / 2, 60, 0, controller);
        this.pendingNodeInfo = null;
        desenharArvore(this);
    }
    
    async pausableDelay(ms, controller) {
        return new Promise(resolve => {
            let start = null;
            let elapsed = 0;
            let lastTimestamp = 0;

            const frame = (timestamp) => {
                if (controller && controller.skip) {
                    resolve();
                    return;
                }
                if (!start) {
                    start = timestamp;
                    lastTimestamp = timestamp;
                }
                if (!animacaoPausada) {
                    const delta = (timestamp - lastTimestamp) * animationSpeedMultiplier;
                    elapsed += delta;
                }
                lastTimestamp = timestamp;

                if (elapsed < ms) {
                    requestAnimationFrame(frame);
                } else {
                    resolve();
                }
            };
            requestAnimationFrame(frame);
        });
    }

    async animateNodeFlight(startX, startY, endX, endY, value, controller, color = "springgreen") {
        const baseDuration = 800;
        let progress = 0;
        let lastFrameTime = null;
        
        return new Promise(resolve => {
            const step = (currentTime) => {
                if (controller.skip) { resolve(); return; }
                if (lastFrameTime === null) lastFrameTime = currentTime;

                const deltaTime = currentTime - lastFrameTime;
                lastFrameTime = currentTime;

                if (!animacaoPausada) {
                    progress += (deltaTime / baseDuration) * animationSpeedMultiplier;
                }
                if (progress >= 1) progress = 1;

                const easeOutQuad = t => t * (2 - t);
                const easedProgress = easeOutQuad(progress);
                const currentX = startX + (endX - startX) * easedProgress;
                const currentY = startY + (endY - startY) * easedProgress;
                
                // ATUALIZADO: Passa a instância da árvore para a função de desenho
                desenharArvore(this);
                const canvas = document.getElementById('tree-canvas');
                const ctx = canvas.getContext('2d');
                this.drawNode(ctx, currentX, currentY, value, color, 1);
                
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
            setSubtitle(`Posição encontrada. Inserindo nó ${value}.`);
            this.pendingNodeInfo = null;
            await this.animateNodeFlight(this.PENDING_NODE_X, this.PENDING_NODE_Y, x, y, value, controller);
            return controller.skip ? null : new Node(value);
        }
        if (value === node.value) {
            setSubtitle(`O valor ${value} já existe na árvore.`);
            this.lastOperationSuccess = false;
            desenharArvore(this);
            return node;
        }

        setSubtitle(`Comparando ${value} com ${node.value}...`);
        await this.destacarNo(node, x, y, controller);
        if (controller.skip) return node;

        const canvas = document.getElementById('tree-canvas');
        const deslocamento = canvas.width / Math.pow(2, nivel + 2);
        if (value < node.value) {
            setSubtitle(`${value} < ${node.value}. Descendo para a sub-árvore esquerda.`);
            await this.pausableDelay(800, controller);
            node.left = await this.insertAnimadoRecursivo(node.left, value, x - deslocamento, y + 80, nivel + 1, controller);
        } else if (value > node.value) {
            setSubtitle(`${value} > ${node.value}. Descendo para a sub-árvore direita.`);
            await this.pausableDelay(800, controller);
            node.right = await this.insertAnimadoRecursivo(node.right, value, x + deslocamento, y + 80, nivel + 1, controller);
        }
        
        if (controller.skip || !this.lastOperationSuccess) return node;

        return await this.balancearNo(node, x, y, nivel, controller);
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
        let subtitleText = '';
        switch (rotationType) {
            case 'LL': subtitleText = `Desbalanceamento detectado! Rotação Simples à Direita (LL) no nó ${unbalancedNode.value}.`; break;
            case 'RR': subtitleText = `Desbalanceamento detectado! Rotação Simples à Esquerda (RR) no nó ${unbalancedNode.value}.`; break;
            case 'LR': subtitleText = `Desbalanceamento detectado! Rotação Dupla Esquerda-Direita (LR) no nó ${unbalancedNode.value}.`; break;
            case 'RL': subtitleText = `Desbalanceamento detectado! Rotação Dupla Direita-Esquerda (RL) no nó ${unbalancedNode.value}.`; break;
        }
        setSubtitle(subtitleText);
        await this.pausableDelay(1200, controller);

        const initialPositions = new Map();
        this.getNodePositions(unbalancedNode, x, y, nivel, initialPositions);
        const clonedNode = this.cloneNode(unbalancedNode);
        const finalSubtreeRoot = this.performLogicalRotation(clonedNode, rotationType);
        const finalPositions = new Map();
        this.getNodePositions(finalSubtreeRoot, x, y, nivel, finalPositions);
        
        const baseDuration = 1200;
        let progress = 0;
        let lastFrameTime = null;
        
        return new Promise(resolve => {
            const step = (currentTime) => {
                if (controller.skip) { resolve(); return; }
                if (lastFrameTime === null) lastFrameTime = currentTime;
                
                const deltaTime = currentTime - lastFrameTime;
                lastFrameTime = currentTime;

                if (!animacaoPausada) {
                    progress += (deltaTime / baseDuration) * animationSpeedMultiplier;
                }
                if (progress >= 1) progress = 1;

                const ease = t => t * (2 - t);
                const easedProgress = ease(progress);
                const canvas = document.getElementById('tree-canvas');
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                const drawStaticPart = (node, currentX, currentY, currentNivel) => {
                    if (!node || initialPositions.has(node.value)) return;
                    this.drawNode(ctx, currentX, currentY, node.value, 'lightblue', node.height);
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
                    const parentNode = this.findParent(finalSubtreeRoot, value);
                    if (parentNode) {
                        const parentPosData = finalPositions.get(parentNode.value);
                        if (parentPosData) {
                            const parentX = parentPosData.currentX;
                            const parentY = parentPosData.currentY;
                            const childX = finalPosData.currentX;
                            const childY = finalPosData.currentY;
                            const angle = Math.atan2(childY - parentY, childX - parentX);
                            const raio = 25;
                            const startX = parentX + raio * Math.cos(angle);
                            const startY = parentY + raio * Math.sin(angle);
                            const endX = childX - raio * Math.cos(angle);
                            const endY = childY - raio * Math.sin(angle);
                            ctx.strokeStyle = "tomato";
                            ctx.lineWidth = 2;
                            ctx.beginPath();
                            ctx.moveTo(startX, startY);
                            ctx.lineTo(endX, endY);
                            ctx.stroke();
                            ctx.strokeStyle = "#1f2937";
                            ctx.lineWidth = 1;
                        }
                    }
                }

                for (const [value, finalPosData] of finalPositions.entries()) {
                    this.drawNode(ctx, finalPosData.currentX, finalPosData.currentY, value, 'orange', finalPosData.node.height);
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

    drawNode(ctx, x, y, value, color, height, oldHeight, oldOpacity, newOpacity) {
        const raio = 25;
        ctx.beginPath();
        ctx.arc(x, y, raio, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "black";
        ctx.fillText(value, x, y + 6);
    
        if (height !== undefined) {
            const originalAlign = ctx.textAlign;
            const originalFont = ctx.font;
            ctx.font = "16px Arial";
            ctx.fillStyle = "#150655";
            ctx.textAlign = "center"; 

            if (oldHeight !== undefined) {
                ctx.globalAlpha = oldOpacity;
                ctx.fillText(oldHeight, x, y - raio - 8);
                ctx.globalAlpha = newOpacity;
                ctx.fillText(height, x, y - raio - 8);
                ctx.globalAlpha = 1.0;
            } else {
                ctx.fillText(height, x, y - raio - 8);
            }
    
            ctx.textAlign = originalAlign;
            ctx.font = originalFont;
        }
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
    
    findNode(node, value) {
        if (!node) return null;
        if (value < node.value) return this.findNode(node.left, value);
        if (value > node.value) return this.findNode(node.right, value);
        return node;
    }

    async highlightBackpathAndUpdateHeight(node, x, y, oldHeight, controller) {
        if (controller.skip) return;
        
        setSubtitle(`Atualizando altura do nó ${node.value} de ${oldHeight} para ${node.height}.`);
        
        const baseDuration = 1500;
        let progress = 0;
        let lastFrameTime = null;

        return new Promise(resolve => {
            const step = (currentTime) => {
                if (controller.skip) { resolve(); return; }
                if (lastFrameTime === null) lastFrameTime = currentTime;
                
                const deltaTime = currentTime - lastFrameTime;
                lastFrameTime = currentTime;

                if (!animacaoPausada) {
                    progress += (deltaTime / baseDuration) * animationSpeedMultiplier;
                }
                if (progress >= 1) progress = 1;

                desenharArvore(this, {
                    [node.value]: {
                        color: `rgb(${Math.round(224 + (139 - 224) * Math.sin(progress * Math.PI))}, ${Math.round(242 + (92 - 242) * Math.sin(progress * Math.PI))}, ${Math.round(254 + (246 - 254) * Math.sin(progress * Math.PI))})`,
                        heightInfo: {
                            newHeight: node.height,
                            oldHeight: oldHeight,
                            oldOpacity: 1 - Math.min(progress / 0.5, 1),
                            newOpacity: Math.max(0, (progress - 0.5) / 0.5)
                        }
                    }
                });

                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    desenharArvore(this); 
                    resolve();
                }
            };
            requestAnimationFrame(step);
        });
    }

    async balancearNo(node, x, y, nivel, controller) {
        setSubtitle(`Retornando para o nó ${node.value}. Verificando balanço...`);
        await this.pausableDelay(800, controller);

        const oldHeight = node.height;
        const newHeight = 1 + Math.max(this.height(node.left), this.height(node.right));
        if (oldHeight !== newHeight) {
            node.height = newHeight;
            await this.highlightBackpathAndUpdateHeight(node, x, y, oldHeight, controller);
        }

        const balance = this.balanceFactor(node);
        setSubtitle(`Fator de Balanço do nó ${node.value}: ${balance}`);
        await this.pausableDelay(1000, controller);

        if (Math.abs(balance) > 1) {
            let rotationType;
            if (balance > 1) { // Left heavy
                rotationType = (this.balanceFactor(node.left) >= 0) ? 'LL' : 'LR';
            } else { // Right heavy
                rotationType = (this.balanceFactor(node.right) <= 0) ? 'RR' : 'RL';
            }
            if (rotationType) {
                await this.animateRotation(node, x, y, nivel, rotationType, controller);
            }
            return controller.skip ? node : this.performLogicalRotation(node, rotationType);
        }
        return node;
    }

    async removeValueAnimado(value, controller) {
        this.lastOperationSuccess = true;
        if (!this.findNode(this.root, value)) {
            setSubtitle(`Valor ${value} não encontrado para remoção.`);
            this.lastOperationSuccess = false;
            return;
        }

        setSubtitle(`Removendo o valor ${value}...`);
        this.pendingNodeInfo = { value, x: this.PENDING_NODE_X, y: this.PENDING_NODE_Y, text: "Removendo..." };
        desenharArvore(this);

        await this.pausableDelay(1000, controller);
        if (controller.skip) {
            this.pendingNodeInfo = null;
            return;
        }

        const canvas = document.getElementById('tree-canvas');
        this.root = await this.removeAnimadoRecursivo(this.root, value, canvas.width / 2, 60, 0, controller);
        this.pendingNodeInfo = null;
        desenharArvore(this);
    }

    async removeAnimadoRecursivo(node, value, x, y, nivel, controller) {
        if (!node || controller.skip) return node;

        setSubtitle(`Procurando ${value}... Comparando com ${node.value}.`);
        await this.destacarNo(node, x, y, controller);
        if (controller.skip) return node;

        const deslocamento = document.getElementById('tree-canvas').width / Math.pow(2, nivel + 2);

        if (value < node.value) {
            setSubtitle(`${value} < ${node.value}. Descendo para a esquerda.`);
            await this.pausableDelay(800, controller);
            node.left = await this.removeAnimadoRecursivo(node.left, value, x - deslocamento, y + 80, nivel + 1, controller);
        } else if (value > node.value) {
            setSubtitle(`${value} > ${node.value}. Descendo para a direita.`);
            await this.pausableDelay(800, controller);
            node.right = await this.removeAnimadoRecursivo(node.right, value, x + deslocamento, y + 80, nivel + 1, controller);
        } else {
            setSubtitle(`Nó ${value} encontrado. Removendo...`);
            this.pendingNodeInfo = null;
            await this.pausableDelay(800, controller);

            if (!node.left) {
                setSubtitle(`Nó ${value} tem apenas filho à direita (ou nenhum). Substituindo.`);
                await this.pausableDelay(1000, controller);
                return node.right;
            }
            else if (!node.right) {
                setSubtitle(`Nó ${value} tem apenas filho à esquerda. Substituindo.`);
                await this.pausableDelay(1000, controller);
                return node.left;
            }
            else {
                setSubtitle(`Nó ${value} tem dois filhos. Encontrando sucessor em ordem...`);
                await this.pausableDelay(1000, controller);
                
                const successor = this.minValueNode(node.right);
                setSubtitle(`Sucessor encontrado: ${successor.value}. Substituindo valor.`);
                await this.pausableDelay(1000, controller);
                
                node.value = successor.value;
                
                setSubtitle(`Removendo o nó duplicado do sucessor (${successor.value}) da sub-árvore direita.`);
                await this.pausableDelay(1200, controller);
                node.right = await this.removeAnimadoRecursivo(node.right, successor.value, x + deslocamento, y + 80, nivel + 1, controller);
            }
        }

        if (controller.skip || !node) return node;

        return await this.balancearNo(node, x, y, nivel, controller);
    }

    rebuildTreeFromState(structuredNode) {
        if (!structuredNode) {
            return null;
        }
        const newNode = new Node(structuredNode.value);
        newNode.left = this.rebuildTreeFromState(structuredNode.left);
        newNode.right = this.rebuildTreeFromState(structuredNode.right);
        newNode.height = structuredNode.height;
        return newNode;
    }

    getStructuredNodePositions(structuredNode, startX, startY, nivel, positionsMap) {
        if (!structuredNode) return;
        positionsMap.set(structuredNode.value, { x: startX, y: startY, node: structuredNode });
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
        
        const baseDuration = 800;
        let progress = 0;
        let lastFrameTime = null;

        return new Promise(resolve => {
            const step = (currentTime) => {
                if (controller.skip) { resolve(); return; }
                if (lastFrameTime === null) lastFrameTime = currentTime;

                const deltaTime = currentTime - lastFrameTime;
                lastFrameTime = currentTime;

                if (!animacaoPausada) {
                    progress += (deltaTime / baseDuration) * animationSpeedMultiplier;
                }
                if (progress >= 1) progress = 1;

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
                            const angle = Math.atan2(childY - parentY, childX - parentX);
                            const raio = 25;
                            const startX = parentX + raio * Math.cos(angle);
                            const startY = parentY + raio * Math.sin(angle);
                            const endX = childX - raio * Math.cos(angle);
                            const endY = childY - raio * Math.sin(angle);
                            
                            ctx.beginPath();
                            ctx.moveTo(startX, startY);
                            ctx.lineTo(endX, endY);
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
                    const nodeData = finalPos ? finalPos.node : initialPos.node;
                    this.drawNode(ctx, currentX, currentY, value, color, nodeData.height);
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
