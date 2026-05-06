function drawCurve(from, to, curve, frag = null) { //version with graph camera and transform translate3d
	if (!from || !to)
		return;
	
	let fromPoint = from;
	let toPoint = to;
	if (isCullingGraphNodesEnabled()) {
		if (isConnection(from) && isNodeCulled(getConnectionNode(from)))
			fromPoint = getCulledNodeOutputAnchor(getConnectionNode(from));
		
		if (isConnection(to) && isNodeCulled(getConnectionNode(to)))
			toPoint = getCulledNodeInputAnchor(getConnectionNode(to));
	}
	
	const scale = getGraphEditorScale();
	const [cameraX, cameraY] = getGraphPosition();

	const fromRect = !Array.isArray(fromPoint) ? fromPoint.getBoundingClientRect() : null;
	const toRect = !Array.isArray(toPoint) ? toPoint.getBoundingClientRect() : null;

	const screenFromX = fromRect ? fromRect.left + fromRect.width / 2 : fromPoint[0];
	const screenFromY = fromRect ? fromRect.top + fromRect.height / 2 : fromPoint[1];

	const screenToX = toRect ? toRect.left + toRect.width / 2 : toPoint[0];
	const screenToY = toRect ? toRect.top + toRect.height / 2 : toPoint[1];

	// convert screen to graph coordinates
	const fromx = (screenFromX - cameraX) / scale;
	const fromy = (screenFromY - cameraY) / scale;

	const tox = (screenToX - cameraX) / scale;
	const toy = (screenToY - cameraY) / scale;

	if (!curve)
		curve = createCurve(from, to, frag ? frag : null);

	curve.setAttribute('data-coords', `${fromx},${fromy},${tox},${toy}`);
	curve.from = [fromx, fromy];
	curve.to = [tox, toy];
	curve.setAttributeNS(null, "d", getCurveShape(fromx, fromy, tox, toy));
};

function getCurveShape(fromx, fromy, tox, toy) {
	return `M ${fromx},${fromy} L ${fromx},${fromy} ${makeCubicBezierCurve(fromx + 50, fromy, tox - 20, toy)} L ${tox} ${toy}`;
};

function makeCubicBezierCurve(fromx, fromy, tox, toy) {
	//https://codepen.io/explosion/pen/YGrpwd
	
	const dx = tox - fromx;
	const dy = toy - fromy;

	const absDx = Math.abs(dx);

	let tangent = absDx * 0.5;
	tangent = Math.max(60, Math.min(300, tangent));

	// if the connection goes backwards, increase the loop
	if (dx < 0)
		tangent = Math.max(120, absDx * 0.8);
	
	tangent += Math.abs(dy) * 0.1;

	const c1x = fromx + tangent;
	const c1y = fromy;

	const c2x = tox - tangent;
	const c2y = toy;

	return `C ${c1x},${c1y} ${c2x},${c2y} ${tox},${toy}`;
};

function offsetCurve(curve, leftOffset = [0, 0], rightOffset = [0, 0]) {
	if (!curve)
		return;
	
	const fromx = curve.from[0] + leftOffset[0];
	const fromy = curve.from[1] + leftOffset[1];
	const tox = curve.to[0] + rightOffset[0];
	const toy = curve.to[1] + rightOffset[1];

	curve.setAttribute('data-coords', `${fromx},${fromy},${tox},${toy}`);
	curve.from = [fromx, fromy];
	curve.to = [tox, toy];
	curve.setAttributeNS(null, "d", getCurveShape(fromx, fromy, tox, toy));
};

function createCurve(from, to, container) {
	if (!container)
		container = document.querySelector('#graphSVG');
	
	const curve = document.createElementNS("http://www.w3.org/2000/svg", 'path')
	curve.setAttribute('id', "curve");
	
	curve.onmousedown = onCurveMouseDown.bind(null, curve);
	curve.addEventListener('mouseover', function(e) { 
		e.target.classList.add("hovered"); 
		e.target.parentElement.classList.add("hovered"); 
		if (!window._grabbedCurve)
			document.querySelector('#graphEditor').style.cursor = "-webkit-grab";
	}); 
	curve.addEventListener('mouseout', function(e) { 
		e.target.classList.remove("hovered"); 
		e.target.parentElement.classList.remove("hovered"); 
		if (!window._grabbedCurve)
			document.querySelector('#graphEditor').style.removeProperty('cursor');
	});
	
	connectCurve(from, to, curve, false);
	
	container.appendChild(curve);
	
	return curve;
};

