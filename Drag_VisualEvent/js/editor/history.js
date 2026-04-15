(function initHistory() {
	window._history = {
		undo: {},
		redo: {},
		handlers: {},
		maxLength: 200,
		isRestoring: false
	};
})();

function addHistoryHandler(name, undoHandler, redoHandler) {
	if (!name || !undoHandler || !redoHandler)
		return console.error(`Missing name: ${name}, undoHandler: ${undoHandler} or redoHandler: ${redoHandler}, couldn't add to history handler`);
		
	if (window._history.handlers[name])
		return console.error(`History handler with name: ${name} already exist, couldn't overwrite.`);
	
	window._history.handlers[name] = {};
	window._history.handlers[name].undo = undoHandler;
	window._history.handlers[name].redo = redoHandler;
};

function getHistoryHandler(name, type) {
	if (!name || !type || !window._history.handlers[name])
		return null;
	
	return window._history.handlers[name][type] || null;
};

function addToUndoHistory(action, redoDestructive = true) {
	if (isHistoryRestoring())
		return;
	
	if (!action || typeof action !== "object" || Array.isArray(action) || !action.type)
		return;
	
	const undoHistory = getUndoHistory();
	undoHistory.push(action);
	
	if (undoHistory.length > getHistoryMaxLength())
		undoHistory.shift();
	
	if (redoDestructive)
		clearRedoHistory();
};

function undo() {
	if (undoHistoryIsEmpty() || isHistoryRestoring())
		return;
	
	const undoHistory = getUndoHistory();
	const action = undoHistory.pop();
	const historyHandler = getHistoryHandler(action.type, "undo");
	
	if (!historyHandler || typeof historyHandler !== "function")
		return;

	try {
		setHistoryIsRestoring(true);
		
		historyHandler(action);
		addToRedoHistory(action);
		
		showUndoRedoNotification("undo", action.type);
		closeNodeContextMenu();
		closeNodeListMenu();
	} catch (error) {
		console.error(`Failed to undo action: ${action.type}`, error);
	} finally {
		setHistoryIsRestoring(false);
	}
};

function addToRedoHistory(action) {
	const redoHistory = getRedoHistory();
	redoHistory.push(action);
	
	if (redoHistory.length > getHistoryMaxLength())
		redoHistory.shift();
};


function redo() {
	if (redoHistoryIsEmpty() || isHistoryRestoring())
		return;
	
	const redoHistory = getRedoHistory();
	const action = redoHistory.pop();
	const historyHandler = getHistoryHandler(action.type, "redo");
	
	if (!historyHandler || typeof historyHandler !== "function")
		return;
	
	try {
		setHistoryIsRestoring(true);
		
		historyHandler(action);
	
		showUndoRedoNotification("redo", action.type);
		closeNodeContextMenu();
		closeNodeListMenu();
	} catch (error) {
		console.error(`Failed to undo action: ${action.type}`, error);
	} finally {
		setHistoryIsRestoring(false);
		addToUndoHistory(action, false);
	}
};

function showUndoRedoNotification(type, actionType) {
	if (!type || !actionType)
		return;
	
	const eNotification = document.querySelector('#undo-redo-notification');
	if (!eNotification)
		return;
	
	eNotification.innerHTML = `${$.Drag.VisualEvent.capitalize(type)}: ${actionType.toLowerCase()}`;	
	eNotification.style.transition = 'opacity linear 0s';
	eNotification.style.opacity = 1;
	
	if (window._history.notificationTimeout)
		clearTimeout(window._history.notificationTimeout);
	
	window._history.notificationTimeout = setTimeout(() => {
		eNotification.style.transition = 'opacity linear 3s';
		eNotification.style.opacity = 0;
	}, 100);
};

function clearRedoHistory() {
	const redoHistory = getRedoHistory();
	redoHistory.length = 0;
};

function getUndoHistory() {
	const eventKey = getEventKey();
	if (!window._history.undo[eventKey])
		window._history.undo[eventKey] = [];
	return window._history.undo[eventKey];
};

function getRedoHistory() {
	const eventKey = getEventKey();
	if (!window._history.redo[eventKey])
		window._history.redo[eventKey] = [];
	return window._history.redo[eventKey];
};

function undoHistoryIsEmpty() {
	const undoHistory = getUndoHistory();
	return undoHistory.length === 0;
};

function redoHistoryIsEmpty() {
	const redoHistory = getRedoHistory();
	return redoHistory.length === 0;
};

function getHistoryMaxLength() {
	return window._history.maxLength;
};

function isHistoryRestoring() {
	return window._history.isRestoring;
};

function setHistoryIsRestoring(isRestoring) {
	return window._history.isRestoring = isRestoring;
};

