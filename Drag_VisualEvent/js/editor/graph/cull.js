window._graphEditorCullMoveTreshold = 750;
function startCullingGraphNodes() {
	window._graphEditorMovedDist = 0;
	// disableCullingGraphNodes();
	// return;
	
	// console.warn("culling");
	const graphRect = graphEditor.getBoundingClientRect();
	
	const treshold = window._graphEditorCullMoveTreshold;
	const [lGraphEditor, tGraphEditor] = getGraphCoordinatesFromAbsolute(0 - treshold, 0 - treshold);
	const [rGraphEditor, bGraphEditor] = getGraphCoordinatesFromAbsolute(graphRect.width + treshold, graphRect.height + treshold);
	
	requestCullingNodes(0, lGraphEditor, rGraphEditor, tGraphEditor, bGraphEditor);
};

function requestCullingNodes(nodeId, left, right, top, bottom) {
	if (window._cullTimeout)
		clearTimeout(window._cullTimeout);
	
	window._cullTimeout = setTimeout(() => {
		handleCullingNode(nodeId, left, right, top, bottom);
	}, 1);
};

function handleCullingNode(nodeId = 0, left, right, top, bottom) {
	window._cullTimeout = null;

	const node = getNodeById(nodeId);
	if (!node)
		return onCullingNodesEnd();
	
	const [xNode, yNode] = getNodePosition(node);	
	const wNode = parseInt(node.getAttribute('data-width'));
	const hNode = parseInt(node.getAttribute('data-height'));
	
	//hide node outside of graph editor 
	if ((xNode > right) || (xNode + wNode < left) || (yNode + hNode < top) || (yNode > bottom))
		cullGraphNode(node);
	else 
		uncullGraphNode(node);
	
	requestCullingNodes(++nodeId, left, right, top, bottom);
};

function onCullingNodesEnd() {
	// console.warn("end cull");
	//unhide nodes connected to visible nodes
	// for (const node of document.querySelectorAll('#graphNode:not(.culled-node)')) {
		// const connectedNodes = getNodeConnectedNodes(node);
		// for (const connectedNode of connectedNodes.inputs.concat(connectedNodes.outputs))
			// uncullGraphNode(connectedNode);
	// }
};

function cullGraphNode(node) {
	node.classList.add('culled-node');
	node.setAttribute('data-unculled-resize', false);
};

function uncullGraphNode(node) {
	node.classList.remove('culled-node');
	node.setAttribute('data-unculled-resize', true);
};

function enableCullingGraphNodes() {
	document.querySelector('#graphNodes').setAttribute('data-culling-nodes-enabled', "true");
};

function disableCullingGraphNodes() {
	document.querySelector('#graphNodes').setAttribute('data-culling-nodes-enabled', "false");
};

function isCullingGraphNodesEnabled() {
	return document.querySelector('#graphNodes').getAttribute('data-culling-nodes-enabled') === "true";
};