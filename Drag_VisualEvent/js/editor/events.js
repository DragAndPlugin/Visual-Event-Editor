const nodeResizeObserver = new ResizeObserver((entries) => {
	if (!Array.isArray(entries) || !entries.length)
		return;
	
	for (const entry of entries) {
		const node = entry.target;
		
		//prevent size calc if node culled
		// if (node.classList.contains('culled-node'))
			// return;
		
		//prevent size calc if node just got unculled
		// if (node.getAttribute('data-unculled-resize') === "true")
			// return node.setAttribute('data-unculled-resize', false);
		
		const nodeRect = node.getBoundingClientRect();
		const wNode = node.getAttribute('data-width');
		const hNode = node.getAttribute('data-height');
		
		if (wNode !== nodeRect.width || hNode !== nodeRect.height)
			onNodeResize(node, nodeRect)
	}
});

function onNodeResize(node, nodeRect) {
	if (!node)
		return;
	
	if (!nodeRect)
		nodeRect = node.getBoundingClientRect();
	
	node.setAttribute('data-width', nodeRect.width);
	node.setAttribute('data-height', nodeRect.height);
	redrawNodeCurves(node);
};

function setupGraphEditorListeners() {
	nodeResizeObserver.disconnect();
	
	const graphSVG = document.querySelector('#graphSVG');
	const graphEditor = document.querySelector('#graphEditor');
	graphEditor.addEventListener("mousedown", (event) => {				
		if (window._nodeListDisplayed) {
			if (!event.path.includes(document.querySelector('#nodeList')))
				closeNodeListMenu();
		}
			
		if (window._nodeContextMenuDisplayed) {
			if (!event.path.includes(document.querySelector('#node-contextmenu')))
				closeNodeContextMenu();
		}
			
		// if (!(isFormInput(event.target) || isConnection(event.target) || isButton(event.target)) && (event.target.getAttribute('id') === 'graphEditor' || event.path.includes(graphEditor))) {
		if (event.target.getAttribute('id') === 'graphEditor' || event.target.getAttribute('id') === 'curve') {
			window.isMouseDownOnGraph = true;
		
			//right click
			if (event.which === 3) {				
				graphEditor.setAttribute('data-mousex', event.x);
				graphEditor.setAttribute('data-mousey', event.y);
			}
		
			//left click
			if (event.which === 1) {
				if (!window._isCtrlPressed)
					unselectAllNodes(true);
			}
		}
	});
	
	window.addEventListener("mousedown", (event) => {
		if (window._searchOpened && !event.path.map(element => element.id).includes('search-container'))
			unfocusSearch();
	});
	
	window.addEventListener("mouseup", (event) => {		
		if (event.which === 3 && window.isMouseDownOnGraph && !window._graphEditorMoved && window.data.targetType && window.data.targetId)
			showNodeListMenu(event);
		
		if (window._eventPageContextMenuDisplayed && event.which === 1 && !event.path.map(element => element.id).includes('event-page-contextmenu'))
			hideEventPageContextMenu();
		
		if (window._commonEventContextMenuOpened && !event.path.map(element => element.id).includes('common-event-contextmenu'))
			hideCommonEventContextMenu();
		
		if (window._mapEventContextMenuOpened && !event.path.map(element => element.id).includes('map-event-contextmenu'))
			hideMapEventContextMenu();
		
		if (window._troopEventContextMenuOpened && !event.path.map(element => element.id).includes('troop-event-contextmenu'))
			hideTroopEventContextMenu();
		
		if (document.querySelector("#editor-option-menu:not(.hidden)") && !event.path.map(element => element.id).includes('editor-option-menu') && !event.path.map(element => element.id).includes('editor-option-button'))
			toggleEditorOptionsMenu();
		
		//onmouseupnode
		if (event.which === 1 && window.nodeMouseDown) {
			//reset movenode mouse position
			window.nodeMouseDown.removeAttribute('data-mousex');
			window.nodeMouseDown.removeAttribute('data-mousey');
			
			//bake offset in node position
			const nodes = getSelectedNodes();
			for (const node of nodes) {
				const [xNode, yNode] = getNodePosition(node);
				const [xOffset, yOffset] = getNodeOffset(node);
				if (xOffset !== 0 || yOffset !== 0) {
					setNodePosition(node, xNode + xOffset, yNode + yOffset, true);
					setNodeOffset(node, 0, 0);
					setAsUnsaved(window.data.targetType, window.data.targetId, window.data.mapTargetId, window.data.pageId || 0);
				}
			}
		}
		
		if (window._graphEditorMoved)
			window._graphEditorHasMoved = true;
		window._graphEditorMoved = false;
		
		window.isMouseDownOnGraph = false;
		window.isMouseDownOnNode = false;
		window.nodeMouseDown = null;
		
		if (window.isMouseDownOnConnection || window._grabbedCurve)
			onEndMoveConnection(event)
		
		window.isMouseDownOnConnection = false;
		window.connectionMouseDown = null;
		window.hoverConnection = null;
		window._grabbedCurve = null;
		
		window._xGraphLeftMouseClick = null;
		window._yGraphLeftMouseClick = null;
		clearSelectionBox();
		
		window._isLeftPanelResizing = false;
		window._draggingSearch = false;
		
		document.querySelector('#graphEditor').style.removeProperty('cursor');
	});
	
	window.addEventListener("mousemove", dispatchMouseMovementEvent);
	
	graphEditor.addEventListener("wheel", zoomGraphEditor);
};

