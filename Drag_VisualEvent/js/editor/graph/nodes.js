function makeNodeFromParams(params = {}, saveInHistory = false, cache = false, onNodeReady = null) {	
	//node data
	const node = document.createElement('div');
	const nodeId = params.nodeId !== undefined && params.nodeId !== null ? params.nodeId : window.nodes.length;
	const isCustom = params.isCustom || false;
	const commandCode = params.commandCode || 0;
	
	const nodeData = {
		id: nodeId,
		commandCode: commandCode,
		isCustom: isCustom,
		node: node,
		inputs: [],
		outputs: [],
	};
	node.data = nodeData;
	
	node.setAttribute('data-commandCode', commandCode); //required for CSS selector
	const customNodeData = isCustom ? getCustomNodeData(params.commandCode) : null;
	
	//node HTML	
	node.setAttribute('id', 'graphNode');
	
	if (params.classList)
		for (const classSplit of params.classList.split(' ').filter(item => item !== ''))
			node.classList.add(classSplit);
	
	if (params.attributes)
		for (const attribute of params.attributes)
			node.setAttribute(attribute[0], attribute[1]);
	
	let nodeContent = isCustom && customNodeData.header ? 
	`<div id="node-header" style="${isCustom ? `background-color: ${customNodeData.color || ''};` : ''}">${customNodeData.header}</div>`
	: `<p id="node-header" class="${params.headerClassList ? params.headerClassList : ""}" style="${isCustom ? `background-color: ${customNodeData.color || ''};` : ''}">${params.name || ""}</p>`;
	
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
	if (!window._pendingNodeInputs)
		window._pendingNodeInputs = [];

	const immediateLoadInputs = params._lazyLoadInputs === false ? true : isInGraphBounds(params.x, params.y);
	const connectionIdOffset = params.haveInputExecNode ? 1 : 0;
	const lastConnectionId = params.inputs.length - 1 + connectionIdOffset;
	for (const [i, input] of params.inputs.entries()) {
		const connectionId = i + connectionIdOffset;
		nodeContent += `
				<span id="node-input" class="nodeInput ${input.type === "empty" ? 'hidden' : ''}">
					<b>${input.text || input.name || ""}</b>
					<span data-connected="false" data-nodeId="${nodeId}" data-connectionId="${connectionId}" class="inputConnection"></span>
					${input.desc ? '<span class="node-input-desc">' + input.desc + '</span>' : '<br>'}
					<div id="input-wrapper">
		`;
		
		const values = input.isList ? Array.isArray(input.value) ? input.value : [input.value] : [input.value]; 
		
		if (immediateLoadInputs) {
			for (const [j, value] of values.entries()) {
				input.value = value;
				nodeContent += `
						<div class="firstChildWidth100">
							${$.Drag.VisualEvent.getInputField(input)}
						</div>
				`;
			}
		} else {
			nodeContent += `
						<div class="firstChildWidth100">
							<span>${values.join(' ')}</span>
						</div>
				`; //show interactive values ?
			
			node._preventInputChange = true;
			window._pendingNodeInputs.push({
				node: node,
				nodeId: nodeId,
				input: input,
				inputId: connectionId,
				values: values,
				isLast: connectionId === lastConnectionId,
				onNodeReady: onNodeReady
			});
		}
		
		nodeContent += `	
					</div>
				</span>
		`;
	}
	
	if (!params.inputs.length || immediateLoadInputs) {
		node._inputsReady = true;
		requestAnimationFrame(() => onNodeInputsReady(node, onNodeReady));
	}
	
	if (!immediateLoadInputs && !window._processingPendingNodeInputs) {
		window._processingPendingNodeInputs = true;
		requestAnimationFrame(() => {
			processPendingNodeInputs();
			window._processingPendingNodeInputs = false;
		});
	}
	
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
	
	nodeContent += `
			</div>
			${params.footer ? params.footer : ''}
		</div>
		${isCustom && customNodeData.body && typeof customNodeData.body === "string" ? customNodeData.body : ''}
		${(params.content || "")}
	`;
	
	node.innerHTML = nodeContent; 
	
	setNodePosition(node, params.x || 0, params.y || 0, false, cache);
	setNodeOffset(node, 0, 0);
	
	if (!window._preventAddNode) {
		console.log(`Adding Graph Node ${params.name} (${params.commandCode})`);
		addNodeToGraphNode(node, saveInHistory, cache, null);
	}
	
	return node;
};