function isCurve(curve) {
	if (!curve)
		return false;

	if (!(curve instanceof HTMLElement) || curve.getAttribute('id') !== "curve")
		return false;
	
	return true;
};

function connectCurve(from, to, curve, disconnect = true, history = false) {	
	if (!curve)
		return drawCurve(from, to);
	
	if (disconnect)
		disconnectCurve(curve);
	
	if (from)
		setConnectionConnected(from, true);
	
	if (to)
		setConnectionConnected(to, true);
	
	// if (from && to)
		// connectConnections(from, to);
	
	if (to && to.getAttribute("data-curveColor"))
		curve.style.stroke = to.getAttribute("data-curveColor");
	else if (from && from.getAttribute("data-curveColor"))
		curve.style.stroke = from.getAttribute("data-curveColor");
	
	curve.leftNodeId = from ? parseInt(from.getAttribute('data-nodeId')) : null;
	curve.leftConnectionId = from ? parseInt(from.getAttribute('data-connectionId')) : null;
	curve.setAttribute('data-leftNodeId', from ? from.getAttribute('data-nodeId') : null);
	curve.setAttribute('data-leftConnectionId', from ? from.getAttribute('data-connectionId') : null);
	
	curve.rightNodeId = to ? parseInt(to.getAttribute('data-nodeId')) : null;
	curve.rightConnectionId = to ? parseInt(to.getAttribute('data-connectionId')) : null;
	curve.setAttribute('data-rightNodeId', to ? to.getAttribute('data-nodeId') : null);
	curve.setAttribute('data-rightConnectionId', to ? to.getAttribute('data-connectionId') : null); 
};

function connectPendingCurve(node) {
	const pendingCurve = window._pendingCurve;
	if (!pendingCurve)
		return;
	
	const leftNodeId = pendingCurve.leftNodeId;
	const rightNodeId = pendingCurve.rightNodeId;

	if (rightNodeId === null && leftNodeId === null)
		return;
	
	if (rightNodeId === null || leftNodeId === null) {
		let outputConnection;
		let inputConnection;
		let connectedNode;
		
		if (rightNodeId === null) { //connect to node input
			outputConnection = getCurveLeftConnection(pendingCurve);
			inputConnection = getNodeConnections(node).inputs[0];
			connectedNode = getConnectionNode(outputConnection);
		} else if (leftNodeId === null) { //connect to node output
			outputConnection = getNodeConnections(node).outputs[0];
			inputConnection = getCurveRightConnection(pendingCurve);
			connectedNode = getConnectionNode(inputConnection);
		} 
		
		if (outputConnection && inputConnection) {
			connectCurve(outputConnection, inputConnection, pendingCurve);
			connectConnections(outputConnection, inputConnection, false);
			
			pendingCurve.isPending = false;
			pendingCurve.isTemp = false;
			window._pendingCurve = null;
			
			updateCacheGraphNodeConnectionsMap(node);
			if (connectedNode)
				updateCacheGraphNodeConnectionsMap(connectedNode);
		}
	} else { //insert between two nodes
		const leftNode = getNodeById(leftNodeId);
		const rightNode = getNodeById(rightNodeId);
		let outputConnection = getNodeConnections(leftNode).outputs[0];
		let inputConnection = getNodeConnections(node).inputs[0];
		
		connectCurve(outputConnection, inputConnection, pendingCurve);
		connectConnections(outputConnection, inputConnection, false);
		
		pendingCurve.isPending = false;
		pendingCurve.isTemp = false;
		window._pendingCurve = null;
		
		outputConnection = getNodeConnections(node).outputs[0];
		inputConnection = getNodeConnections(rightNode).inputs[0];
		connectConnections(outputConnection, inputConnection);
		redrawNodeCurves(node);
		
		updateCacheGraphNodeConnectionsMap(node);
		updateCacheGraphNodeConnectionsMap(leftNode);
		updateCacheGraphNodeConnectionsMap(rightNode);
	}
};

function disconnectCurve(curve) {
	if (!curve)
		return;
	
	const leftConnection = getCurveLeftConnection(curve);
	if (leftConnection)
		setConnectionConnected(leftConnection, false);
	
	const rightConnection = getCurveRightConnection(curve);
	const rightConnectionCurves = getConnectionCurves(rightConnection);
	if (rightConnection && rightConnectionCurves.length === 1)
		setConnectionConnected(rightConnection, false);
	
	if (!!leftConnection && !!rightConnection)
		disconnectConnections(leftConnection, rightConnection);
};

