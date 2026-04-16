function addGraphNode(params = {}, saveInHistory = false, cache = false, onNodeReady = null) {
	console.log(`Adding Graph Node ${params.name} (${params.commandCode})`);
	const node = document.createElement('div');
	
	if (params.classList)
		for (const classSplit of params.classList.split(' ').filter(item => item !== ''))
			node.classList.add(classSplit);
		
	const nodeId = params.nodeId !== undefined && params.nodeId !== null ? params.nodeId : window.nodes.length;
	node.setAttribute('data-nodeId', nodeId);
	
	node.setAttribute('id', 'graphNode');
	node.setAttribute('data-commandCode', params.commandCode || 0);
	
	const isCustom = params.isCustom;
	const customNodeData = isCustom ? getCustomNodeData(params.commandCode) : null;
	if (isCustom)
		node.setAttribute('data-isCustom', 'true');
	
	if (params.attributes)
		for (const attribute of params.attributes)
			node.setAttribute(attribute[0], attribute[1]);
	
	node.innerHTML = isCustom && customNodeData.header ? 
	`<div id="node-header" style="${isCustom ? `background-color: ${customNodeData.color || ''};` : ''}">${customNodeData.header}</div>`
	: `<p id="node-header" class="${params.headerClassList ? params.headerClassList : ""}" style="${isCustom ? `background-color: ${customNodeData.color || ''};` : ''}">${params.name || ""}</p>`;
	
	let nodeContent = ``;
	nodeContent += `
		<div class="mBottom05 relative ${params.inputOutputContainerClassList ? params.inputOutputContainerClassList : ""}">
			<div id="input-container">`;
	
	const customInputExecParams = isCustom ? getCustomNodeInputExecParams(params.commandCode) : null;
	if (params.haveInputExecNode) {
		const inputListLength = customInputExecParams && customInputExecParams.min_list ? customInputExecParams.min_list : 1;
		for (let l = 0; l < inputListLength; l++)
			nodeContent += `
				<span id="node-input" class="node-input-exec">
					<span data-connected="false" data-nodeId=${nodeId} data-connectionId="${l}" ${isCustom && customInputExecParams.is_list ? `data-isList="true"` : ''} ${isCustom && customInputExecParams.exclusive ? `data-exclusive="${customInputExecParams.exclusive}"` : 'data-exclusive="exec"'} ${isCustom && customInputExecParams.curve_color ? `data-curveColor="${customInputExecParams.curve_color}"` : ''} class="exec inputConnection ${isCustom && customInputExecParams.symbol ? `noDefaultSymbol ${customNodeData.id}_input` : ''} ${isCustom && customInputExecParams.mono ? `mono` : ''}"></span> 
					${isCustom && customInputExecParams.is_list ? $.Drag.VisualEvent.getListInputButtons(customInputExecParams.min_list) : ''}
				</span>`;
	}
	
	params.inputs = params.inputs || [];
	node.setAttribute('data-_inputsReady', 'false');
	setTimeout(() => {
		const inputContainer = node.querySelector('#input-container');
		let inputContainerHTML = '';
		
		for (const [i, input] of params.inputs.entries()) {
			inputContainerHTML += `
					<span id="node-input" class="nodeInput ${input.type === "empty" ? 'hidden' : ''}">
						<b>${input.text || input.name || ""}</b>
						<span data-connected="false" data-nodeId="${nodeId}" data-connectionId="${params.haveInputExecNode && params.haveTargetNode ? i + 2 : params.haveInputExecNode || params.haveTargetNode ? i + 1 : i}" class="inputConnection"></span>
						${input.desc ? '<span class="node-input-desc">' + input.desc + '</span>' : '<br>'}
						<div id="input-wrapper">
			`;
			
			const values = input.isList ? Array.isArray(input.value) ? input.value : [input.value] : [input.value]; 
			for (const [j, value] of values.entries()) {
				input.value = value;
				inputContainerHTML += `
							<div class="firstChildWidth100">
								${$.Drag.VisualEvent.getInputField(input)}
							</div>
				`;
			}
			inputContainerHTML += `	
						</div>
					</span>
			`;
		}
		inputContainer.innerHTML += inputContainerHTML;
		onNodeInputsReady(node, onNodeReady);
	}, 1);
	
	params.miscInputs = params.miscInputs || [];
	if (params.miscInputs.length > 0) {
		nodeContent += `
					<span class="node-misc-input">
		`;
		for (const [i, miscInputs] of params.miscInputs.entries())
			nodeContent += `
						<div style="width: 100%;">
							${miscInputs.name ? `<b>${miscInputs.name || ""}</b><br>` : ``}
							${miscInputs.type !== undefined ? $.Drag.VisualEvent.getInputField(miscInputs) : ''}
						</div>
			`;
		nodeContent += `
					</span>
		`;
	}
	
	nodeContent += `
			</div>
			<div id="output-container">`;
	
	params.outputsExec = params.outputsExec || [];
	let outputConnectionId = 0;
	for (const [i, outputExec] of params.outputsExec.entries())
		nodeContent += `
				<span class="nodeOutput ${outputExec.containerClass ? outputExec.containerClass : ''}" id="secondary-exec-output">
					<span>${outputExec.name || ""}</span></b>
					${outputExec.type !== undefined ? $.Drag.VisualEvent.getInputField(outputExec) : ''}
					<span ${outputExec.connectionData ? outputExec.connectionData : ''} data-connected="false" data-nodeId="${nodeId}" data-connectionId="${outputConnectionId++}" data-indent="${params.indent + 1 || 1}" data-exclusive="exec" class="exec outputConnection"></span>
				</span>`;
	
	const customOutputExecParams = isCustom ? getCustomNodeOutputExecParams(params.commandCode) : {};
	if (params.haveOutputExecNode) {
		const inputListLength = customInputExecParams && customInputExecParams.min_list ? customInputExecParams.min_list : 1;
		for (let l = 0; l < inputListLength; l++)
			nodeContent += `
				<span class="nodeOutput" id="main-exec-output"> 
					${params.outputLabel || ''}
					${isCustom && customOutputExecParams.is_list ? $.Drag.VisualEvent.getListInputButtons(customOutputExecParams.min_list) : ''}
					<span data-connected="false" data-nodeId="${nodeId}" data-connectionId="${outputConnectionId++}" data-indent="${params.indent || 0}" ${isCustom && customOutputExecParams.is_list ? `data-isList="true"` : ''} ${isCustom && customOutputExecParams.exclusive ? `data-exclusive="${customOutputExecParams.exclusive}"` : 'data-exclusive="exec"'} ${isCustom && customOutputExecParams.curve_color ? `data-curveColor="${customOutputExecParams.curve_color}"` : ''} class="exec outputConnection ${isCustom && customOutputExecParams.symbol ? `noDefaultSymbol ${customNodeData.id}_output` : ''}"></span>
				</span>`;
		
	}
	
	// params.outputs = params.outputs || [];
	// for (const [i, output] of params.outputs.entries()) //not used for now
		// nodeContent += `
				// <span class="nodeOutput ${output.type || ''}" id="secondary-output">
					// ${output.str || ''}
					// <span data-connected="false" data-nodeId=${nodeId} data-connectionId="${outputConnectionId++}" class="outputConnection ${output.type || ''}"></span>
				// </span>`;
	
	nodeContent += `
			</div>
			${params.footer ? params.footer : ''}
		</div>
		${isCustom && customNodeData.body && typeof customNodeData.body === "string" ? customNodeData.body : ''}
		${(params.content || "")}`;
		
	// setTimeout(() => { 
		node.innerHTML += nodeContent; 
		
		setNodePosition(node, params.x || 0, params.y || 0, false, cache);
		setNodeOffset(node, 0, 0);
		
		if (!window._preventAddNode)
			addNodeToGraphNode(node, saveInHistory, cache, null, null);
	// }, 1);
	
	return node;
};

