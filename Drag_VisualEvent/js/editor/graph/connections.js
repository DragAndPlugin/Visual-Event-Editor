function moveConnection(event) {
	if (!window.connectionMouseDown || !(window.connectionMouseDown.classList.contains('exec') || window.connectionMouseDown.classList.contains('connectable')))
		return;
	
	let connectionType = getConnectionType(connectionMouseDown);
	let curves = getConnectionCurves(window.connectionMouseDown);
	let target;
	
	//no attached curves, create temp curve
	if (curves.length === 0) { 
		let curve;
		if (connectionType === "inputConnection")
			curve = createCurve(null, window.connectionMouseDown);
		else
			curve = createCurve(window.connectionMouseDown, null);
		
		curve.isTemp = true;
		
	//existing curve, move it
	} else { 
		let curve = window._grabbedCurve ? window._grabbedCurve : curves[0];
		
		//invert connection type when grabbing from connection without existing curve
		if (curve.isTemp)
			connectionType = connectionType === "inputConnection" ? "outputConnection" : "inputConnection";
		
		if (connectionType === "inputConnection" && event.path.map(item => item.id).includes("node-input"))
			target = event.path.find(item => item.id === "node-input").querySelector('.exec.inputConnection') || event.target;
		else if (connectionType === "outputConnection" && event.path.map(item => item.id).includes("main-exec-output") || event.path.map(item => item.id).includes("secondary-exec-output"))
			target = event.path.find(item => item.id === "main-exec-output" || item.id === "secondary-exec-output").querySelector('.exec.outputConnection') || event.target;
		else 
			target = event.target;
		
		if (window.connectionMouseDown === target) {
			// grabbed connection and target are the same
			setConnectionConnected(window.connectionMouseDown, true);
			target = window.connectionMouseDown;
		} else if (isConnectionTargetValid(target, window.connectionMouseDown, curve)) {
			// target is valid
			// if (!curve.isTemp)
				// setConnectionConnected(window.connectionMouseDown, false);
			
			setConnectionConnected(target, true);
			
			if (getConnectionCurves(target).length === 0)
				window.hoverConnection = target;

			// target = event.target;
		} else {
			//target is not a valid connection
			if (!curve.isTemp && curves.length === 1)
				setConnectionConnected(window.connectionMouseDown, false);
			
			target = [event.x, event.y];
		}
		
		if (connectionType === "inputConnection") {
			const leftConnection = getCurveLeftConnection(curve);
			drawCurve(leftConnection, target, curve);
			// connectConnections(leftConnection, target);
		} else {
			const rightConnection = getCurveRightConnection(curve);
			drawCurve(target, rightConnection, curve);
			// connectConnections(target, rightConnection);
		}
	}
	
	if (window.hoverConnection && target !== window.hoverConnection) {
		setConnectionConnected(window.hoverConnection, false);
		window.hoverConnection = null;
	}
};	