function removeCurve(curve, cache = true, history = false) {
	if (!curve)
		return;
	
	if (history)
		addToUndoHistory({
			type: 'disconnect', 
			leftNodeId: curve.leftNodeId,
			leftConnectionId: curve.leftConnectionId,
			rightNodeId: curve.rightNodeId,
			rightConnectionId: curve.rightConnectionId,
		});
	disconnectCurve(curve);
	curve.remove();
	
	if (cache) {
		setAsUnsaved(window.data.targetType, window.data.targetId, window.data.mapTargetId, window.data.pageId || 0);
		
		const leftNodeId = curve.leftNodeId;
		if (leftNodeId !== null)
			updateCacheGraphNodeConnectionsMap(getNodeById(leftNodeId));
		const rightNodeId = curve.rightNodeId;
		if (rightNodeId !== null)
			updateCacheGraphNodeConnectionsMap(getNodeById(rightNodeId));
	}
};

function onUndoDisconnect(action) {
	const from = getNodeConnectionsById(getNodeById(action.leftNodeId), action.leftConnectionId).output;
	const to = getNodeConnectionsById(getNodeById(action.rightNodeId), action.rightConnectionId).input;
	drawCurve(from, to);
	connectConnections(from, to, false);
	
	const fromNode = getConnectionNode(from);
	const toNode = getConnectionNode(to);
	updateCacheGraphNodeConnectionsMap(fromNode);
	updateCacheGraphNodeConnectionsMap(toNode);
};

function onRedoDisconnect(action) {
	const curve = getCurveById(action.leftNodeId, action.leftConnectionId, 'left');
	removeCurve(curve);
};

addHistoryHandler('disconnect', 'Disconnect', onUndoDisconnect, onRedoDisconnect);

function onCurveMouseDown(curve, event) {
	if (event.which === 1){
		window._grabbedCurve = curve;
		document.querySelector('#graphEditor').style.cursor = "-webkit-grabbing";
	}
};

function moveCurves(event) {
	if (!window.nodeMouseDown)
		return;
	
	const nodeId = window.nodeMouseDown.nodeId;
	for (const input of window.nodeMouseDown.querySelectorAll('.inputConnection')) {
		const inputId = parseInt(input.getAttribute('data-connectionId'));
		for (const curve of document.querySelectorAll(`path[data-rightNodeId="${nodeId}"][data-rightConnectionId="${inputId}"]`)) {
			const fromId = curve.leftNodeId;
			const outputId = curve.leftConnectionId;
			const output = document.querySelector(`#graphNode[data-nodeId="${fromId}"] .outputConnection[data-connectionId="${outputId}"]`);
			
			connectConnections(output, input, true, curve);
		}
	}
	
	for (const output of window.nodeMouseDown.querySelectorAll('.outputConnection')) {
		const outputId = parseInt(output.getAttribute('data-connectionId'));
		for (const curve of document.querySelectorAll(`path[data-leftNodeId="${nodeId}"][data-leftConnectionId="${outputId}"]`)) {
			const toId = curve.rightNodeId;
			const inputId = curve.rightConnectionId;
			const input = document.querySelector(`#graphNode[data-nodeId="${toId}"] .inputConnection[data-connectionId="${inputId}"]`);
			
			connectConnections(output, input, true, curve);
		}
	}
};

function redrawAllCurves() {
	if (window._redrawAllCurvesInterval)
		clearInterval(window._redrawAllCurvesInterval);
	
	const curves = [...getAllCurves()];
	window._redrawAllCurvesInterval = setInterval(() => {
		if (curves.length > 0) {
			const curve = curves.shift();
			redrawCurve(curve);
		}
		else
			clearInterval(window._redrawAllCurvesInterval);
	}, 1);
};

function redrawCurve(curve) {
	if (!curve)
		return;
	
	const toId = curve.rightNodeId;
	const inputId = curve.rightConnectionId;
	const fromId = curve.leftNodeId;
	const outputId = curve.leftConnectionId;
	const leftNode = getNodeById(fromId);
	const rightNode = getNodeById(toId);
	
	if (!leftNode || !rightNode)
		return;
	
	const from = getNodeConnectionsById(leftNode, outputId).output;
	const to = getNodeConnectionsById(rightNode, inputId).input;

	if (!from || !to)
		return;
	
	drawCurve(from, to, curve);
};

function drawNodeCurves(node) {
	const connectionsMap = getNodeConnectionsMap(node);
	reconnectNodeFromConnectionsMap(node, connectionsMap);
	node._curvesDrawn = true;
};