function onNodeInputsReady(node, onNodeReady) {
	if (onNodeReady)
		onNodeReady();
	
	node.removeAttribute('data-_inputsReady');
	triggerAllOnReadyOnChange(node);
	autofitAllTextArea(node);
	registerNodeReferences(node);
	
	triggerModsFunction("onNodeReady", [node]);
	for (const mod of Object.values(window._mods))
		if (typeof mod.onNodeReady === "function")
			mod.onNodeReady(window, node);
	
	if (!document.querySelector('#graphNode[data-_inputsReady="false"]'))
		onAllNodeReady();					
};

function onAllNodeReady() {
	console.log(`All nodes (${window.nodes.length}) ready.`);
	window._registerInputChange = true;
	
	if (window.onNodesReady) {
		window.onNodesReady();
		window.onNodesReady = null;
	}
	
	if (window.onNodesReadyEx) {
		window.onNodesReadyEx();
		window.onNodesReadyEx = null;
	}
	
	window._allNodesReady = true;
};

function addNodeToGraphNode(node, saveInHistory = false, cache = false, nodeId = null, frag = null) {
	const graphNode = document.querySelector("#graphNodes");
	if (!graphNode || !node)
		return;
	
	//id
	if (!window.nodes.includes(node)) {
		if (node.hasAttribute('data-nodeId')) {
			window.nodes[getNodeId(node)] = node;
		} else {
			if (nodeId === null)
				nodeId = window.nodes.push(node) - 1;
			else 
				window.nodes[nodeId] = node;
			
			node.setAttribute('data-nodeId', nodeId);
			for (const element of node.querySelectorAll('*[data-nodeId="0"]'))
				element.setAttribute('data-nodeId', nodeId);
		}
	}
	
	//listeners
	nodeResizeObserver.observe(node);
	node.onmousedown = onMouseDownGraphEditorNode.bind(null, node);
	node.onmouseup = onMouseUpGraphEditorNode.bind(null, node);
	node.addEventListener("dblclick", () => focusNode(null, node));
	
	const nodeHeader = node.querySelector('#node-header');
	nodeHeader.onmouseover = onNodeHeaderMouseOver.bind(null, node); 
	nodeHeader.onmousemove = onNodeHeaderMouseMove.bind(null, node);
	nodeHeader.onmouseout = onNodeHeaderMouseOut.bind(null, node);
	
	//add && init
	if (frag)
		frag.appendChild(node);
	else
		graphNode.appendChild(node);
	
	triggerAllOnReadyOnChange();
	autofitAllTextArea();
	onNodeResize(node);
	
	if (node.getAttribute('data-isCustom') === 'true') {
		const customNodeData = getCustomNodeData(getNodeCommandCode(node));
		if (customNodeData.onadd && typeof customNodeData.onadd === "function")
			customNodeData.onadd(this, node);
	}
	
	//cache
	if (cache) {
		cacheGraphNode(node);
		registerNodeReferences(node);
	}

	//undo redo history
	if (saveInHistory)
		addToUndoHistory({type: "addNode", target: [node]});
	
	node.setAttribute('data-_ready', 'true');
	triggerModsFunction("onAddNode", [node]);
};