function onEndMoveConnection(event) {				
	if (!window.connectionMouseDown || !(window.connectionMouseDown.classList.contains('exec') || window.connectionMouseDown.classList.contains('connectable')))
		return;
	
	const curves = getConnectionCurves(window.connectionMouseDown);
	const curve = window._grabbedCurve ? window._grabbedCurve : curves[0];
	if (!curve)
		return;
	
	let connectionType = getConnectionType(window.connectionMouseDown);
	if (curve.isTemp)
		connectionType = connectionType === "inputConnection" ? "outputConnection" : "inputConnection";
	
	let target;
	if (connectionType === "inputConnection" && event.path.map(item => item.id).includes("node-input"))
		target = event.path.find(item => item.id === "node-input").querySelector('.exec.inputConnection') || event.target;
	else if (connectionType === "outputConnection" && event.path.map(item => item.id).includes("main-exec-output") || event.path.map(item => item.id).includes("secondary-exec-output"))
		target = event.path.find(item => item.id === "main-exec-output" || item.id === "secondary-exec-output").querySelector('.exec.outputConnection') || event.target;
	else 
		target = event.target;
	
	//target is valid
	if (isConnection(target) && isConnectionTargetValid(target, window.connectionMouseDown, curve)) {
		const targetNode = getConnectionNode(target);
		const sourceNode = getConnectionNode(window.connectionMouseDown);
		const previouslyConnectedConnection = connectionType === "inputConnection" ? getCurveLeftConnection(curve) : getCurveRightConnection(curve);
		
		const action = {};
		if (history) {
			const leftNode = getConnectionNode(getCurveLeftConnection(curve));
			const rightNode = getConnectionNode(getCurveRightConnection(curve));
			action.beforeNodeIds = [getNodeId(targetNode), getNodeId(sourceNode), getNodeId(leftNode), getNodeId(rightNode)];
			action.beforeConnectionsMap = [getGraphNodeFromCache(targetNode).connectionsMap, getGraphNodeFromCache(sourceNode).connectionsMap, getGraphNodeFromCache(leftNode).connectionsMap, getGraphNodeFromCache(rightNode).connectionsMap];
		}
		
		//mono connection already have a curve, destroy it
		if (target.classList.contains('mono')) {
			const currentCurves = getConnectionCurves(target);
			for (const currentCurve of currentCurves)
				if (currentCurve !== curve)
					removeCurve(currentCurve, false);
		}
		
		// output connection already have a curve, destroy it
		if (connectionType === "outputConnection") {
			const currentCurves = getConnectionCurves(target);
			for (const currentCurve of currentCurves)
				if (currentCurve !== curve)
					removeCurve(currentCurve, false);
		}
		
		if (previouslyConnectedConnection)
			disconnectConnections(previouslyConnectedConnection, window.connectionMouseDown);
	
		//update curve data
		const nodeId = parseInt(target.getAttribute('data-nodeId'));
		const connectionId = target.getAttribute('data-connectionId');
		if (connectionType === "inputConnection") {
			curve.rightConnectionId = connectionId;
			curve.rightNodeId = nodeId;
			curve.setAttribute('data-rightConnectionId', connectionId); 
			curve.setAttribute('data-rightNodeId', nodeId);
		} else {
			curve.leftConnectionId = connectionId;
			curve.leftNodeId = nodeId;
			curve.setAttribute('data-leftConnectionId', connectionId); 
			curve.setAttribute('data-leftNodeId', nodeId);
		}
		
		connectConnections(getCurveLeftConnection(curve), getCurveRightConnection(curve), true, curve);
		setConnectionConnected(target, true);
		curve.isTemp = false;
		
		const leftNode = getConnectionNode(getCurveLeftConnection(curve));
		const rightNode = getConnectionNode(getCurveRightConnection(curve));
		
		updateCacheGraphNodeConnectionsMap(targetNode);
		updateCacheGraphNodeConnectionsMap(sourceNode);
		updateCacheGraphNodeConnectionsMap(leftNode);
		updateCacheGraphNodeConnectionsMap(rightNode);
		
		if (history) {
			action.afterNodeIds = [getNodeId(targetNode), getNodeId(sourceNode), getNodeId(leftNode), getNodeId(rightNode)];
			action.afterConnectionsMap = [getGraphNodeFromCache(targetNode).connectionsMap, getGraphNodeFromCache(sourceNode).connectionsMap, getGraphNodeFromCache(leftNode).connectionsMap, getGraphNodeFromCache(rightNode).connectionsMap];
			action.type = "connect";
			addToUndoHistory(action);
		}
		
		setAsUnsaved(window.data.targetType, window.data.targetId, window.data.mapTargetId, window.data.pageId || 0);
	} else {
		//target is not valid, set curve as pending, show node list
		curve.isPending = true;
		window._pendingCurve = curve;
		const exclusive = window.connectionMouseDown.getAttribute('data-exclusive') ? window.connectionMouseDown.getAttribute('data-exclusive') : window.connectionMouseDown.classList.contains('exec') ? 'exec' : '';
		showNodeListMenu(event, exclusive);
	}
};

function onUndoConnectConnections(action) {
	for (const [i, nodeId] of action.beforeNodeIds.entries()) {
		const node = getNodeById(nodeId);
		reconnectNodeFromConnectionsMap(node, action.beforeConnectionsMap[i]);
		cacheGraphNode(node, null, action.beforeConnectionsMap[i]);
	}
};

