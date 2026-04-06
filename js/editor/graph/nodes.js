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
	
	node.innerHTML = `<p id="node-header" class="${params.headerClassList ? params.headerClassList : ""}" style="${isCustom ? `background-color: ${getCustomNodeData(params.commandCode).color || ''};` : ''}">${params.name || ""}</p>`;
	
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
		${(params.content || "")}`;
		
	// setTimeout(() => { 
		node.innerHTML += nodeContent; 
		
		setNodePosition(node, params.x || 0, params.y || 0, saveInHistory, cache);
		setNodeOffset(node, 0, 0);
		
		if (!window._preventAddNode)
			addNodeToGraphNode(node, saveInHistory, cache, null, null);
	// }, 1);
	
	return node;
};

// function addRerouteNode() {
	// <div id="graphNode">
		// <p id="node-header" class="" style="background: none; min-height: 1em; margin: 0; padding: 0;"></p>
		// <div class="mBottom05 relative " style="margin-bottom: 0; display: flex; height: 2em;">
			// <div id="input-container" style="max-width: 2em;">
				// <span id="node-input" class="node-input-exec" style="margin-left: 0.3em;">
					// <span data-connected="false" data-nodeid="19" data-connectionid="0" data-exclusive="exec" class="exec inputConnection"></span>
				// </span>
			// </div>
			// <div id="output-container">
				// <span class="nodeOutput" id="main-exec-output" style="margin-right: 0.3em;"> 
					// <span data-connected="false" data-nodeid="19" data-connectionid="0" data-indent="0" data-exclusive="exec" class="exec outputConnection "></span>
				// </span>
			// </div>
		// </div>
	// </div>
// };

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
	
	//add && init
	if (frag)
		frag.appendChild(node);
	else
		graphNode.appendChild(node);
	triggerAllOnReadyOnChange();
	autofitAllTextArea();
	onNodeResize(node);
	
	//cache
	if (cache)
		cacheGraphNode(node);

	//undo redo history
	if (saveInHistory)
		addToNodeHistory({type: "add", target: node});
	
	node.setAttribute('data-_ready', 'true');
	triggerModsFunction("onAddNode", [node]);
};			

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

function deleteNode(node, saveInHistory = false) {
	if (node.classList.contains('undeletable'))
		return;
	
	const curves = getNodeCurves(node);
	if (saveInHistory)
		addToNodeHistory({type: "delete", target: node, connectionsMap: getNodeConnectionsMap(node)});
	
	for (const inputCurve of curves.inputs)
		removeCurve(inputCurve);
	for (const outputCurve of curves.outputs) 
		removeCurve(outputCurve);
	
	setAsUnsaved(window.data.targetType, window.data.targetId, window.data.mapTargetId, window.data.pageId || 0);
	uncacheGraphNode(node);
	nodeResizeObserver.unobserve(node);
	node.remove();
};

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
	
	for (const node of document.querySelectorAll("#graphNode.selected"))
		setNodeOffset(node, xSnappedMovement, ySnappedMovement, true);
};

function getNodeSnap() {
	return {x: parseInt(window._cache.editor.options.uiScale / 14 * 40), y: parseInt(window._cache.editor.options.uiScale / 14 * 40)};
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
		
		// redrawNodeCurves(node);
		// setTimeout(() => redrawNodeCurves(node), 0);
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
	
	if (saveInHistory)
		addToNodeHistory({type: "move", target: node, from: getNodePosition(node), to: [x, y]});
	
	node.setAttribute('data-x', x);
	node.setAttribute('data-y', y);
	node.style.left = `${x}px`;
	node.style.top = `${y}px`;
	
	if (cache)
		updateCacheGraphNodePosition(node);
	
	const [xNode, yNode] = getNodePosition(node);
	if (xNode !== x || yNode !== y)
		redrawNodeCurves(node);
};

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

function selectAllNodes() {
	for (const node of window.nodes)
		selectNode(node, true);
	
	closeNodeContextMenu();
	closeNodeListMenu();
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

function focusNode(nodeId) {
	const node = getNodeById(nodeId);
	if (!node)
		return;
	
	const nodePosition = getNodePosition(node);
	setGraphPosition(-nodePosition[0] + (window.outerWidth / 2) - (node.offsetWidth / 2), -nodePosition[1] + (window.outerHeight / 2) - (node.offsetHeight / 2));
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

// select node

function selectNode(node, saveInHistory = false) {
	node.classList.add('selected');
	if (saveInHistory)
		addToNodeHistory({type: "select", target: node});
};

function unselectNode(node, saveInHistory = false) {
	node.classList.remove('selected');
	if (saveInHistory)
		addToNodeHistory({type: "unselect", target: node});
};

function unselectAllNodes(saveInHistory = false) {
	for (const node of getSelectedNodes())
		unselectNode(node, saveInHistory);
};

function getSelectedNodes() {
	return Array.from(document.querySelectorAll('#graphNode.selected'));
};

function deleteSelectedNodes(saveInHistory = false) {
	for (const node of getSelectedNodes()) 
		deleteNode(node, saveInHistory);
	
	closeNodeContextMenu();
};

function isNodeSelected(node) {
	return node.classList.contains('selected');
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