function onUndoAddNode(action) {
	const nodes = action.target;
	for (const node of nodes) {
		const nodeId = getNodeId(node);
		deleteNode(getNodeById(nodeId));
	}
};

function onRedoAddNode(action) {
	const nodes = action.target;
	for (const [i, node] of nodes.entries()) {
		addNodeToGraphNode(node, false, false);
		if (action.connectionsMap && action.connectionsMap[i]) {
			reconnectNodeFromConnectionsMap(node, action.connectionsMap[i]);
			cacheGraphNode(node, null, action.connectionsMap[i]);
		} else 
			cacheGraphNode(node);
	}
};

addHistoryHandler("addNode", "Add Node", onUndoAddNode, onRedoAddNode);

function addNodeOutput(node, outputExec, position) {
	const nodeId = node.getAttribute('data-nodeId');
	const outputContainer = node.querySelector('#output-container');
	const outputConnectionId = outputContainer.childElementCount;
	const outputIndent = parseInt(outputContainer.querySelector('#main-exec-output > span').getAttribute('data-indent')) + 1;
	
	if (position < 0)
		position = outputContainer.childElementCount - 1 + position;
	
	let childAtPos = outputContainer.children[position];
	if (!childAtPos)
		childAtPos = outputContainer.children[0];
	
	childAtPos.insertAdjacentHTML("beforebegin", `
		<span class="nodeOutput" id="secondary-exec-output">
			<span>${outputExec.name || ""}</span></b>
			${outputExec.type !== undefined ? $.Drag.VisualEvent.getInputField(outputExec) : ''}
			<span data-connected="false" data-nodeId="${nodeId}" data-connectionId="${outputConnectionId}" data-indent="${outputIndent}" class="exec outputConnection"></span>
		</span>`
	);
};

function removeNodeOutput(node, position) {
	const nodeOutputs = node.querySelectorAll('#secondary-exec-output');
	const output = nodeOutputs[position];
	if (output)
		output.remove();
};

function showNodeOutput(node, outputId) {
	const output = node.querySelector(`.nodeOutput:nth-child(${outputId})`)
	if (!output)
		return;
	
	output.classList.remove('hidden');
	refreshNode(node);
};

function hideNodeOutput(node, outputId) {
	const output = node.querySelector(`.nodeOutput:nth-child(${outputId})`)
	if (!output)
		return;
	
	output.classList.add('hidden');
	const connection = output.querySelector('.outputConnection');
	if (isConnectionConnected(connection))
		removeConnectionCurves(connection);
		
	refreshNode(node);
};