function onRedoConnectConnections(action) {
	for (const [i, nodeId] of action.afterNodeIds.entries()) {
		const node = getNodeById(nodeId);
		reconnectNodeFromConnectionsMap(node, action.afterConnectionsMap[i]);
		cacheGraphNode(node, null, action.afterConnectionsMap[i]);
	}
};

addHistoryHandler("connect", "Connect", onUndoConnectConnections, onRedoConnectConnections);

function removeConnectionCurves(connection) {
	const curves = getConnectionCurves(connection);
	for (const curve of curves) {
		if (!curve)
			continue;
		
		removeCurve(curve);
	}
};

function isConnection(connection) {
	if (!(connection instanceof HTMLElement))
		return false;
	
	return connection.classList.contains("inputConnection") || connection.classList.contains("outputConnection");
};

function isConnectionConnected(connection) {
	if (!connection)
		return false;
	
	return connection.connectedConnections && connection.connectedConnections.length > 0;
	// return connection.connected; //connection.getAttribute('data-connected') === "true";
};

function setConnectionConnected(connection, connected) {
	connection.connected = connected === true || connected === "true";
	connection.setAttribute('data-connected', connected === true || connected === "true"); //setting attribute is needed for css
	triggerModsFunction("onNodeConnection", [getConnectionNode(connection), connection, connected]);
};

function connectConnections(connection1, connection2, draw = true, curve = null) {
	if (!connection1.connectedConnections)
		connection1.connectedConnections = [];
	
	if (!connection2.connectedConnections)
		connection2.connectedConnections = [];
	
	connection1.connectedConnections.push(connection2);
	connection2.connectedConnections.push(connection1);
	
	if (draw)
		drawCurve(connection1, connection2, curve);
};

function disconnectConnections(connection1, connection2) {
	if (!connection1.connectedConnections)
		connection1.connectedConnections = [];
	
	if (!connection2.connectedConnections)
		connection2.connectedConnections = [];
	
	$.Drag.VisualEvent.removeItem(connection1.connectedConnections, connection2);
	$.Drag.VisualEvent.removeItem(connection2.connectedConnections, connection1);
};

function getConnectionType(connection) {
	return connection.classList.contains("inputConnection") ? "inputConnection" : "outputConnection";
};

function getConnectionNode(connection) {
	if (!connection)
		return null;
	
	const nodeId = connection.nodeId;
	return getNodeById(nodeId);
};

function getNodeConnectionsById(node, id = 0) {
	if (!node || !node.data)
		return {input: null, output: null};
	
	const input = node.data.inputs[id];
	const output = node.data.outputs[id];
	return {input: input, output: output};
};

function getNodeConnections(node) {
	if (!node || !node.data)
		return {inputs: [], outputs: []};
	
	const inputs = node.data.inputs;
	const outputs = node.data.outputs;
	return {inputs: inputs, outputs : outputs};
};

function getNodeConnectedConnections(node) {
	if (!node || !node.data)
		return {inputs: [], outputs: []};
	
	const connections = getNodeConnections(node);
	connections.inputs = connections.inputs.filter(connection => connection.connected);
	connections.outputs = connections.outputs.filter(connection => connection.connected);
	return connections;
};

function getNodeConnectedConnectionsIds(node) {
	if (!node)
		return null;
	
	const connections = getNodeConnectedConnections(node);
	connections.inputs = connections.inputs.map(connection => connection.connectionId);
	connections.outputs = connections.outputs.map(connection => connection.connectionId);
	return connections;
};

function getConnectionConnectedNodes(connection) {
	if (!connection)
		return null;
	
	// const connectionType = getConnectionType(connection);
	// const curves = getConnectionCurves(connection);
	// const connectedConnections = curves.map(curve => connectionType === "inputConnection" ? getCurveLeftConnection(curve) : getCurveRightConnection(curve));
		
	// return connectedConnections.map(connection => getConnectionNode(connection));
	return getConnectionConnectedConnections(connection).map(connectedConnection => getConnectionNode(connectedConnection));
};

