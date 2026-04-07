//-------------------------------------------------------------------------------------------------------
// GRAPH CURVES

// function drawCurve(from, to, curve, frag = null) { version for #graphNodes & #graphSVG using position absolute and top,left for movement
	// if (!from || !to)
		// return;
	
	// const [xGraph, yGraph] = getGraphPosition();
	// const scale = getGraphEditorScale();
	// const scaleMult = 100 / (scale * 100);
	
	// const graphSVGLeft = window.innerWidth * (1 - scale) / 2 + xGraph * scale;
	// const graphSVGTop = window.innerHeight * (1 - scale) / 2 + yGraph * scale;
	
	// const fromBoundingRect = !Array.isArray(from) ? from.getBoundingClientRect() : null;
	// const toBoundingRect = !Array.isArray(to) ? to.getBoundingClientRect() : null;
	
	// const basefromx = fromBoundingRect ? fromBoundingRect.left + (fromBoundingRect.width / 2) : from[0];
	// const fromx = (basefromx - graphSVGLeft) * scaleMult;
	// const basefromy = fromBoundingRect ? fromBoundingRect.top + (fromBoundingRect.height / 2) : from[1];
	// const fromy = (basefromy - graphSVGTop) * scaleMult;

	// const basetox = toBoundingRect ? toBoundingRect.left + (toBoundingRect.width / 2) : to[0];
	// const tox = (basetox - graphSVGLeft) * scaleMult;
	// const basetoy = toBoundingRect ? toBoundingRect.top + (toBoundingRect.height / 2) : to[1];
	// const toy = (basetoy - graphSVGTop) * scaleMult;

	// if (!curve)
		// curve = createCurve(from, to, frag ? frag : null);
	
	// const curveData = `M ${fromx},${fromy} ${makeCubicBezierCurve(fromx + 20, fromy, tox, toy)}`;
	// curve.setAttribute('data-coords', `${fromx},${fromy},${tox},${toy}`);
	
	// curve.setAttributeNS(null, "d", curveData);
// };

function drawCurve(from, to, curve, frag = null) { //version with graph camera and transform translate3d
	if (!from || !to)
		return;

	const scale = getGraphEditorScale();
	const [cameraX, cameraY] = getGraphPosition();

	const fromRect = !Array.isArray(from) ? from.getBoundingClientRect() : null;
	const toRect = !Array.isArray(to) ? to.getBoundingClientRect() : null;

	const screenFromX = fromRect ? fromRect.left + fromRect.width / 2 : from[0];
	const screenFromY = fromRect ? fromRect.top + fromRect.height / 2 : from[1];

	const screenToX = toRect ? toRect.left + toRect.width / 2 : to[0];
	const screenToY = toRect ? toRect.top + toRect.height / 2 : to[1];

	// convert screen → graph coordinates
	const fromx = (screenFromX - cameraX) / scale;
	const fromy = (screenFromY - cameraY) / scale;

	const tox = (screenToX - cameraX) / scale;
	const toy = (screenToY - cameraY) / scale;

	if (!curve)
		curve = createCurve(from, to, frag ? frag : null);

	const curveData = `M ${fromx},${fromy} ${makeCubicBezierCurve(fromx + 20, fromy, tox, toy)}`;

	curve.setAttribute('data-coords', `${fromx},${fromy},${tox},${toy}`);
	curve.setAttributeNS(null, "d", curveData);
}

function makeCubicBezierCurve(fromx, fromy, tox, toy) {
	//https://codepen.io/explosion/pen/YGrpwd
	// mid-point of line:
	// const mpx = (tox + fromx) * 0.5;
	// const mpy = (toy + fromy) * 0.5;
	
	// const q1x = (fromx + mpx) * 0.5;
	// const q1y = (fromy + mpy) * 0.5;
	
	// const q3x = (mpx + tox) * 0.5;
	// const q3y = (mpy + toy) * 0.5;
	
	// const dx = Math.abs(fromx - tox);
	// const dy = Math.abs(fromy - toy);
	
	// const xOfsset = Math.max(0, 50 - (dx + dy) / 5); //Math.min(50, (dx + dy) / 10);
	
	// if (fromx > tox)
		// [fromx, tox] = [tox, fromx];
	// const xOffset = fromx > tox ? fromx - tox : tox - fromx < 80 ? 50 : 0;				
	// return `C ${Math.max(q3x, fromx + (dx / 2)) + xOfsset},${q1y} ${Math.min(q1x, tox - (dx / 2)) - xOfsset},${q3y} ${tox},${toy}`;
	
	// const coef = dx + 20;
	// return `C ${tox + coef},${fromy} ${fromx - coef},${toy} ${tox},${toy}`;
	
	// const xOffset = (fromx > tox ? Math.max(fromx - tox, 200) : tox - fromx < 120 ? 80 : 0) + Math.abs(fromy - toy) / 5;
	// return `C ${Math.max(tox, fromx) + xOffset},${fromy} ${Math.min(tox, fromx) - xOffset},${toy} ${tox},${toy}`;
	
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
	
	const coords = curve.getAttribute('data-coords').split(',').map(Number);
	const fromx = coords[0] + leftOffset[0];
	const fromy = coords[1] + leftOffset[1];
	const tox = coords[2] + rightOffset[0];
	const toy = coords[3] + rightOffset[1];
	curve.setAttribute('data-coords', `${fromx},${fromy},${tox},${toy}`);
	
	const curveData = `M ${fromx},${fromy} ${makeCubicBezierCurve(fromx + 20, fromy, tox, toy)}`; 
	curve.setAttributeNS(null, "d", curveData);
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
	// curve.addEventListener('mousedown', onCurveMouseDown);
	
	connectCurve(from, to, curve, false);
	
	container.appendChild(curve);
	
	return curve;
};