//delete
function deleteNode(node, saveInHistory = false) {
	if (node.classList.contains('undeletable'))
		return;
	
	const curves = getNodeCurves(node);
	if (saveInHistory)
		addToUndoHistory({type: "deleteNode", target: [node], cache: [getGraphNodeFromCache(node)], connectionsMap: [getNodeConnectionsMap(node)]});
	
	for (const inputCurve of curves.inputs)
		removeCurve(inputCurve);
	for (const outputCurve of curves.outputs) 
		removeCurve(outputCurve);
	
	setAsUnsaved(window.data.targetType, window.data.targetId, window.data.mapTargetId, window.data.pageId || 0);
	uncacheGraphNode(node);
	removeNodeReferences(node);
	nodeResizeObserver.unobserve(node);
	node.remove();
};

function deleteSelectedNodes(saveInHistory = false) {
	const selectedNodes = getSelectedNodes();
	
	if (saveInHistory && selectedNodes.length > 0)
		addToUndoHistory({type: "deleteNode", target: selectedNodes, cache: selectedNodes.map(node => getGraphNodeFromCache(node)), connectionsMap: selectedNodes.map(node => getNodeConnectionsMap(node))});
	
	for (const node of selectedNodes) 
		deleteNode(node, false);
	
	closeNodeContextMenu();
};


function onUndoDeleteNode(action) {
	const nodes = action.target;
	for (const [i, node] of nodes.entries()) {
		addNodeToGraphNode(node, false, false);
		if (action.connectionsMap && action.connectionsMap[i]) {
			reconnectNodeFromConnectionsMap(node, action.connectionsMap[i]);
			setNodeCache(getNodeId(node), action.cache[i]);
			// cacheGraphNode(node, null, action.connectionsMap[i]);
		} else
			cacheGraphNode(node);
	}
};

function onRedoDeleteNode(action) {
	const nodes = action.target;
	for (const node of nodes) {
		const nodeId = getNodeId(node);
		deleteNode(getNodeById(nodeId));
	}
};

addHistoryHandler("deleteNode", "Delete Node", onUndoDeleteNode, onRedoDeleteNode);

//move
function moveNode(event) {	
	if (!window.nodeMouseDown)
		return;
	
	const scale = getGraphEditorScale();
	const scaleMult = 100 / (scale * 100);
	
	const mousex = parseInt(window.nodeMouseDown.getAttribute('data-mousex')) || 0;
	const mousey = parseInt(window.nodeMouseDown.getAttribute('data-mousey')) || 0;
	
	const xMouseMovement = (event.x - mousex) * scaleMult;
	const yMouseyMovement = (event.y - mousey) * scaleMult;	
	
	const nodeSnap = getNodeSnap();
	const xSnappedMovement = Math.round(xMouseMovement / nodeSnap.x) * nodeSnap.x;
	const ySnappedMovement = Math.round(yMouseyMovement / nodeSnap.y) * nodeSnap.y;
	
	const selectedNodes = getSelectedNodes();
	for (const node of selectedNodes)
		setNodeOffset(node, xSnappedMovement, ySnappedMovement, true);
};

function getNodeSnap() {
	return {x: parseInt(window._cache.editor.options.uiScale / 14 * 20), y: parseInt(window._cache.editor.options.uiScale / 14 * 20)};
};

function getNodeOffset(node) {
	if (!node)
		return [0, 0];
	
	const x = parseInt(node.getAttribute('data-xOffset')) || 0;
	const y = parseInt(node.getAttribute('data-yOffset')) || 0;
	return [x, y];
};

function setNodeOffset(node, x, y, curveOffset = false) {
	if (!node)
		return;
	
	const [xOffset, yOffset] = getNodeOffset(node);
	if (xOffset !== x || yOffset !== y) {
		node.setAttribute('data-xOffset', x);
		node.setAttribute('data-yOffset', y);
	
		const [xNode, yNode] = getNodePosition(node);
		node.style.left = `${xNode + x}px`;
		node.style.top = `${yNode + y}px`;
		
		if (!curveOffset)
			return;
		
		const nodeSnap = getNodeSnap();
		const xDir = (xOffset - x) / nodeSnap.x * -1;
		const yDir = (yOffset - y) / nodeSnap.y * -1;
		
		const curves = getNodeCurves(node);
		for (const curve of curves.inputs)
			offsetCurve(curve, [0, 0], [nodeSnap.x * xDir, nodeSnap.y * yDir]);
		for (const curve of curves.outputs)
			offsetCurve(curve, [nodeSnap.x * xDir, nodeSnap.y * yDir], [0, 0]);
	}
};

function getNodePosition(node) {
	if (!node || node.id !== "graphNode")
		return [0, 0];
	
	const x = parseInt(node.getAttribute('data-x'));
	const y = parseInt(node.getAttribute('data-y'));
	return [x, y];
};

