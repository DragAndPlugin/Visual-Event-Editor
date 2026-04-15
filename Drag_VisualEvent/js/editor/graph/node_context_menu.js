function showNodeContextMenu(e) {
	const target = e.path.find(elem => elem.id === "graphNode");
	if (!target)
		return;
	
	if (!getSelectedNodes().includes(target))
		unselectAllNodes();
	selectNode(target);
	
	const nodeContextMenu = document.querySelector("#node-contextmenu");
	nodeContextMenu.classList.remove("hidden");
	const nodeContextMenuRect = nodeContextMenu.getBoundingClientRect();
	
	const nodeContextMenuUndo = nodeContextMenu.querySelector('#node-contextmenu-undo');
	if (undoHistoryIsEmpty())
		nodeContextMenuUndo.classList.add('disabled');
	else
		nodeContextMenuUndo.classList.remove('disabled');
	
	const nodeContextMenuRedo = nodeContextMenu.querySelector('#node-contextmenu-redo');
	if (redoHistoryIsEmpty())
		nodeContextMenuRedo.classList.add('disabled');
	else
		nodeContextMenuRedo.classList.remove('disabled');
	
	const graphEditorRect = document.querySelector('#graphEditor').getBoundingClientRect();
	const bottomPanelRect = document.querySelector('#bottom-panel').getBoundingClientRect();
	const nodeContextMenux = e.x + nodeContextMenuRect.width > graphEditorRect.right ? e.x - graphEditorRect.x - (e.x + nodeContextMenuRect.width - graphEditorRect.right) : e.x - graphEditorRect.x;
	const nodeContextMenuy = e.y + nodeContextMenuRect.height > bottomPanelRect.top ? e.y - graphEditorRect.y - (e.y + nodeContextMenuRect.height - bottomPanelRect.top) : e.y - graphEditorRect.y;
	nodeContextMenu.style.left = `${nodeContextMenux}px`;
	nodeContextMenu.style.top = `${nodeContextMenuy}px`;
	
	nodeContextMenu.setAttribute('data-nodeId', target.getAttribute('data-nodeId'));
	window._nodeContextMenuDisplayed = true;
};

function closeNodeContextMenu() {
	const nodeContextMenu = document.querySelector("#node-contextmenu");
	nodeContextMenu.classList.add('hidden');
	
	window._nodeContextMenuDisplayed = false;
};

function copyNodes() {
	window._nodeClipboard = {nodes: [], connections: [], positions: []};
	const selectedNodes = getSelectedNodes().filter(node => !node.classList.contains('uncopyable'));
	
	for (const [nodeIndex, node] of selectedNodes.entries()) {
		window._nodeClipboard.nodes.push(node.cloneNode(true));
		
		const connections = getNodeConnections(node);					
		window._nodeClipboard.connections[nodeIndex] = [];
		for (const [outputIndex, outputConnection] of connections.outputs.entries()) {
			if (isConnectionConnected(outputConnection)) {
				const connectedNode = getConnectionConnectedNodes(outputConnection)[0];
				const index = selectedNodes.indexOf(connectedNode)
				window._nodeClipboard.connections[nodeIndex].push(index);
			} else
				window._nodeClipboard.connections[nodeIndex].push(-1);
		}
		
		window._nodeClipboard.positions.push(getNodePosition(node));
	}
	
	closeNodeContextMenu();
	closeNodeListMenu();
};

function cutNodes() {
	copyNodes();
	deleteSelectedNodes(true);
};			

function pasteNodes(useNodeListPosition = false) {
	if (!window._nodeClipboard || !window._nodeClipboard.nodes || !window._nodeClipboard.connections || !window._nodeClipboard.positions)
		return;
	
	unselectAllNodes();
	
	const graphNodesContainer = document.querySelector('#graphEditor #graphNodes');
	const nodeList = document.querySelector("#nodeList");
	const graphEditorRect = document.querySelector('#graphEditor').getBoundingClientRect();
	
	const cursorPosition = getCursorPosition();
	const x = useNodeListPosition ? window._nodeListx : cursorPosition[0]; //graphEditorRect.width / 2 - graphEditorRect.x;
	const y = useNodeListPosition ? window._nodeListy : cursorPosition[1]; //graphEditorRect.height / 2 - graphEditorRect.y - document.querySelector('#bottom-panel').getBoundingClientRect().height;
	let [graphx, graphy] = getGraphCoordinatesFromAbsolute(x, y);
	// graphx = parseInt(graphx / nodeSnap.x) * nodeSnap.x;
	// graphy = parseInt(graphy / nodeSnap.y) * nodeSnap.y;
	
	const firstNodePosition = window._nodeClipboard.positions[0];
	const clones = [];
	for (const [nodeIndex, node] of window._nodeClipboard.nodes.entries()) {
		//clone and add node
		const clone = node.cloneNode(true);
		clones.push(clone);
		clone.removeAttribute('data-nodeId');
		addNodeToGraphNode(clone);
		
		//place copied node
		const oldPosition = window._nodeClipboard.positions[nodeIndex];
		if (nodeIndex === 0)
			setNodePosition(clone, graphx, graphy);
		else 
			setNodePosition(clone, graphx + (oldPosition[0] - firstNodePosition[0]), graphy + (oldPosition[1] - firstNodePosition[1]));
		setNodeOffset(clone, 0, 0);
		
		//reset all connections
		const nodeId = getNodeId(clone);
		const connections = getNodeConnections(clone);
		for (const connection of connections.inputs) {
			setConnectionConnected(connection, false);
			connection.setAttribute('data-nodeId', nodeId);
		}
		for (const connection of connections.outputs) {
			setConnectionConnected(connection, false);
			connection.setAttribute('data-nodeId', nodeId);
		}
		
		selectNode(clone);
		closeNodeListMenu();
	}
	
	//rebuild all connections and curves and copy cache
	const eventCache = getEventCache();
	for (const [nodeIndex, node] of clones.entries()) {
		for (const [connectionTargetIndex, connectionTarget] of window._nodeClipboard.connections[nodeIndex].entries()) {
			const connection = getNodeConnectionsById(node, connectionTargetIndex);
			if (connectionTarget !== -1) {
				const targetNode = clones[connectionTarget];
				const targetConnection = getNodeConnectionsById(targetNode, 0).input;
				drawCurve(connection.output, targetConnection);
			}
		}
		
		const nodeCache = $.Drag.VisualEvent.deepCopyJSON(getGraphNodeFromCache(window._nodeClipboard.nodes[nodeIndex]));
		nodeCache.nodeId = getNodeId(node);
		nodeCache.x = getNodePosition(node)[0];
		nodeCache.y = getNodePosition(node)[1];
		nodeCache.connectionsMap = getNodeConnectionsMap(node); //connections maps seems to not be calculated correctly sometimes, to fix
		eventCache.nodes[nodeCache.nodeId] = nodeCache;
	}
	
	//history
	if (clones.length > 0)
		addToUndoHistory({type: "addNode", target: clones, connectionsMap: clones.map(node => getNodeConnectionsMap(node))});
	
	
	//cache
	setAsUnsaved(window.data.targetType, window.data.targetId, window.data.mapTargetId, window.data.pageId || 0);
	// for (const node of clones)
		// cacheGraphNode(node);
	
	closeNodeListMenu();
};

function restoreNodesDefaultValues(nodes = null) {
	if (!nodes)
		nodes = getSelectedNodes();
	
	for (const node of nodes)
		for (const input of node.querySelectorAll('*[data-iscommandparameter]'))
			$.Drag.VisualEvent.restoreInputDefaultValue(input);
	
	closeNodeContextMenu();
};