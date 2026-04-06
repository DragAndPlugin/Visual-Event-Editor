function addToNodeHistory(action, redoDestructive = true) {
	if (typeof action !== "object")
		return;
	
	if (!window._nodeUndoHistory)
		window._nodeUndoHistory = [];
	
	if (!action.time)
		action.time = Date.now();
	
	window._nodeUndoHistory.push(action);
	if (redoDestructive)
		window._nodeRedoHistory = [];
};

function undoNodes() {
	if (!window._nodeUndoHistory || window._nodeUndoHistory.length === 0)
		return;
	
	const initTime = window._nodeUndoHistory[window._nodeUndoHistory.length - 1].time;
	const initType = window._nodeUndoHistory[window._nodeUndoHistory.length - 1].type;
	let actionTime = initTime;
	let actionType = initType;
	while (initTime - actionTime < 60 && initType === actionType) {
		let action = window._nodeUndoHistory.pop();
		switch (action.type) {
			case "add":
				deleteNode(action.target);
				break;
			case "delete":
				addNodeToGraphNode(action.target, false, true);
				reconnectNodeFromConnectionsMap(action.target, action.connectionsMap);
				break;
			case "move":
				setNodePosition(action.target, action.from[0], action.from[1]);
				redrawNodeCurves(action.target);
				break;
			case "select":
				unselectNode(action.target);
				break;
			case "unselect":
				selectNode(action.target)
				break;
			default:
				console.warn(`Unknown undo action ${action.type}, undo aborted.`);
				break;
		}
		
		window._nodeRedoHistory.push(action);
		
		if (window._nodeUndoHistory.length > 0) {
			actionTime = window._nodeUndoHistory[window._nodeUndoHistory.length - 1].time;
			actionType = window._nodeUndoHistory[window._nodeUndoHistory.length - 1].type;
		} else {
			actionTime = -1;
			actionType = null;
		}
	}
	
	const eNotification = document.querySelector('#undo-redo-notification');
	eNotification.innerHTML = `Undo: ${initType}`;	
	eNotification.style.transition = 'opacity linear 0s';
	eNotification.style.opacity = 1;
	
	if (window._undoRedoTimeout)
		clearTimeout(window._undoRedoTimeout);
	
	window._undoRedoTimeout = setTimeout(() => {
		eNotification.style.transition = 'opacity linear 3s';
		eNotification.style.opacity = 0;
	}, 100);
	
	closeNodeContextMenu();
	closeNodeListMenu();
};

function redoNodes() {
	if (!window._nodeRedoHistory || window._nodeRedoHistory.length === 0)
		return;
	
	const initTime = window._nodeRedoHistory[window._nodeRedoHistory.length - 1].time;
	const initType = window._nodeRedoHistory[window._nodeRedoHistory.length - 1].type;
	let actionTime = initTime;
	let actionType = initType;
	while (initTime - actionTime > -60 && initType === actionType) {
		const action = window._nodeRedoHistory.pop();
		switch (action.type) {
			case "add":
				addNodeToGraphNode(action.target, false, true);
				reconnectNodeFromConnectionsMap(action.target, action.connectionsMap);
				break;
			case "delete":
				deleteNode(action.target);
				break;
			case "move":
				setNodePosition(action.target, action.to[0], action.to[1]);
				redrawNodeCurves(action.target);
				break;
			case "select":
				selectNode(action.target);
				break;
			case "unselect":
				unselectNode(action.target)
				break;
			default:
				console.warn(`Unknown redo action ${action.type}, redo aborted.`);
				break;
		}
		
		addToNodeHistory(action, false);
		
		if (window._nodeRedoHistory.length > 0) {
			actionTime = window._nodeRedoHistory[window._nodeRedoHistory.length - 1].time;
			actionType = window._nodeRedoHistory[window._nodeRedoHistory.length - 1].type;
		} else { 
			actionTime = initTime;
			actionType = null;
		}
	}
	
	const eNotification = document.querySelector('#undo-redo-notification');
	eNotification.innerHTML = `Redo: ${initType}`;	
	eNotification.style.transition = 'opacity linear 0s';
	eNotification.style.opacity = 1;
	
	if (window._undoRedoTimeout)
		clearTimeout(window._undoRedoTimeout);
	
	window._undoRedoTimeout = setTimeout(() => {
		eNotification.style.transition = 'opacity linear 3s';
		eNotification.style.opacity = 0;
	}, 100);
	
	closeNodeContextMenu();
	closeNodeListMenu();
};