function addNodeToGraphNode(node, saveInHistory = false, cache = false, frag = null) {
	const graphNode = getNodesGraph();
	if (!graphNode || !node)
		return;
	
	if (!node.data)
		node.data = {};
	
	//id
	if (node.data.id === null || node.data.id === undefined)
		node.data.id = window.nodes.length;
	
	registerNode(node.data);
	
	node.data.inputs = Array.from(node.querySelectorAll('.inputConnection'));
	for (const [i, inputConnection] of node.data.inputs.entries()) {
		inputConnection.nodeId = node.data.id;
		inputConnection.connectionId = i;
		inputConnection.connected = false;
	}
	
	node.data.outputs = Array.from(node.querySelectorAll('.outputConnection'));
	for (const [i, outputConnection] of node.data.outputs.entries()) {
		outputConnection.nodeId = node.data.id;
		outputConnection.connectionId = i;
		outputConnection.connected = false;
	}
	
	//listeners
	nodeResizeObserver.observe(node);
	node.onmousedown = onMouseDownGraphEditorNode.bind(null, node);
	node.onmouseup = onMouseUpGraphEditorNode.bind(null, node);
	
	const nodeHeader = node.firstElementChild;
	nodeHeader.addEventListener("dblclick", () => focusNode(null, node));
	nodeHeader.onmouseover = onNodeHeaderMouseOver.bind(null, node); 
	nodeHeader.onmousemove = onNodeHeaderMouseMove.bind(null, node);
	nodeHeader.onmouseout = onNodeHeaderMouseOut.bind(null, node);
	
	//add && init
	if (frag)
		frag.appendChild(node);
	else
		graphNode.appendChild(node);
	
	triggerAllOnReadyOnChange(node);
	autofitAllTextArea(node);
	
	onNodeResize(node);
	refreshNodeCull(node);
	
	if (node.data.isCustom) {
		const customNodeData = getCustomNodeData(getNodeCommandCode(node));
		if (customNodeData.onadd && typeof customNodeData.onadd === "function")
			customNodeData.onadd(this, node);
	}
	
	//cache
	if (cache) {
		if (node._inputsReady) {
			cacheGraphNode(node);
			registerNodeReferences(node);
		} else
			node._cacheNodeOnInputsReady = true;
	}

	//undo redo history
	if (saveInHistory)
		addToUndoHistory({type: "addNode", target: [node], cache: [getGraphNodeFromCache(node)]});
	
	node.isDeleted = false;
	triggerModsFunction("onAddNode", [node]);
};

function registerNode(nodeData) {
	window.nodes[nodeData.id] = nodeData;
};

function processPendingNodeInputs() {
    if (!window._pendingNodeInputs || !window._pendingNodeInputs.length) 
		return;

    const start = performance.now();
    while (window._pendingNodeInputs.length && (performance.now() - start) < 1) {
        const pendingNodeInputs = window._pendingNodeInputs.shift();
        buildNodeInputs(pendingNodeInputs);
    }

    if (window._pendingNodeInputs.length)
        window._processPendingNodeInputsRequest = requestAnimationFrame(processPendingNodeInputs);
	else if (!window._nodesCount || window._nodesCount === window.nodes.length)
		onAllNodeReady();
};

function buildNodeInputs(params) {
	const inputWrapper = params.node.querySelector(`#node-input span[data-connectionId="${params.inputId}"] ~ #input-wrapper`);
	if (!inputWrapper)
		return;
	
	let inputContainerHTML = '';
	for (const [j, value] of params.values.entries()) {
		params.input.value = value;
		inputContainerHTML += `
				<div class="firstChildWidth100">
					${$.Drag.VisualEvent.getInputField(params.input)}
				</div>
		`;
	}
	inputWrapper.innerHTML = inputContainerHTML;
	
	if (params.isLast)
		onNodeInputsReady(params.node, params.onNodeReady);
};