function redrawNodeCurves(node) {
	const curves = getNodeCurves(node);
	for (const curve of curves.inputs)
		redrawCurve(curve);
		
	for (const curve of curves.outputs)
		redrawCurve(curve);
};

function getNodeCurves(node) {
	if (!node)
		return null;
	
	const curves = {inputs: [], outputs: [], mainOutput: null, secondaryOutputs: []};
	const connectedConnections = getNodeConnectedConnections(node);
	
	for (const connection of connectedConnections.inputs) {
		const connectionCurves = getConnectionCurves(connection);			
		curves.inputs = curves.inputs.concat(connectionCurves);
	}
	
	for (const connection of connectedConnections.outputs) {
		let curve = getConnectionCurves(connection)[0];		
		curves.outputs.push(curve);
		
		if (connection.parentElement.id === "main-exec-output")
			curves.mainOutput = curve;
		else 
			curves.secondaryOutputs.push(curve);
	}
	
	return curves;
};

function getConnectionCurves(connection) {
	if (!connection)
		return null;
	
	const nodeId = connection.nodeId;
	console.log(nodeId);
	const connectionType = getConnectionType(connection);
	const connectionId = connection.connectionId;
	
	if (connectionType === "inputConnection")
		return Array.from(document.querySelectorAll(`path[data-rightNodeId="${nodeId}"][data-rightConnectionId="${connectionId}"]`));
	else {
		const curve = document.querySelector(`path[data-leftNodeId="${nodeId}"][data-leftConnectionId="${connectionId}"]`);
		if (curve)
			return [curve];
		else 
			return [];
	}
};

function getAllCurves() {
	return getGraphSVG().children || [];
};

function getCurveById(nodeId, connectionId, dir) {
	if (dir === "left")
		return document.querySelector(`#graphSVG #curve[data-leftNodeId="${nodeId}"][data-leftConnectionId="${connectionId}"]`);
	else
		return document.querySelector(`#graphSVG #curve[data-rightNodeId="${nodeId}"][data-rightConnectionId="${connectionId}"]`);
};

function setCurveConnectionId(curve, id, dir) {
	if (!curve)
		return;
	
	if (dir === "left") {
		curve.setAttribute("data-leftConnectionId", id);
		curve.leftConnectionId = id;
	} else {
		curve.setAttribute("data-rightConnectionId", id);
		curve.rightConnectionId = id;
	}
};

function getCurveLeftNodeId(curve) {
	if (!curve)
		return null;
	
	return curve.leftNodeId;
};

function getCurveLeftNode(curve) {
	if (!curve)
		return null;
	
	const leftNodeId = getCurveLeftNodeId(curve)
	return getNodeById(leftNodeId);
};

function getCurveRightNodeId(curve) {
	if (!curve)
		return null;
	
	return curve.rightNodeId;
};

function getCurveRightNode(curve) {
	if (!curve)
		return null;
	
	const rightNodeId = getCurveRightNodeId(curve);
	return getNodeById(rightNodeId);
};

function getCurveLeftConnection(curve) {
	if (!curve)
		return null;
	
	const leftNodeId = curve.leftNodeId;
	const node = getNodeById(leftNodeId);
	
	if (!node)
		return null;
	
	const leftConnectionId = curve.leftConnectionId;
	return getNodeConnectionsById(node, leftConnectionId).output;
};

function getCurveRightConnection(curve) {
	if (!curve)
		return null;
	
	const rightNodeId = curve.rightNodeId;
	const node = getNodeById(rightNodeId);
	
	if (!node)
		return null;
	
	const rightConnectionId = curve.rightConnectionId;
	return getNodeConnectionsById(node, rightConnectionId).input;
};

function getCurveFromPosition(curve) {
	if (!curve)
		return [0, 0];
	
	return curve.from;
};

function getCurveToPosition(curve) {
	if (!curve)
		return [0, 0];
	
	return curve.to;
};

function getCurveWidth(curve) {
	if (!curve)
		return 0;
	
	return Math.abs(curve.from[0] - curve.to[0]);
};

function getCurveHeight(curve) {
	if (!curve)
		return 0;
	
	return Math.abs(curve.from[1] - curve.to[1]);
};

function getCurveBounds(curve) {
	if (!curve)
		return [0, 0, 0, 0];

	const x = Math.min(curve.from[0], curve.to[0]);
	const y = Math.min(curve.from[1], curve.to[1]);
	const width = Math.abs(curve.from[0] - curve.to[0]);
	const height = Math.abs(curve.from[1] - curve.to[1]);

	return [x, y, width, height];
};