window._graphEditorCullMoveTreshold = 100;

//nodes
function refreshAllNodesCull() {
	window._graphEditorMovedDist = 0;
	
	for (const nodeData of window.nodes) {
		if (!nodeData)
			continue;
		
		const node = nodeData.node;
		if (!node)
			continue; 
		
		refreshNodeCull(node);
	}
};

function refreshNodeCull(node) {
	if (!node)
		return; 
	
	const nodePosition = getNodePosition(node);
	if (isInGraphBounds(nodePosition[0], nodePosition[1], node.width || 0, node.height || 0, 200))
		uncullGraphNode(node);
	else 
		cullGraphNode(node);
};

function cullGraphNode(node) {
	if (isNodeCulled(node))
		return;
	
	node._preventResize = false;
	node.classList.add('culled-node');
	node.isCulled = true;
	
	// if (node._curvesDrawn)
		redrawNodeCurves(node);
};

function uncullGraphNode(node) {
	if (!isNodeCulled(node))
		return;
	
	node._preventResize = true;
	node.classList.remove('culled-node');
	node.isCulled = false;
	
	// if (node._curvesDrawn)
		redrawNodeCurves(node);
	// else
		// drawNodeCurves(node);
};

function enableCullingGraphNodes() {
	getNodesGraph().setAttribute('data-culling-nodes-enabled', "true");
	window._nodeCullingEnabled = true;
};

function disableCullingGraphNodes() {
	getNodesGraph().setAttribute('data-culling-nodes-enabled', "false");
	window._nodeCullingEnabled = false;
};

function isCullingGraphNodesEnabled() {
	return window._nodeCullingEnabled === true;
};

function isNodeCulled(node) {
	return node && node.isCulled === true;
};

function getCulledNodeOutputAnchor(node) {
	const [x, y] = getNodePosition(node);
	return graphToScreen(x + node.width, y + node.height / 2);
};

function getCulledNodeInputAnchor(node) {
	const [x, y] = getNodePosition(node);
	return graphToScreen(x, y + node.height / 2);
};

//curves
function refreshAllCurvesCull() {
	window._graphEditorMovedDist = 0;
	
	for (const curve of getGraphSVG().children) {
		if (!curve)
			continue;
		
		refreshCurveCull(curve);
	}
};

function refreshCurveCull(curve) {
	if (!curve)
		return; 
	
	const [x, y, width, height] = getCurveBounds(curve);
	if (isInGraphBounds(x, y, width, height, 200))
		uncullCurve(curve);
	else 
		cullCurve(curve);
};

function cullCurve(curve) {
	if (isCurveCulled(curve))
		return;
	
	curve.classList.add('culled-curve');
	curve.isCulled = true;
};

function uncullCurve(curve) {
	if (!isCurveCulled(curve))
		return;
	
	curve.classList.remove('culled-curve');
	curve.isCulled = false;
};

function enableCullingGraphCurves() {
	getGraphSVG().setAttribute('data-culling-curves-enabled', "true");
	window._curveCullingEnabled = true;
};

function disableCullingGraphCurves() {
	getGraphSVG().setAttribute('data-culling-curves-enabled', "false");
	window._curveCullingEnabled = false;
};

function isCurveCulled(curve) {
	return curve.isCulled === true;
};