function getConnectionConnectedConnections(connection) {
	if (!connection)
		return [];
	
	// const connectionType = getConnectionType(connection);
	// const curves = getConnectionCurves(connection);
	
	// return curves.map(curve => connectionType === "inputConnection" ? getCurveLeftConnection(curve) : getCurveRightConnection(curve));
		return connection.connectedConnections;
};

function getConnectionId(connection) {
	if (!connection)
		return null;
	
	return connection.connectionId;
};

function getNodeConnectionsMap(node) {
	if (!node)
		return null;
	
	const connectionsMap = {inputs: [], outputs: []};
	const connections = getNodeConnections(node);
	
	//make input connections map
	for (const connection of connections.inputs)
		if (isConnectionConnected(connection)) {
			const nodeIds = getConnectionConnectedNodes(connection).map(connectedNode => getNodeId(connectedNode));
			const connectionIds = getConnectionConnectedConnections(connection).map(connectedConnection => getConnectionId(connectedConnection));
			connectionsMap.inputs.push({nodeId: nodeIds, connectionId: connectionIds});
		} else
			connectionsMap.inputs.push(false);
		
	//make output connections map
	for (const connection of connections.outputs)
		if (isConnectionConnected(connection)) {
			const nodeIds = getConnectionConnectedNodes(connection).map(connectedNode => getNodeId(connectedNode));
			const connectionIds = getConnectionConnectedConnections(connection).map(connectedConnection => getConnectionId(connectedConnection));
			connectionsMap.outputs.push({nodeId: nodeIds, connectionId: connectionIds});
		} else
			connectionsMap.outputs.push(false);
	
	return connectionsMap;
};

function rebuildListFromConnectionsMap(node, connectionsMap) {
	if (!node || !connectionsMap)
		return;
	
	const inputLength = getNodeConnections(node).inputs.length;
	if (connectionsMap.inputs.length > inputLength) {
		const list = node.querySelector('#input-container *[data-isList="true"]');
		if (list) {
			const button = list.parentElement.querySelector('#add-list-input-button');
			for (let i = inputLength; i < connectionsMap.inputs.length; i++)
				$.Drag.VisualEvent.addListInput(button);
		}
	}
	
	const outputLength = getNodeConnections(node).outputs.length;
	if (connectionsMap.outputs.length > outputLength) {
		const list = node.querySelector('#output-container *[data-isList="true"]');
		if (list) {
			const button = node.querySelector('#output-container *[data-isList="true"]').parentElement.querySelector('#add-list-input-button');
			for (let i = outputLength; i < connectionsMap.outputs.length; i++)
				$.Drag.VisualEvent.addListInput(button);
		}
	}
};