function onNodeInputsReady(node, onNodeReady) {
	node._inputsReady = true;
	
	if (onNodeReady)
		onNodeReady();

	triggerAllOnReadyOnChange(node);
	autofitAllTextArea(node)
	
	if (!node.isDummy) {
		updateNodeReadyCountGauge();
		registerNodeReferences(node);
		
		if (node._cacheNodeOnInputsReady) {
			cacheGraphNode(node);
			registerNodeReferences(node);
		}
	}
	
	triggerModsFunction("onNodeReady", [node]);
	for (const mod of Object.values(window._mods))
		if (typeof mod.onNodeReady === "function")
			mod.onNodeReady(window, node);
		
	node._preventInputChange = false;
};

function updateNodeReadyCountGauge() {
	window.nodesReadyCount++;
	const gauge = document.querySelector('#node-ready-gauge');
	const length = window._nodesCount ? window._nodesCount : window.nodes.length;
	
	gauge.classList.remove('hidden');
	gauge.firstElementChild.style.width = `${Math.floor(window.nodesReadyCount / length * 100)}%`;
	gauge.children[1].innerHTML = `Loading nodes... ${window.nodesReadyCount}/${length}`;
	
	hideNodeReadyCountGauge();
};

function hideNodeReadyCountGauge() {
	if (window._hideNodeReadyCountGaugeInterval)
		clearInterval(window._hideNodeReadyCountGaugeInterval);
	
	const gauge = document.querySelector('#node-ready-gauge');
	let opacity = 1;
	gauge.style.opacity = opacity;
	
	window._hideNodeReadyCountGaugeInterval = setInterval(() => {
		opacity = Math.max(0, opacity - 0.01);
		gauge.style.opacity = opacity;
		
		if (opacity <= 0) {
			gauge.classList.add('hidden');
			gauge.style.opacity = 1;
			clearInterval(window._hideNodeReadyCountGaugeInterval);
			delete window._hideNodeReadyCountGaugeInterval;
		}
	}, 10);
};

function onAllNodeReady() {	
	console.log(`All nodes (${window.nodes.length}) ready.`);
	hideNodeReadyCountGauge();
	
	if (window.onNodesReady) {
		window.onNodesReady();
		window.onNodesReady = null;
	}
	
	if (window.onNodesReadyEx) {
		window.onNodesReadyEx();
		window.onNodesReadyEx = null;
	}
	
	window._graphReady = true;
	window._registerInputChange = true;

	if (window._startPerformance) {
		console.log(`Editor ready (${performance.now() - window._startPerformance}ms).`);
		delete window._startPerformance;
	}
};

function cloneNode(node) {
	const clone = node.cloneNode(true);
	
	clone.nodeId = node.data.nodeId;
	clone.commandCode = node.data.commandCode;
	clone.isCustom = node.data.isCustom;
	
	return clone;
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
		
		if (action.connectionsMap && action.connectionsMap[i] && action.cache && action.cache[i]) {
			action.cache[i].connectionsMap = action.connectionsMap[i];
			setNodeCache(getNodeId(node), action.cache[i]);
			reconnectNodeFromConnectionsMap(node, action.connectionsMap[i]);
		} else 
			cacheGraphNode(node);
	}
	
	for (const node of nodes) {
		const connectedNodes = getNodeConnectedNodes(node);
		for (const connectedNode of connectedNodes.inputs)
			updateCacheGraphNodeConnectionsMap(connectedNode);
		for (const connectedNode of connectedNodes.outputs)
			updateCacheGraphNodeConnectionsMap(connectedNode);
	}
	
};

addHistoryHandler("addNode", "Add Node", onUndoAddNode, onRedoAddNode);

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
	
	node.data.isDeleted = true;
	node.remove();
};