function onMouseUpGraphEditorNode(node, event) {};

function onMouseDownGraphEditorNode(node, event) {
	for (const focusedNode of document.querySelectorAll('#graphNode.focused'))
		focusedNode.classList.remove('focused');
	node.classList.add('focused');
	
	if (event.which === 1) {
		if (!isNodeSelected(node) && !window._isCtrlPressed)
			unselectAllNodes(true);
		selectNode(node, true);
		
		if (isConnection(event.target)) {
			window.isMouseDownOnConnection = true;
			window.connectionMouseDown = event.target;
			window.hoverConnection = null;
		} else if (event.target.getAttribute('id') === 'node-header') {
			window.isMouseDownOnNode = true;
			window.nodeMouseDown = node;
			node.setAttribute('data-mousex',  event.x);
			node.setAttribute('data-mousey',  event.y);
		}
	}
};

function onNodeHeaderMouseOver(node, event) {
	if (!node)
		return;
	
	window._mouseOverNode = node;
	window._mouseOverTimeout = setTimeout(() => {
		showNodeTooltip(node, event.x, event.y);
	}, 600);
};

function onNodeHeaderMouseOut(node, event) {
	hideNodeTooltip();
	
	delete window._mouseOverNode;
	
	clearTimeout(window._mouseOverTimeout);
	delete window._mouseOverTimeout;
};

function onNodeHeaderMouseMove(node, event) {
	hideNodeTooltip();
	
	clearTimeout(window._mouseOverTimeout);
	window._mouseOverTimeout = setTimeout(() => {
		showNodeTooltip(node, event.clientX, event.clientY);
	}, 600);
};

function dispatchMouseMovementEvent(event) {
	if (window._isLeftPanelResizing) {
		event.preventDefault();
		event.stopPropagation();
		resizeLeftPanel(event);
		return false;
	}
	
	if (window._draggingSearch) {
		event.preventDefault();
		event.stopPropagation();
		moveSearch(event);
		return false;
	}
	
	if (window.isMouseDownOnGraph) {
		if (event.which === 3)
			moveGraphEditor(event);
		if (event.which === 1)
			if (window._grabbedCurve) {
				window.connectionMouseDown = getCurveRightConnection(window._grabbedCurve);
				moveConnection(event);
			} else
				handleSelectionBox(event);
		event.stopPropagation();
		event.preventDefault();
	} else if (window.isMouseDownOnNode && event.which === 1) {
		moveNode(event);
		event.stopPropagation();
		event.preventDefault();
	} else if (window.isMouseDownOnConnection) {
		event.stopPropagation();
		event.preventDefault();
		moveConnection(event);
	}
	
	window._cursorPosition = [event.x, event.y];
};