function reconnectNodeFromConnectionsMap(node, connectionsMap, inputOnly = false, frag = document.createDocumentFragment(), append = true) {
	if (!node || !connectionsMap)
		return;
	
	for (const [connectionIndex, target] of connectionsMap.inputs.entries()) {
		const connection = getNodeConnectionsById(node, connectionIndex).input;
		if (!connection)
			continue;
		
		if (target) {
			//legacy connections map didn't used arrays, convert them
			if (!Array.isArray(target.nodeId))
				target.nodeId = [target.nodeId];
			
			if (!Array.isArray(target.connectionId))
				target.connectionId = [target.connectionId];
			
			const nodeTargets = target.nodeId.map(id => getNodeById(id));
			const connectionTargets = nodeTargets.map((nodeTarget, index) => getNodeConnectionsById(nodeTarget, target.connectionId[index]).output);
			const existingCurves = getConnectionCurves(connection);
			
			for (const existingCurve of existingCurves)
				if (existingCurve)
					removeCurve(existingCurve, false);
			
			for (const connectionTarget of connectionTargets)
				if (connectionTarget) {
					drawCurve(connectionTarget, connection, null, frag);
					connectConnections(connectionTarget, connection, false);
				}
			
		} else if (isConnectionConnected(connection)) {
			const existingCurves = getConnectionCurves(connection);
			for (const existingCurve of existingCurves)
				if (existingCurve)
					removeCurve(existingCurve, false);
			setConnectionConnected(connection, false);
		}
	}
	
	if (inputOnly && append)
		getGraphSVG().appendChild(frag);
	
	if (inputOnly)
		return frag;
	
	for (const [connectionIndex, target] of connectionsMap.outputs.entries()) {
		const connection = getNodeConnectionsById(node, connectionIndex).output;
		if (!connection)
			continue;
		
		if (target) {
			//legacy connections map didn't used arrays, convert them
			if (!Array.isArray(target.nodeId))
				target.nodeId = [target.nodeId];
			
			if (!Array.isArray(target.connectionId))
				target.connectionId = [target.connectionId];
			
			const nodeTargets = target.nodeId.map(id => getNodeById(id));
			const connectionTargets = nodeTargets.map((nodeTarget, index) => getNodeConnectionsById(nodeTarget, target.connectionId[index]).input);
			const existingCurves = getConnectionCurves(connection);
			
			for (const existingCurve of existingCurves)
				if (existingCurve)
					removeCurve(existingCurve, false);
			
			for (const connectionTarget of connectionTargets)
				if (connectionTarget) {
					drawCurve(connection, connectionTarget, null, frag);
					connectConnections(connection, connectionTarget, false);
				}
			
		} else if (isConnectionConnected(connection)) {
			const existingCurves = getConnectionCurves(connection);
			for (const existingCurve of existingCurves)
				if (existingCurve)
					removeCurve(existingCurve, false);
			setConnectionConnected(connection, false);
		}
	}
	
	if (append)
		getGraphSVG().appendChild(frag);
	
	return frag;
};

function isConnectionTargetValid(target, connection, curve) {
	let connectionType = getConnectionType(connection);
	if (curve.isTemp)
			connectionType = connectionType === "inputConnection" ? "outputConnection" : "inputConnection";
	
	if (!(target.classList.contains('exec') || target.classList.contains('connectable')) && !(connection.classList.contains('exec') || connection.classList.contains('exec')))
		return false;
	
	const connectionExclusive = connection.getAttribute('data-exclusive');
	const targetExclusive = target.getAttribute('data-exclusive');
	if (!!connectionExclusive !== !!targetExclusive)
		return false;
	if (connectionExclusive && targetExclusive && !$.Drag.VisualEvent.arrayIncludesAny(targetExclusive.split(' '), connectionExclusive.split(' ')))
		return false;
	
	if (connectionType === "inputConnection") {
		const leftConnection = getCurveLeftConnection(curve);
		return target.classList.contains(connectionType) && target.getAttribute('data-nodeId') !== leftConnection.getAttribute('data-nodeId');
	} else {
		const rightConnection = getCurveRightConnection(curve);
		return target.classList.contains(connectionType) && target.getAttribute('data-nodeId') !== rightConnection.getAttribute('data-nodeId');
	}
};

function refreshNodeConnections(node) {
	//attribute unique connections ids to input and outputs and reattribute correct ids to curves
	const inputConnections = Array.from(node.querySelectorAll('.exec.inputConnection'));
	for (const [index, input] of inputConnections.entries()) {
		const currentConnectionIndex = parseInt(input.getAttribute('data-connectionId'));
		input.setAttribute('data-connectionId', index);
		
		if (currentConnectionIndex >= index) {
			const connectionCurve = getCurveById(getNodeId(node), currentConnectionIndex, 'right');
			setCurveConnectionId(connectionCurve, index, 'right');
		}
	}
	
	const outputConnections = Array.from(node.querySelectorAll('.exec.outputConnection'));
	for (const [index, output] of outputConnections.entries()) {
		const currentConnectionIndex = parseInt(output.getAttribute('data-connectionId'));
		output.setAttribute('data-connectionId', index);
		
		if (currentConnectionIndex >= index) {
			const connectionCurve = getCurveById(getNodeId(node), currentConnectionIndex, 'left');
			setCurveConnectionId(connectionCurve, index, 'left');
		}
	}
};

function addNodeOutput(node, outputExec, position) {
	const nodeId = getNodeId(node);
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