function setNodePosition(node, x = 0, y = 0, saveInHistory = false, cache = true) {
	if (!node)
		return;			
	
	const nodeSnap = getNodeSnap();
	x = parseInt(x / nodeSnap.x) * nodeSnap.x;
	y = parseInt(y / nodeSnap.y) * nodeSnap.y;
	
	const nodePosition = getNodePosition(node);
	if (saveInHistory && (nodePosition[0] !== x || nodePosition[1] !== y))
		addToUndoHistory({type: "moveNode", target: [getNodeId(node)], movement: [nodePosition[0] - x, nodePosition[1] - y]}); //from: nodePosition, to: [x, y]
	
	node.setAttribute('data-x', x);
	node.setAttribute('data-y', y);
	node.style.left = `${x}px`;
	node.style.top = `${y}px`;
	
	if (cache)
		updateCacheGraphNodePosition(node);
};

function moveSelectedNodes() {
	let movement = false;
	
	const nodes = getSelectedNodes();
	for (const node of nodes) {
		const [xNode, yNode] = getNodePosition(node);
		const [xOffset, yOffset] = getNodeOffset(node);
		if (xOffset !== 0 || yOffset !== 0) {
			movement = [xOffset, yOffset];
			setNodePosition(node, xNode + xOffset, yNode + yOffset);
			setNodeOffset(node, 0, 0);
			setAsUnsaved(window.data.targetType, window.data.targetId, window.data.mapTargetId, window.data.pageId || 0);
		}
	}
	
	if (movement)
		addToUndoHistory({type: "moveNode", target: nodes.map(node => getNodeId(node)), movement: movement});
};

function onUndoMoveNode(action) {
	const nodeIds = action.target;
	for (const nodeId of nodeIds) {
		const node = getNodeById(nodeId);
		const nodePosition = getNodePosition(node);
		setNodePosition(node, nodePosition[0] - action.movement[0], nodePosition[1] - action.movement[1]); //action.from[0], action.from[1]
		redrawNodeCurves(node);
	}
};

function onRedoMoveNode(action) {
	const nodeIds = action.target;
	for (const nodeId of nodeIds) {
		const node = getNodeById(nodeId);
		const nodePosition = getNodePosition(node);
		setNodePosition(node, nodePosition[0] + action.movement[0], nodePosition[1] + action.movement[1]); //action.to[0], action.to[1]
		redrawNodeCurves(node);
	}
};

addHistoryHandler("moveNode", "Move Node", onUndoMoveNode, onRedoMoveNode);

function resetAllNodesPositions() {
	const noInputNodes = getAllNodesWithoutInputConnection();
	for (const [i, node] of noInputNodes.entries()) {
		const executionSequence = getMainExecutionSequence(node)[0];
		resetNodesPosition(executionSequence);
	} 
};

function resetNodesPosition(nodes, _isSubBranch = false) {
	for (const node of nodes) {
		if (node.getAttribute('data-_positionReset') === "true")
			continue;
		
		const inputNodes = getInputConnectedNodes(node);
		if (inputNodes.length === 0) {
			const nodeSnap = getNodeSnap();
			setNodePosition(node, nodeSnap.x * 2, nodeSnap.y * 2, false, false);
			node.setAttribute('data-_positionReset', 'true');
			continue;
		}
		
		for (const inputNode of inputNodes) {
			placeNodeNextTo(node, inputNode, "xy");
			inputNode.setAttribute('data-_positionReset', 'true');
		}
		
		const outputs = getOutputConnectedNodes(node);
		for (let j = 0; j < outputs.secondaryOutputNodes.length; j++) {
			const outputNode = outputs.secondaryOutputNodes[j];
			if (!outputNode)
				continue;
			
			placeNodeNextTo(outputNode, node, "xy");
			outputNode.setAttribute('data-_positionReset', 'true');
			
			resetNodesPosition(getMainExecutionSequence(outputNode)[0], true);
		}
	}
	
	if (!_isSubBranch)
		for (const node of document.querySelectorAll('#graphNode[data-_positionReset="true"]'))
			node.removeAttribute('data-_positionReset');
};