function getCursorPosition() {
	return window._cursorPosition || [0, 0];
};

document.addEventListener("DOMContentLoaded", function () {
	document.addEventListener("contextmenu", function (e) {
		if (window._graphEditorHasMoved) {
			window._graphEditorHasMoved = false;
			e.preventDefault();
			return false;
		};
		
		if (e.path.map(element => element.id).includes('node-header')) {
			e.preventDefault();
			showNodeContextMenu(e);
			return false;
		}
		
		if (e.path.map(element => element.id).includes('event-page')) {
			e.preventDefault();
			showEventPageContextMenu(e);
			return false;
		}
		
		if (e.path.map(element => element.id).includes('common-event-container')) {
			e.preventDefault();
			showCommonEventContextMenu(e);
			return false;
		};
		
		if (e.path.map(element => element.id).includes('map-event-container')) {
			e.preventDefault();
			showMapEventContextMenu(e);
			return false;
		};
		
		if (e.path.map(element => element.id).includes('troop-event-container')) {
			e.preventDefault();
			showTroopEventContextMenu(e);
			return false;
		};
		
		const graphEditor = document.querySelector('#graphEditor');
		if (e.path.includes(graphEditor) || window._graphEditorMoved) {
			if (!e.path.find(elem => isFormInput(elem))) {
				e.preventDefault();
				return false;
			}
		}
	});
	
	window.addEventListener("keydown", function(event) {
		if (event.ctrlKey || event.keyCode === 17) // CTRL
			window._isCtrlPressed = true;
		
		if (!isFormInput(document.activeElement)) {
			if (event.keyCode === 46) // SUPPR
				deleteSelectedNodes(true);
				
			else if (event.keyCode === 27) { // ESC
				closeNodeContextMenu();
				closeNodeListMenu();
				hideCommonEventContextMenu();
				hideTroopEventContextMenu();
				hideMapEventContextMenu();
				hideEventPageContextMenu();
				if (window._searchOpened)
					toggleSearch();
			}
				
			else if (window._isCtrlPressed) {
				switch (event.keyCode) {
					case 65: //A
						selectAllNodes();
						event.preventDefault();
						return false;
					case 67: //C
						copyNodes();
						event.preventDefault();
						return false;
					case 86: //V
						pasteNodes();
						event.preventDefault();
						return false;
					case 88: //X
						cutNodes();
						event.preventDefault();	
						return false;
					case 90: //Z
						undoNodes();
						event.preventDefault();
						return false;
					case 89: //Y
						redoNodes();
						event.preventDefault();
						return false;
					case 70: //F
						toggleSearch();
						event.preventDefault();
						return false;
				}
			}
			
			else if (event.keyCode === 70) { // F
				const selectedNodes = getSelectedNodes();
				if (selectedNodes.length > 0)
					focusNode(null, selectedNodes[0]);
			}
			
		} else if (event.keyCode === 27) // ESC
				document.activeElement.blur();
		
		if (event.ctrlKey && event.keyCode === 83) // CTRL + SELECT
			if (event.shiftKey)
				saveAll();
			else
				save();
			
		if (!event.ctrlKey && !event.altKey) {
			switch (event.keyCode) {
				case 116: // F5
					$.Drag.VisualEvent.reloadGame();
					break;
				case 119: // F8
					$.Drag.VisualEvent.showDevTools();
					break;
			}
		}
	}, false);
	
	window.addEventListener("keyup", function(event) {
		window._isCtrlPressed = false;
	}, false);
});

nw.Window.get().on('close', function () {
	const win = nw.Window.get();
	win.hide(); // Pretend to be closed already
	$.Drag.VisualEvent.onCloseEditor();
	// win.close(true); // then close it forcefully
});

window.addEventListener("load", (event) => {
  init();
});