function deleteSelectedNodes(saveInHistory = false) {
	const selectedNodes = getSelectedNodes().filter(node => !node.classList.contains('undeletable'));
	
	if (saveInHistory && selectedNodes.length > 0)
		addToUndoHistory({type: "deleteNode", target: selectedNodes, cache: selectedNodes.map(node => getGraphNodeFromCache(node)), connectionsMap: selectedNodes.map(node => getNodeConnectionsMap(node))});
	
	for (const node of selectedNodes) 
		deleteNode(node, false);
	
	closeNodeContextMenu();
};

addHistoryHandler("deleteNode", "Delete Node", onRedoAddNode, onUndoAddNode);

//move
function moveNode(event) {	
	if (!window.nodeMouseDown)
		return;
	
	const scale = getGraphEditorScale();
	const scaleMult = 100 / (scale * 100);
	
	const mousex = window.nodeMouseDown.mouseX || 0;
	const mousey = window.nodeMouseDown.mouseY || 0;
	
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
	
	const x = node.xOffset || 0;
	const y = node.yOffset || 0;
	return [x, y];
};

function setNodeOffset(node, x, y, curveOffset = false) {
	if (!node)
		return;
	
	const [xOffset, yOffset] = getNodeOffset(node);
	if (xOffset !== x || yOffset !== y) {
		node.xOffset = x;
		node.yOffset = y;
	
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
	if (!node || !node.data)
		return [0, 0];
	
	const x = node.data.x || 0;
	const y = node.data.y || 0;
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
		addToUndoHistory({type: "moveNode", target: [getNodeId(node)], movement: [nodePosition[0] - x, nodePosition[1] - y]});

	node.data.x = x;
	node.data.y = y;
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
		setNodePosition(node, nodePosition[0] - action.movement[0], nodePosition[1] - action.movement[1]);
		redrawNodeCurves(node);
	}
};

function onRedoMoveNode(action) {
	const nodeIds = action.target;
	for (const nodeId of nodeIds) {
		const node = getNodeById(nodeId);
		const nodePosition = getNodePosition(node);
		setNodePosition(node, nodePosition[0] + action.movement[0], nodePosition[1] + action.movement[1]);
		redrawNodeCurves(node);
	}
};

addHistoryHandler("moveNode", "Move Node", onUndoMoveNode, onRedoMoveNode);

//rearrange nodes
function rearrangeAllNodes(resetAllPositions = true) {
	setLoadingText(`Organizing nodes...`);
	showLoading();
	disableCullingGraphNodes();
	
	requestAnimationFrame(() => {
		requestAnimationFrame(() => {
			const start = performance.now();

			const nodeSnap = getNodeSnap();
			const graph = makeGraphLayout();
			const roots = getRootNodesFromGraphLayout(graph);

			if (resetAllPositions)
				resetNodesPositionsFromGraphLayout(graph, roots, nodeSnap);

			const positions = getPositionsFromGraphLayout(graph, roots, nodeSnap);
			for (const [node, pos] of positions) 
				setNodePosition(node, pos.x, pos.y, false, true);

			redrawAllCurves();
			refreshAllNodesCull();
			refreshAllCurvesCull();
			enableCullingGraphNodes();
			
			console.log(`Rearrange all nodes took ${performance.now() - start}ms`);
			hideLoading();
		});
	});
};

function makeGraphLayout() {
	const graph = new Map();

	for (const nodeData of window.nodes) {
		if (!nodeData)
			continue;
		
		const node = nodeData.node;
		const [x, y] = getNodePosition(node);

		graph.set(node, {node, id: getNodeId(node), x, y, width: node.offsetWidth || 0, height: node.offsetHeight || 0, inputs: [], mainOutput: null, branchOutputs: []});
	}

	for (const [node, data] of graph) {
		const outputs = getOutputConnectedNodes(node);

		if (outputs.mainOutputNode && graph.has(outputs.mainOutputNode))
			data.mainOutput = outputs.mainOutputNode;

		if (outputs.secondaryOutputNodes && outputs.secondaryOutputNodes.length)
			data.branchOutputs = outputs.secondaryOutputNodes.filter(outputNode => outputNode && graph.has(outputNode));
	}

	for (const [node, data] of graph) {
		if (data.mainOutput && graph.has(data.mainOutput))
			graph.get(data.mainOutput).inputs.push(node);

		for (const branchNode of data.branchOutputs)
			if (graph.has(branchNode))
				graph.get(branchNode).inputs.push(node);
	}

	return graph;
};