function connectCurve(from, to, curve, disconnect = true) {
	if (!curve)
		return drawCurve(from, to);
	
	if (disconnect)
		disconnectCurve(curve);
	
	if (from)
		setConnectionConnected(from, true);
	
	if (to)
		setConnectionConnected(to, true);
	
	if (to && to.getAttribute("data-curveColor"))
		curve.style.stroke = to.getAttribute("data-curveColor");
	
	if (from && from.getAttribute("data-curveColor"))
		curve.style.stroke = from.getAttribute("data-curveColor");
	
	// if (from && !from.classList.contains('exec'))
		// curve.style.stroke = "cornflowerblue";
	
	// if (from && from.classList.contains('boolean'))
		// curve.style.stroke = "darkred";
	
	curve.setAttribute('data-leftNodeId', from ? from.getAttribute('data-nodeId') : null);
	curve.setAttribute('data-leftConnectionId', from ? from.getAttribute('data-connectionId') : null);
	
	curve.setAttribute('data-rightNodeId', to ? to.getAttribute('data-nodeId') : null);
	curve.setAttribute('data-rightConnectionId', to ? to.getAttribute('data-connectionId') : null); 
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
};

function removeCurve(curve, cache = true) {
	if (!curve)
		return;
	
	disconnectCurve(curve);
	curve.remove();
	
	if (cache) {
		setAsUnsaved(window.data.targetType, window.data.targetId, window.data.mapTargetId, window.data.pageId || 0);
		
		const leftNodeId = parseInt(curve.getAttribute('data-leftNodeId'));
		if (leftNodeId !== null)
			updateCacheGraphNodeConnectionsMap(getNodeById(leftNodeId));
		const rightNodeId = parseInt(curve.getAttribute('data-rightNodeId'));
		if (rightNodeId !== null)
			updateCacheGraphNodeConnectionsMap(getNodeById(rightNodeId));
	}
};

function onCurveMouseDown(curve, event) {
	if (event.which === 1){
		window._grabbedCurve = curve;
		document.querySelector('#graphEditor').style.cursor = "-webkit-grabbing";
	}
};

function moveCurves(event) {
	if (!window.nodeMouseDown)
		return;
	
	const nodeId = parseInt(window.nodeMouseDown.getAttribute('data-nodeId'));
	for (const input of window.nodeMouseDown.querySelectorAll('.inputConnection')) {
		const inputId = parseInt(input.getAttribute('data-connectionId'));
		for (const curve of document.querySelectorAll(`path[data-rightNodeId="${nodeId}"][data-rightConnectionId="${inputId}"]`)) {
			const fromId = parseInt(curve.getAttribute('data-leftNodeId'));
			const outputId = parseInt(curve.getAttribute('data-leftConnectionId'));
			const output = document.querySelector(`#graphNode[data-nodeId="${fromId}"] .outputConnection[data-connectionId="${outputId}"]`);
			
			drawCurve(output, input, curve);
		}
	}
	for (const output of window.nodeMouseDown.querySelectorAll('.outputConnection')) {
		const outputId = parseInt(output.getAttribute('data-connectionId'));
		for (const curve of document.querySelectorAll(`path[data-leftNodeId="${nodeId}"][data-leftConnectionId="${outputId}"]`)) {
			const toId = parseInt(curve.getAttribute('data-rightNodeId'));
			const inputId = parseInt(curve.getAttribute('data-rightConnectionId'));
			const input = document.querySelector(`#graphNode[data-nodeId="${toId}"] .inputConnection[data-connectionId="${inputId}"]`);
			
			drawCurve(output, input, curve);
		}
	}
};

