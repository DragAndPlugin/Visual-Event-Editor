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
	window._nodeClipboard = {
		nodes: [],
		connections: [],
		positions: [],
		caches: []
	};
	
	const selectedNodes = getSelectedNodes().filter(node => !node.classList.contains('uncopyable'));
	for (const [nodeIndex, node] of selectedNodes.entries()) {
		const clonedNode = cloneNode(node, true);
		window._nodeClipboard.nodes.push(clonedNode);
		
		const connections = getNodeConnections(node);
		window._nodeClipboard.connections[nodeIndex] = [];
		
		for (const outputConnection of connections.outputs) {
			let copiedConnection = null;
			if (isConnectionConnected(outputConnection)) {
				const connectedConnections = getConnectionConnectedConnections(outputConnection);
				for (const connectedConnection of connectedConnections) {
					const connectedNode = getConnectionNode(connectedConnection);
					const targetNodeIndex = selectedNodes.indexOf(connectedNode);
					
					if (targetNodeIndex !== -1) {
						copiedConnection = {
							nodeIndex: targetNodeIndex,
							connectionId: getConnectionId(connectedConnection)
						};
						
						break;
					}
				}
			}
			
			window._nodeClipboard.connections[nodeIndex].push(copiedConnection);
		}
		
		window._nodeClipboard.positions.push(getNodePosition(node));
		window._nodeClipboard.caches.push($.Drag.VisualEvent.deepCopyJSON(getGraphNodeFromCache(node)));
	}
	
	closeNodeContextMenu();
	closeNodeListMenu();
};

function cutNodes() {
	copyNodes();
	deleteSelectedNodes(true);
};			

function pasteNodes(useNodeListPosition = false) {
	if (!window._nodeClipboard || !Array.isArray(window._nodeClipboard.nodes) || !Array.isArray(window._nodeClipboard.connections) || !Array.isArray(window._nodeClipboard.positions) || window._nodeClipboard.nodes.length === 0)
		return;
	
	unselectAllNodes();
	
	const cursorPosition = getCursorPosition();
	const x = useNodeListPosition ? window._nodeListx : cursorPosition[0];
	const y = useNodeListPosition ? window._nodeListy : cursorPosition[1];
	const [graphx, graphy] = getGraphCoordinatesFromAbsolute(x, y);
	const firstNodePosition = window._nodeClipboard.positions[0];
	
	const clones = [];
	for (const [nodeIndex, clipboardNode] of
		window._nodeClipboard.nodes.entries()) {
		
		const clone = cloneNode(clipboardNode);
		clone.data.context = $.Drag.VisualEvent.deepCopyJSON(getEventContext());
		
		clones.push(clone);
		
		addNodeToGraphNode(clone);
		
		const oldPosition = window._nodeClipboard.positions[nodeIndex];
		if (nodeIndex === 0)
			setNodePosition(clone, graphx, graphy);
		else
			setNodePosition(clone, graphx + (oldPosition[0] - firstNodePosition[0]), graphy + (oldPosition[1] - firstNodePosition[1]));
		
		setNodeOffset(clone, 0, 0);
		
		const connections = getNodeConnections(clone);
		for (const connection of connections.inputs) {
			connection.connectedConnections = [];
			setConnectionConnected(connection, false);
		}
		
		for (const connection of connections.outputs) {
			connection.connectedConnections = [];
			setConnectionConnected(connection, false);
		}
		
		selectNode(clone);
	}

	for (const [sourceNodeIndex, sourceNode] of
		clones.entries()) {
		
		const copiedConnections = window._nodeClipboard.connections[sourceNodeIndex] || [];
		for (const [outputConnectionId, targetData] of copiedConnections.entries()) {
			if (!targetData)
				continue;
			
			const targetNode = clones[targetData.nodeIndex];
			if (!targetNode)
				continue;
			
			const sourceConnection = getNodeConnectionsById(sourceNode, outputConnectionId).output;
			const targetConnection = getNodeConnectionsById(targetNode, targetData.connectionId).input;
			if (!sourceConnection || !targetConnection)
				continue;
			
			connectConnections(sourceConnection, targetConnection);
		}
	}
	
	const eventCache = getEventCache();
	for (const [nodeIndex, node] of clones.entries()) {
		const nodeId = getNodeId(node);
		const nodePosition = getNodePosition(node);
		
		let nodeCache = getGraphNodeFromCache(node);
		if (!nodeCache)
			nodeCache = {};
		
		nodeCache.nodeId = nodeId;
		nodeCache.x = nodePosition[0];
		nodeCache.y = nodePosition[1];
		nodeCache.connectionsMap =getNodeConnectionsMap(node);
		
		const copiedCache = window._nodeClipboard.caches[nodeIndex] || {};
		for (const key of Object.keys(copiedCache)) {
			if (["nodeId", "x", "y", "connectionsMap"].includes(key))
				continue;
			
			nodeCache[key] = $.Drag.VisualEvent.deepCopyJSON(copiedCache[key]);
		}
		
		eventCache.nodes[nodeId] = nodeCache;
		refreshNodeCull(node);
	}
	
	if (clones.length > 0) {
		addToUndoHistory({
			type: "addNode",
			target: clones,
			cache: clones.map(node => $.Drag.VisualEvent.deepCopyJSON(getGraphNodeFromCache(node))),
			connectionsMap: clones.map(node => $.Drag.VisualEvent.deepCopyJSON(getNodeConnectionsMap(node)))
		});
	}

	setAsUnsaved(window.data.targetType, window.data.targetId, window.data.mapTargetId, window.data.pageId || 0);
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