function rearrangeAllNodes(resetAllPositions = true) {
	setTimeout(() => {
		const now = performance.now();
		const graphEditorScale = getGraphEditorScale();
		setGraphEditorScale(1, false, false, false, false);
		
		const noInputNodes = getAllNodesWithoutInputConnection();
		const nodeSnap = getNodeSnap();
		let yOffset = nodeSnap.y * 2;
		for (const [i, node] of noInputNodes.entries()) {
			const executionSequence = getMainExecutionSequence(node)[0];
			if (resetAllPositions)
				resetNodesPosition(executionSequence); //400ms
			
			const heightMap = getNodesHeightMap(executionSequence); //200ms
			rearrangeNodes(executionSequence, heightMap, yOffset); //450ms
			yOffset += heightMap.reduce((sum, a) => sum + a + nodeSnap.y * 2, 0) + nodeSnap.y * 2;
		} 
		
		for (const node of document.querySelectorAll("*[data-_rearranged]"))
			node.removeAttribute('data-_rearranged');
			
		setGraphEditorScale(graphEditorScale, false, true, false, false);
		redrawAllCurves(); //1300ms
		console.log(`rearrange all node took ${performance.now() - now}ms`);
	}, 1);
};

function getNodesHeightMap(nodes) {
	const heightMap = makeNodesHeightMap(nodes)[1];
	
	for (const node of document.querySelectorAll('*[data-heightMapped]'))
		node.removeAttribute('data-heightMapped');
	
	return heightMap;
};

function makeNodesHeightMap(nodes, _index = 0, _heightMap = [0]) {
	const height = getNodesHighestHeight(nodes);
	if (!_heightMap[_index] || height > _heightMap[_index])
		_heightMap[_index] = height;	
	
	for (const node of nodes) {
		if (node.getAttribute('data-heightMapped') === 'true')
			continue;
		node.setAttribute('data-heightMapped', 'true');
		
		const outputs = getOutputConnectedNodes(node);
		if (outputs.secondaryOutputNodes.length) {
			for (const [i, outputNode] of outputs.secondaryOutputNodes.entries()) {
				if (i > 0)
					_index++;
				_index = makeNodesHeightMap(getMainExecutionSequence(outputNode)[0], _index, _heightMap)[0];
			}
			
			if (outputs.mainOutputNode) {
				_index++;
				_index = makeNodesHeightMap(getMainExecutionSequence(outputs.mainOutputNode)[0], _index, _heightMap)[0];
			}
		}
	}
	
	return [_index, _heightMap];
};

function getNodesHighestHeight(nodes) {
	let lowestY = -Infinity;
	for (const node of nodes)
		lowestY = Math.max(lowestY, node.getBoundingClientRect().height);
	
	return lowestY !== -Infinity ? lowestY : 0;
};

function rearrangeNodes(nodes = getMainExecutionSequence()[0], heightmap = getNodesHeightMap(nodes), yOffset = 0, _index = 0) {
	const nodeSnap = getNodeSnap();
	const height = yOffset + heightmap.slice(0, _index).reduce((sum, a) => sum + a + nodeSnap.y * 2, 0);
	for (const node of nodes) {
		if (node.getAttribute('data-_rearranged') === 'true')
			continue;
		
		node.setAttribute('data-_rearranged', 'true');
		
		const [nodex, nodey] = getNodePosition(node);
		setNodePosition(node, nodex, height, false, true);
		
		const outputs = getOutputConnectedNodes(node);
		if (outputs.secondaryOutputNodes.length) {
			for (const [i, outputNode] of outputs.secondaryOutputNodes.entries()) {		
				if (i > 0)
					_index++;				
				const subNodes = getMainExecutionSequence(outputNode)[0];
				_index = rearrangeNodes(subNodes, heightmap, yOffset, _index);
			}
			
			if (outputs.mainOutputNode) {
				_index++;
				const subNodes = getMainExecutionSequence(outputs.mainOutputNode)[0];
				_index = rearrangeNodes(subNodes, heightmap, yOffset, _index);
			}
		}
	}

	return _index;
};

function placeNodeNextTo(targetNode, sourceNode, axis) {
	// const rect = sourceNode.getBoundingClientRect();
	const nodeSnap = getNodeSnap();
	const x = axis.includes('x') ? getNodePosition(sourceNode)[0] + sourceNode.offsetWidth + (nodeSnap.x * 2) : getNodePosition(targetNode)[0];
	const y = axis.includes('y') ? getNodePosition(sourceNode)[1] : getNodePosition(targetNode)[1];
	
	setNodePosition(targetNode, x, y, false, false);
};

function refreshNode(node) {
	redrawNodeCurves(node);
	const connections = getNodeConnections(node);
	for (const connection of connections.inputs.concat(connections.outputs))
		setConnectionConnected(connection, getConnectionCurves(connection).length > 0)
};

function getInputConnectedNodes(node) {
	if (!node)
		return null;
	
	return getNodeConnectedNodes(node).inputs;
};