function getRootNodesFromGraphLayout(graph) {
	const roots = [];

	for (const [node, data] of graph)
		if (!data.inputs.length)
			roots.push(node);

	roots.sort((node1, node2) => {
		const data1 = graph.get(node1);
		const data2 = graph.get(node2);
		if (data1.y !== data2.y) 
			return data1.y - data2.y;
		return data1.x - data2.x;
	});

	return roots;
};

function resetNodesPositionsFromGraphLayout(graph, roots, nodeSnap) {
	const visited = new Set();
	const positions = new Map();

	let y = nodeSnap.y * 2;

	for (const root of roots) {
		if (visited.has(root))
			continue;

		const height = resetGraphLayoutSubbranch(root, graph, positions, visited, nodeSnap, nodeSnap.x * 2, y);
		y += height + nodeSnap.y * 2;
	}

	for (const [node, pos] of positions) {
		const data = graph.get(node);
		data.x = pos.x;
		data.y = pos.y;
	}
};

function resetGraphLayoutSubbranch(node, graph, newPositions, visited, nodeSnap, x, y) {
	if (!graph.has(node) || visited.has(node))
		return 0;

	visited.add(node);

	const data = graph.get(node);
	newPositions.set(node, {x, y});

	let currentY = y;
	let maxY = y + data.height;

	for (const branchNode of data.branchOutputs) {
		const branchHeight = resetGraphLayoutSubbranch(branchNode, graph, newPositions, visited, nodeSnap, x + data.width + nodeSnap.x * 2, currentY);
		currentY += Math.max(branchHeight, data.height) + nodeSnap.y * 2;
		maxY = Math.max(maxY, currentY);
	}

	if (data.mainOutput) {
		const mainY = data.branchOutputs.length ? currentY : y;
		const mainHeight = resetGraphLayoutSubbranch(data.mainOutput, graph, newPositions, visited, nodeSnap, x + data.width + nodeSnap.x * 2, mainY);
		maxY = Math.max(maxY, mainY + mainHeight);
	}

	return Math.max(data.height, maxY - y);
};

function getPositionsFromGraphLayout(graph, roots, nodeSnap) {
	const positions = new Map();
	const visited = new Set();

	let y = nodeSnap.y * 2;

	for (const root of roots) {
		if (visited.has(root))
			continue;

		const subbranchHeight = getPositionsFromSubbranch(root, graph, positions, visited, nodeSnap, nodeSnap.x * 2, y);
		y += subbranchHeight + nodeSnap.y * 2;
	}

	return positions;
}

function getPositionsFromSubbranch(node, graph, positions, visited, nodeSnap, x, y) {
	if (!graph.has(node))
		return 0;

	if (visited.has(node)) {
		const existing = positions.get(node);
		if (!existing)
			return graph.get(node).height;
		
		return graph.get(node).height;
	}

	visited.add(node);

	const data = graph.get(node);
	positions.set(node, {x, y});

	const subbranchX = x + data.width + nodeSnap.x * 2;
	let currentY = y;
	let subbranchHeight = 0;

	for (const branchNode of data.branchOutputs) {
		const branchHeight = getPositionsFromSubbranch(branchNode, graph, positions, visited, nodeSnap, subbranchX, currentY);
		const height = Math.max(branchHeight, graph.get(branchNode) ? graph.get(branchNode).height : 0);
		currentY += height + nodeSnap.y * 2;
		subbranchHeight += height + nodeSnap.y * 2;
	}

	let mainOutputHeight = 0;
	if (data.mainOutput) {
		const mainOutputY = data.branchOutputs.length ? currentY : y;
		mainOutputHeight = getPositionsFromSubbranch(data.mainOutput, graph, positions, visited, nodeSnap, subbranchX, mainOutputY);
	}

	if (data.branchOutputs.length || data.mainOutput) 
		return Math.max(data.height, (data.branchOutputs.length ? subbranchHeight : 0) + (data.mainOutput ? Math.max(mainOutputHeight, graph.get(data.mainOutput) ? graph.get(data.mainOutput).height : 0) : 0));

	return data.height;
};

