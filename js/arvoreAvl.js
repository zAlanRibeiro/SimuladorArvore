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

    async buscaBinaria(node, value, x, y, nivel, controller) {
        if (!node || (controller && controller.skip)) {
            if (!node) setSubtitle(`Valor ${value} não encontrado.`);
            return;
        };
        
        setSubtitle(`Procurando... Comparando ${value} com ${node.value}.`);
        await destacarNo(node, x, y, controller);

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
        this.lastOperationSuccess = true; // Reseta o status
        const canvas = document.getElementById('tree-canvas');
        const ctx = canvas.getContext('2d');
        setSubtitle(`Inserindo o valor ${value}...`);
        desenharNoPendente(ctx, value, this.PENDING_NODE_X, this.PENDING_NODE_Y, "Inserindo...");
        await this.pausableDelay(1000, controller);
        if (controller.skip) return;
        const path = [];
        this.root = await this.insertAnimadoRecursivo(this.root, value, canvas.width / 2, 60, 0, controller, path);
    }
    
    async pausableDelay(ms, controller) {
        let logicalTimeRemaining = ms;
        const stepInterval = 50;

        while (logicalTimeRemaining > 0) {
            if (controller.skip) return;
            if (!animacaoPausada) {
                logicalTimeRemaining -= stepInterval * animationSpeedMultiplier;
            }
            await new Promise(r => setTimeout(r, stepInterval));
        }
    }

    async animateNodeFlight(startX, startY, endX, endY, value, controller) {
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
                
                desenharArvore(this.root);
                const canvas = document.getElementById('tree-canvas');
                const ctx = canvas.getContext('2d');
                this.drawNode(ctx, currentX, currentY, value, "springgreen", 1);
                
                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    resolve();
                }
            };
            requestAnimationFrame(step);
        });
    }

    async insertAnimadoRecursivo(node, value, x, y, nivel, controller, path) {
        path.push({node, x, y});
        if (controller.skip) return node;
        if (!node) {
            setSubtitle(`Posição encontrada. Inserindo nó ${value}.`);
            await this.animateNodeFlight(this.PENDING_NODE_X, this.PENDING_NODE_Y, x, y, value, controller);
            return controller.skip ? null : new Node(value);
        }
        if (value === node.value) {
            setSubtitle(`O valor ${value} já existe na árvore.`);
            this.lastOperationSuccess = false; // Define o status como falha
            desenharArvore(this.root);
            path.pop();
            return node;
        }

        setSubtitle(`Comparando ${value} com ${node.value}...`);
        await destacarNo(node, x, y, controller);
        if (controller.skip) return node;

        const canvas = document.getElementById('tree-canvas');
        const deslocamento = canvas.width / Math.pow(2, nivel + 2);
        if (value < node.value) {
            setSubtitle(`${value} < ${node.value}. Descendo para a sub-árvore esquerda.`);
            await this.pausableDelay(800, controller);
            node.left = await this.insertAnimadoRecursivo(node.left, value, x - deslocamento, y + 80, nivel + 1, controller, path);
        } else if (value > node.value) {
            setSubtitle(`${value} > ${node.value}. Descendo para a sub-árvore direita.`);
            await this.pausableDelay(800, controller);
            node.right = await this.insertAnimadoRecursivo(node.right, value, x + deslocamento, y + 80, nivel + 1, controller, path);
        }
        
        path.pop();
        if (controller.skip) return node;

        if (!this.lastOperationSuccess) {
            return node;
        }

        setSubtitle(`Retornando para o nó ${node.value}. Verificando balanço...`);
        await this.pausableDelay(800, controller);

        const newHeight = 1 + Math.max(this.height(node.left), this.height(node.right));
        if (node.height !== newHeight) {
            const oldHeight = node.height; 
            node.height = newHeight;       
            await this.highlightBackpathAndUpdateHeight(node, x, y, oldHeight, controller);
        }

        const balance = this.balanceFactor(node);
        setSubtitle(`Fator de Balanço do nó ${node.value}: ${balance}`);
        await this.pausableDelay(1000, controller);

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
            ctx.textAlign = "center"; // MUDANÇA: Centralizado

            if (oldHeight !== undefined) {
                ctx.globalAlpha = oldOpacity;
                ctx.fillText(oldHeight, x, y - raio - 8); // MUDANÇA: Posição Y ajustada
                ctx.globalAlpha = newOpacity;
                ctx.fillText(height, x, y - raio - 8); // MUDANÇA: Posição Y ajustada
                ctx.globalAlpha = 1.0;
            } else {
                ctx.fillText(height, x, y - raio - 8); // MUDANÇA: Posição Y ajustada
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

    async animateStateTransition(initialTree, finalTree, controller, rotationPivotValue = null) {
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
                            
                            if (rotationPivotValue) {
                                ctx.strokeStyle = "tomato";
                                ctx.lineWidth = 2;
                            }
                            ctx.beginPath();
                            ctx.moveTo(startX, startY);
                            ctx.lineTo(endX, endY);
                            ctx.stroke();
                            ctx.strokeStyle = "#1f2937";
                            ctx.lineWidth = 1;
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
                        color = (value === rotationPivotValue) ? 'orange' : 'lightblue';
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
    
    findNode(node, value) {
        if (!node) return null;
        if (value < node.value) return this.findNode(node.left, value);
        if (value > node.value) return this.findNode(node.right, value);
        return node;
    }

    findRotationPivot(initialRoot, finalRoot) {
        if (!initialRoot || !finalRoot) return null;
        const initialParents = new Map();
        const finalParents = new Map();
        function mapParents(node, parent, map) {
            if (!node) return;
            map.set(node.value, parent ? parent.value : null);
            mapParents(node.left, node, map);
            mapParents(node.right, node, map);
        }
        mapParents(initialRoot, null, initialParents);
        mapParents(finalRoot, null, finalParents);
        for (const [value, initialParentValue] of initialParents.entries()) {
            if (!initialParentValue) continue;
            const finalParentValue = finalParents.get(value);
            if (finalParentValue !== initialParentValue) {
                const finalParentOfInitialParent = finalParents.get(initialParentValue);
                if (finalParentOfInitialParent === value) {
                    return initialParentValue;
                }
            }
        }
        return null;
    }

    async removeValueAnimado(value, controller) {
        this.lastOperationSuccess = true; // Reseta o status
        if (!this.findNode(this.root, value)) {
            setSubtitle(`Valor ${value} não encontrado para remoção.`);
            this.lastOperationSuccess = false;
            return;
        }

        const canvas = document.getElementById('tree-canvas');
        const ctx = canvas.getContext('2d');
        desenharNoPendente(ctx, value, this.PENDING_NODE_X, this.PENDING_NODE_Y, "Removendo...");
        await this.pausableDelay(1000, controller);
        if (controller.skip) return;
        
        const path = [];
        await this.findPathToNode(this.root, value, canvas.width / 2, 60, 0, controller, path);
        if (controller.skip) return;
        
        const initialTreeState = estruturar(this.root);
        
        const tempTree = new AVLTree();
        tempTree.root = this.cloneNode(this.root);
        tempTree.root = tempTree.removeNode(tempTree.root, value);
        const finalTreeState = estruturar(tempTree.root);

        const pivotValue = this.findRotationPivot(initialTreeState, finalTreeState);
        if (pivotValue) {
             setSubtitle(`Rebalanceamento necessário no nó ${pivotValue}!`);
             await this.pausableDelay(1000, controller);
             if (controller.skip) return;
        }

        await this.animateStateTransition(initialTreeState, finalTreeState, controller, pivotValue);
        
        if (!controller.skip) {
            this.root = this.rebuildTreeFromState(finalTreeState);
        }
    }

    async findPathToNode(node, value, x, y, nivel, controller, path) {
        if (!node || (controller && controller.skip)) return null;
        
        path.push({node, x, y});
        await destacarNo(node, x, y, controller);
        if (controller.skip) return null;

        if (value === node.value) {
            return { x, y, node };
        }

        const deslocamento = document.getElementById('tree-canvas').width / Math.pow(2, nivel + 2);
        let result;
        if (value < node.value) {
            result = await this.findPathToNode(node.left, value, x - deslocamento, y + 80, nivel + 1, controller, path);
        } else {
            result = await this.findPathToNode(node.right, value, x + deslocamento, y + 80, nivel + 1, controller, path);
        }
        
        if (!result) { 
            path.pop();
        }
        return result;
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

                desenharArvore(this.root, {
                    [node.value]: {
                        color: `rgb(${Math.round(224 + (139 - 224) * Math.sin(progress * Math.PI))}, ${Math.round(242 + (92 - 242) * Math.sin(progress * Math.PI))}, ${Math.round(254 + (246 - 254) * Math.sin(progress * Math.PI))})`,
                        heightInfo: {
                            newHeight: node.height, // <-- Pega a altura nova do modelo
                            oldHeight: oldHeight,   // <-- Pega a altura antiga do parâmetro
                            oldOpacity: 1 - Math.min(progress / 0.5, 1),
                            newOpacity: Math.max(0, (progress - 0.5) / 0.5)
                        }
                    }
                });

                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    desenharArvore(this.root); 
                    resolve();
                }
            };
            requestAnimationFrame(step);
        });
    }
}

let avlTree = new AVLTree();