function getOutputConnectedNodes(node) {
	const curves = getNodeCurves(node);
	if (!curves)
		return null;
	
	const outputCurves = curves.secondaryOutputs;
	if (!outputCurves)
		return null;
	
	const curvesRightConnection = outputCurves.map(curve => getCurveRightConnection(curve));			
	const nodes = curvesRightConnection.map(connection => getConnectionNode(connection));
	
	const mainOutputCurveRightConnection = curves.mainOutput ? getCurveRightConnection(curves.mainOutput) : null;
	const mainOutputNode = mainOutputCurveRightConnection ? getConnectionNode(mainOutputCurveRightConnection) : null;
	if (mainOutputNode) { // not useful ?
		const index = nodes.indexOf(mainOutputNode);
		if (index > -1)
			nodes.splice(index, 1);
	}
	
	return {secondaryOutputNodes: nodes, mainOutputNode: mainOutputNode};
};

function getAllNodesWithoutInputConnection() {
	return [getFirstNode()].concat(getAllNodesWithoutInputConnectionConnected())
};

function getAllNodesWithoutInputConnectionConnected() {
	return Array.from(document.querySelectorAll('.exec.inputConnection[data-connected="false"]')).map(connection => getConnectionNode(connection))
};

function getNodeCommandCode(node) {
	if (node.getAttribute('data-isCustom') !== "true")
		return parseInt(node.getAttribute('data-commandCode')) || 0;
	else
		return node.getAttribute('data-commandCode') || "";
};

function getNodeCommandName(node) {
	const commandCode = getNodeCommandCode(node);
	if (node.getAttribute('data-isCustom') !== "true")
		if (commandCode === 357) {
			return node.getAttribute('data-pluginCommandName');
		} else
			return $.Drag.VisualEvent.getCommandName(commandCode);
	else
		return window._customNodes[commandCode].name || "";
};

function attributeNodeId(node, nodeId) {
	if (!window.nodes.includes(node)) {
		if (node.hasAttribute('data-nodeId')) {
			window.nodes[getNodeId(node)] = node;
		} else {
			if (nodeId === null)
				nodeId = window.nodes.push(node) - 1;
			else 
				window.nodes[nodeId] = node;
			
			node.setAttribute('data-nodeId', nodeId);
			for (const element of node.querySelectorAll('*[data-nodeId="0"]'))
				element.setAttribute('data-nodeId', nodeId);
		}
	}
};

function getEventNodeName() {
	return `${window.data.targetType.toUpperCase()} ${String(window.data.targetId).padStart(4, '0')}${window.data.targetType === "Troop Event" || window.data.targetType === "Map Event" ? ': Page ' + ((window.data.pageId || 0) + 1) : ''}`;
};

// function focusNode(nodeId, node) {
	// if (!node && nodeId)
		// node = getNodeById(nodeId);
	// if (!node)
		// return;
	
	// const nodePosition = getNodePosition(node);
	// setGraphPosition(-nodePosition[0] + (window.outerWidth / 2) - (node.offsetWidth / 2), -nodePosition[1] + (window.outerHeight / 2) - (node.offsetHeight / 2));
// };

function focusNode(nodeId, node) {
	if (!node && nodeId)
		node = getNodeById(nodeId);
	if (!node)
		return;

	const [nodeX, nodeY] = getNodePosition(node);
	const scale = getGraphEditorScale();

	const graphEditor = document.querySelector('#graphEditor');
	const rect = graphEditor.getBoundingClientRect();

	const nodeCenterX = (nodeX + node.offsetWidth / 2) * scale;
	const nodeCenterY = (nodeY + node.offsetHeight / 2) * scale;

	const cameraX = rect.width / 2 - nodeCenterX;
	const cameraY = rect.height / 2 - nodeCenterY;

	setGraphPosition(cameraX, cameraY);
};

function getFirstNode() {
	return window.nodes[0];
};

function getNodeById(nodeId) {
	return document.querySelector(`#graphNode[data-nodeId="${nodeId}"]`);
};

function getNodeId(node) {
	if (!node)
		return -1;
	
	return parseInt(node.getAttribute('data-nodeId'));
};

// node selection

function getSelectedNodes() {
	return Array.from(document.querySelectorAll('#graphNode.selected'));
};

function isNodeSelected(node) {
	return node.classList.contains('selected');
};

function selectNode(node, saveInHistory = false) {
	if (!node)
		return;
	
	// if (saveInHistory && !node.classList.contains('selected'))
		// addToUndoHistory({type: "selectNode", target: [getNodeId(node)]});
	node.classList.add('selected');
	
	
	if (node.getAttribute('data-isCustom') == "true") {
		const customNodeData = getCustomNodeData(getNodeCommandCode(node));
		if (customNodeData.onselect && typeof customNodeData.onselect === "function")
			customNodeData.onselect(this, node);
	}
};