function refreshNode(node) {
	redrawNodeCurves(node);
	const connections = getNodeConnections(node);
	for (const connection of connections.inputs.concat(connections.outputs))
		setConnectionConnected(connection, isConnectionConnected(connection))
};

function getNodeConnectedNodes(node) {
	if (!node)
		return null;
	
	const connectedConnections = getNodeConnectedConnections(node);
	if (!connectedConnections)
		return null;
	
	const connectedNodes = {inputs: [], outputs: []}; 
	for (const connection of connectedConnections.inputs) 
		connectedNodes.inputs = connectedNodes.inputs.concat(getConnectionConnectedNodes(connection));
	
	for (const connection of connectedConnections.outputs)
		connectedNodes.outputs = connectedNodes.outputs.concat(getConnectionConnectedNodes(connection));
	
	return connectedNodes;
};

function getInputConnectedNodes(node) {
	if (!node)
		return null;
	
	return getNodeConnectedNodes(node).inputs;
};

function getOutputConnectedNodes(node) {
	if (!node)
		return null;
	
	const outputConnections = [...getNodeConnections(node).outputs];
	const mainOutputConnection = outputConnections.pop();
	
	const nodes = [];
	for (const outputConnection of outputConnections) {
		if (!isConnectionConnected(outputConnection))
			continue;
		
		nodes.push(getConnectionConnectedNodes(outputConnection)[0]);
	}
	
	return {
		secondaryOutputNodes: nodes, 
		mainOutputNode: isConnectionConnected(mainOutputConnection) ? getConnectionConnectedNodes(mainOutputConnection)[0] : null
	};
};

function getAllNodesWithoutInputConnection() {
	return [getFirstNode()].concat(getAllNodesWithoutInputConnectionConnected())
};

function getAllNodesWithoutInputConnectionConnected() {
	return window.nodes.filter(nodeData => nodeData && nodeData.node && (!nodeData.node.inputs.length || !isConnectionConnected(nodeData.node.inputs[0])));
};

function getNodeIsCustom(node) {
	if (!node || !node.data)
		return false;
	
	return node.data.isCustom || false;
};

function getNodeCommandCode(node) {
	if (!node || !node.data)
		return "";
	
	return node.data.commandCode;
};

function getNodeCommandName(node) {
	if (!node || !node.data)
		return "";
	
	const commandCode = getNodeCommandCode(node);
	if (!getNodeIsCustom(node)) {
		if (commandCode === 357)
			return node.getAttribute('data-pluginCommandName');
		else
			return $.Drag.VisualEvent.getCommandName(commandCode);
	} else
		return window._customNodes[commandCode].name || "";
};

function getEventNodeName() {
	return `${window.data.targetType.toUpperCase()} ${String(window.data.targetId).padStart(4, '0')}${window.data.targetType === "Troop Event" || window.data.targetType === "Map Event" ? ': Page ' + ((window.data.pageId || 0) + 1) : ''}`;
};

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
	return window.nodes[0].node;
};

function getNodeDataById(nodeId) {
	return window.nodes[nodeId] || null;
};

function getNodeById(nodeId) {
	const nodeData = getNodeDataById(nodeId);
	return nodeData ? nodeData.node : null;
};

function getNodeId(node) {
	if (!node || !node.data)
		return -1;
	
	return node.data.id; 
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
	
	
	if (node.data.isCustom) {
		const customNodeData = getCustomNodeData(getNodeCommandCode(node));
		if (customNodeData.onselect && typeof customNodeData.onselect === "function")
			customNodeData.onselect(this, node);
	}
};

function selectAllNodes() {
	for (const node of window.nodes)
		selectNode(node.node);
	
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
	if (node.data.isCustom) {
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