function redrawAllCurves() {
	// disableCullingGraphNodes();
	if (window._redrawAllCurvesInterval)
		clearInterval(window._redrawAllCurvesInterval);
	
	const curves = Array.from(getAllCurves());
	window._redrawAllCurvesInterval = setInterval(() => {
		if (curves.length > 0) {
			const curve = curves.shift();
			redrawCurve(curve);
		}
		else
			clearInterval(window._redrawAllCurvesInterval);
	}, 1);
	// for (const curve of curves)
		// setTimeout(() => redrawCurve(curve), 1);
	// enableCullingGraphNodes();
};

function redrawCurve(curve) {
	if (!curve)
		return;
	
	const toId = parseInt(curve.getAttribute('data-rightNodeId'));
	const inputId = parseInt(curve.getAttribute('data-rightConnectionId'));
	const fromId = parseInt(curve.getAttribute('data-leftNodeId'));
	const outputId = parseInt(curve.getAttribute('data-leftConnectionId'));
	
	if (isCullingGraphNodesEnabled()) {
		const input = document.querySelector(`#graphNode[data-nodeId="${toId}"]:not(.culled-node) .inputConnection[data-connectionId="${inputId}"]`);
		const output = document.querySelector(`#graphNode[data-nodeId="${fromId}"]:not(.culled-node) .outputConnection[data-connectionId="${outputId}"]`)
		
		if (!input || !output)
			return;
		
		drawCurve(output, input, curve);
	} else {
		const input = document.querySelector(`#graphNode[data-nodeId="${toId}"] .inputConnection[data-connectionId="${inputId}"]`);
		const output = document.querySelector(`#graphNode[data-nodeId="${fromId}"] .outputConnection[data-connectionId="${outputId}"]`)
		
		if (!input || !output)
			return;
		
		drawCurve(output, input, curve);
	}
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
	for (const connection of connectedConnections.inputs)
		curves.inputs = curves.inputs.concat(getConnectionCurves(connection));
	
	for (const connection of connectedConnections.outputs) {
		const curve = getConnectionCurves(connection)[0];
		curves.outputs.push(curve);
		if (connection.parentElement.id === "main-exec-output")
			curves.mainOutput = curve;
		else 
			curves.secondaryOutputs.push(curve);
	}
	
	return curves;
};

function getAllCurves() {
	return document.querySelectorAll(`path`);
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
	
	if (dir === "left")
		curve.setAttribute("data-leftConnectionId", id);
	else
		curve.setAttribute("data-rightConnectionId", id);
};

function connectPendingCurve(node) {
	const pendingCurve = document.querySelector('#graphSVG #curve[data-_pending="true"');
	if (!pendingCurve)
		return;
	
	const leftNodeId = pendingCurve.getAttribute('data-leftNodeId');
	const rightNodeId = pendingCurve.getAttribute('data-rightNodeId');
	
	if (rightNodeId === "null" && leftNodeId === "null")
		return;
	
	if (rightNodeId === "null" || leftNodeId === "null") {
		let outputConnection;
		let inputConnection;
		let connectedNode;
		
		if (rightNodeId === "null") { //connect to node input
			outputConnection = getCurveLeftConnection(pendingCurve);
			inputConnection = getNodeConnections(node).inputs[0];
			connectedNode = getConnectionNode(outputConnection);
		} else if (leftNodeId === "null") { //connect to node output
			outputConnection = getNodeConnections(node).outputs[0];
			inputConnection = getCurveRightConnection(pendingCurve);
			connectedNode = getConnectionNode(inputConnection);
		} 
	
		if (outputConnection && inputConnection) {
			connectCurve(outputConnection, inputConnection, pendingCurve);
			pendingCurve.removeAttribute('data-_pending');
			pendingCurve.removeAttribute('data-_temp');
			
			updateCacheGraphNodeConnectionsMap(node);
			if (connectedNode)
				updateCacheGraphNodeConnectionsMap(connectedNode);
		}
	} else { //insert between two nodes
		const leftNode = getNodeById(parseInt(leftNodeId));
		const rightNode = getNodeById(parseInt(rightNodeId));
		
		connectCurve(getNodeConnections(leftNode).outputs[0], getNodeConnections(node).inputs[0], pendingCurve);
		pendingCurve.removeAttribute('data-_pending');
		pendingCurve.removeAttribute('data-_temp');
			
		drawCurve(getNodeConnections(node).outputs[0], getNodeConnections(rightNode).inputs[0])
		
		updateCacheGraphNodeConnectionsMap(node);
		updateCacheGraphNodeConnectionsMap(leftNode);
		updateCacheGraphNodeConnectionsMap(rightNode);
	}
};