function selectAllNodes() {
	for (const node of window.nodes)
		selectNode(node);
	
	// addToUndoHistory({type: "selectNode", target: window.nodes.map(node => getNodeId(node))});
	
	closeNodeContextMenu();
	closeNodeListMenu();
};

function onUndoSelectNode(action) {
	const nodeIds = action.target;
	for (const nodeId of nodeIds)
		unselectNode(getNodeById(nodeId));
};

function onRedoSelectNode(action) {
	const nodeIds = action.target;
	for (const nodeId of nodeIds)
		selectNode(getNodeById(nodeId));
};

addHistoryHandler("selectNode", "Select Node", onUndoSelectNode, onRedoSelectNode);

function unselectNode(node, saveInHistory = false) {
	if (!node)
		return;
	
	node.classList.remove('selected');
	// if (saveInHistory)
		// addToUndoHistory({type: "unselectNode", target: [getNodeId(node)]});
};

function unselectAllNodes(saveInHistory = false) {
	const selectedNodes = getSelectedNodes();
	// if (saveInHistory && selectedNodes.length > 0)
		// addToUndoHistory({type: "unselectNode", target: selectedNodes.map(node => getNodeId(node))});
	for (const node of selectedNodes)
		unselectNode(node, false);
};

function onUndoUnselectNode(action) {
	const nodeIds = action.target;
	for (const nodeId of nodeIds)
		selectNode(getNodeById(nodeId));
};

function onRedoUnselectNode(action) {
	const nodeIds = action.target;
	for (const nodeId of nodeIds)
		unselectNode(getNodeById(nodeId));
};

addHistoryHandler("unselectNode", "Unselect Node", onUndoUnselectNode, onRedoUnselectNode);

//node tooltip
function getNodeTooltip() {
	return document.querySelector('#node-tooltip');
};

function hideNodeTooltip() {
	const nodeTooltip = getNodeTooltip();
	nodeTooltip.style.display = 'none';
};

function showNodeTooltip(node, x, y) {
	if (!node)
		return;
	
	const nodeTooltip = getNodeTooltip();
	const commandDescription = getNodeCommandDescription(node);
	if (!nodeTooltip || !commandDescription)
		return;
	
	
	nodeTooltip.style.display = 'initial';
	nodeTooltip.style.left = `${x}px`;
	nodeTooltip.style.top = `${y}px`;
	nodeTooltip.innerHTML = commandDescription;
};

function getNodeCommandDescription(node) {
	if (!node)
		return "";
	
	const commandCode = getNodeCommandCode(node);
	if (node.getAttribute('data-isCustom') == 'true') {
		const customNodeData = getCustomNodeData(commandCode);
		return customNodeData && customNodeData.description ? customNodeData.description : "";
	} else if (commandCode === 357) {
		const pluginName = node.getAttribute('data-pluginName');
		const pluginCommandName = node.getAttribute('data-pluginCommandName');
		if (pluginName && pluginCommandName) {
			const pluginCommandData = $.Drag.VisualEvent.pluginJSDocData[pluginName].commands[pluginCommandName];
			return pluginCommandData && pluginCommandData.desc ? pluginCommandData.desc : "";
		} else
			return "";
	} else 
		return $.Drag.VisualEvent.getCommandDescription(commandCode);
};

//custom Nodes
function getCustomNodeData(name) {
	const data = window._customNodes[name] || {};
	
	if (typeof data.exec_input !== "boolean")
		data.exec_input = true;
	if (typeof data.exec_input_params !== "object")
		data.exec_input_params = {};
	if (typeof data.exec_output !== "boolean")
		data.exec_output = true;
	if (typeof data.exec_output_params !== "object")
		data.exec_output_params = {};
	
	return data;
};

function getCustomNodeInputExecParams(name) {
	return getCustomNodeData(name).exec_input_params;
};

function getCustomNodeOutputExecParams(name) {
	return getCustomNodeData(name).exec_output_params;
};

function getCustomNodeParameters(name) {
	const customNode = getCustomNodeData(name);
	const parameters = customNode.inputs.concat(customNode.outputs).map(parameter => $.Drag.VisualEvent.interactiveInputs[parameter] ? $.Drag.VisualEvent.getInteractiveInputParameters(parameter) : $.Drag.VisualEvent.getInputParameters(parameter)); //$.Drag.VisualEvent.inputs[parameter]
	return parameters;
};