window._graphEditorMovedDist = 0;

function moveGraphEditor(event) { //movement for graph camera using translate position & movement
	const graphEditor = document.querySelector('#graphEditor');

	const mousex = parseInt(graphEditor.getAttribute('data-mousex')) || 0;
	const mousey = parseInt(graphEditor.getAttribute('data-mousey')) || 0;

	const [xGraphEditor, yGraphEditor] = getGraphPosition();

	const dx = event.x - mousex;
	const dy = event.y - mousey;

	setGraphPosition(xGraphEditor + dx, yGraphEditor + dy, false);

	graphEditor.setAttribute('data-mousex', event.x);
	graphEditor.setAttribute('data-mousey', event.y);

	window._graphEditorMoved = true;
	window._graphEditorMovedDist += Math.abs(event.x - mousex) + Math.abs(event.y - mousey);
	
	if (window._graphEditorMovedDist >= window._graphEditorCullMoveTreshold) {
		refreshAllNodesCull();
		refreshAllCurvesCull();
	}
};

function getGraphPosition() {
	return [(window._xGraph || 0), (window._yGraph || 0)];
};

function getGraphCoordinatesFromAbsolute(absX, absY) {
    const scale = getGraphEditorScale();
    const [xGraphEditor, yGraphEditor] = getGraphPosition();

    const x = (absX - xGraphEditor) / scale;
    const y = (absY - yGraphEditor) / scale;
	
    return [x, y];
};

function graphToScreen(x, y) {
    const scale = getGraphEditorScale();
    const [xGraphEditor, yGraphEditor] = getGraphPosition();

    return [
        x * scale + xGraphEditor,
        y * scale + yGraphEditor
    ];
}

function isInGraphBounds(x, y, width = 0, height = 0, margin = 0) {
	if (!window.graphBounds)
		return false;

	return !(
		x + width < graphBounds.left - margin ||
		x > graphBounds.right + margin ||
		y + height < graphBounds.top - margin ||
		y > graphBounds.bottom + margin
	);
};

function setGraphPosition(x, y, resetDataMouse = true) {
	if (x === window._xGraph && y === window._yGraph)
		return;
	
	const graphEditor = document.querySelector('#graphEditor');
	
	if (resetDataMouse) {
		graphEditor.setAttribute('data-mousex', 0);
		graphEditor.setAttribute('data-mousey', 0);
	}
	
	window._xGraph = x;
	window._yGraph = y;
	
	const scale = getGraphEditorScale();
	const xScaled = x * scale;
	const yScaled = y * scale;
	
	//set bg
	graphEditor.style.backgroundPosition = `${x}px ${y}px`;
	
	//movement for graph camera using translate position & movement
	const graphCamera = document.querySelector('#graph-camera');
	graphCamera.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
	
	cacheGraphPosition(x, y);
	window.graphBounds = getGraphBounds();
};

function disableGraphZoom() {
	window._zoomGraphEditorEnabled = false;
};

function enableGraphZoom() {
	window._zoomGraphEditorEnabled = true;
};

function zoomGraphEditor(event) { //movement for graph camera using translate position & movement
	if (window._nodeListDisplayed || window._zoomGraphEditorEnabled === false)
		return;

	if (isInput(document.activeElement) && (document.activeElement.type === "number" || document.activeElement.type === "text"))
		return;

	event.preventDefault();

	const minScale = 0.1;
	const maxScale = 3;
	const zoomFactor = 1.116;

	const oldScale = getGraphEditorScale();
	let newScale = event.deltaY < 0 ? oldScale * zoomFactor : oldScale / zoomFactor;
	newScale = Math.min(Math.max(newScale, minScale), maxScale);
	if (Math.abs(newScale - 1) < 0.02)
		newScale = 1;

	if (newScale === oldScale)
		return;

	const [cameraX, cameraY] = getGraphPosition();

	const mouseX = event.clientX;
	const mouseY = event.clientY;

	const graphX = (mouseX - cameraX) / oldScale;
	const graphY = (mouseY - cameraY) / oldScale;

	if (newScale > oldScale) {		
		let newCameraX = mouseX - graphX * newScale;
		let newCameraY = mouseY - graphY * newScale;

		const editorRect = document.querySelector('#graphEditor').getBoundingClientRect();
		const centerX = editorRect.left + editorRect.width / 2;
		const centerY = editorRect.top + editorRect.height / 2;

		const dirX = mouseX - centerX;
		const dirY = mouseY - centerY;

		const distance = Math.sqrt(dirX * dirX + dirY * dirY);
		const maxDistance = Math.sqrt((editorRect.width / 2) ** 2 + (editorRect.height / 2) ** 2);
		const strength = 0.1 * (distance / maxDistance); // tweak 0.3 for max effect

		newCameraX -= dirX * strength;
		newCameraY -= dirY * strength;
		
		setGraphPosition(newCameraX, newCameraY);
	} else {
		const newCameraX = mouseX - graphX * newScale;
		const newCameraY = mouseY - graphY * newScale;
		setGraphPosition(newCameraX, newCameraY);
	}
	
	setGraphEditorScale(newScale, true, false, true, true);
	
	// reset cursor position if moving graph, which fix bug where graph would jump very far away
    if (window.isMouseDownOnGraph) {
        const graphEditor = document.querySelector('#graphEditor');
        graphEditor.setAttribute('data-mousex', event.x);
        graphEditor.setAttribute('data-mousey', event.y);
    }
}

function getGraphCenter() {
	const graphEditorRect = document.querySelector('#graphEditor').getBoundingClientRect();
	const x = graphEditorRect.width / 2 - graphEditorRect.x;
	const y = graphEditorRect.height / 2 - graphEditorRect.y - document.querySelector('#bottom-panel').getBoundingClientRect().height;
	return [x, y];
	return getGraphCoordinatesFromAbsolute(x, y);
};

function getGraphEditorScale() {
	return window._graphScale || 1;
};

function setGraphEditorScale(scale, showScale = true, redrawCurves = true, refreshCulling = true, saveInCache = false) {
	if (scale === window._graphScale)
		return;
	
	window._graphScale = scale;
	
	const graphEditor = document.querySelector('#graphEditor');
	graphEditor.style.backgroundSize = `calc(var(--bgSizeGraphEditor) * ${scale}) calc(var(--bgSizeGraphEditor) * ${scale})`;
	document.documentElement.style.setProperty('--graph-scale', scale);
	
	//for graph camera using transform translate position & scale
	const graphCamera = document.querySelector('#graph-camera');
	const [x, y] = getGraphPosition();
	graphCamera.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;

	
	const [xGraphEditor, yGraphEditor] = getGraphPosition();
	setGraphPosition(xGraphEditor, yGraphEditor, false);
	
	window.graphBounds = getGraphBounds();
	
	if (saveInCache)
		cacheGraphScale(scale);
	
	if (refreshCulling) {
		refreshAllNodesCull();
		refreshAllCurvesCull();
	}
	
	if (!showScale)
		return;
	
	const topPanel = document.querySelector('#topPanel');
	const eShowScale = document.querySelector('#show-scale');
	eShowScale.innerHTML = `${Math.round(100 * scale)}%`;	
	eShowScale.style.top = `calc(${topPanel.getBoundingClientRect().bottom}px + 0.5em)`;
	eShowScale.style.transition = 'opacity linear 0s';
	eShowScale.style.opacity = 1;
	
	if (window._scaleTimeout)
		clearTimeout(window._scaleTimeout);
	
	window._scaleTimeout = setTimeout(() => {
		eShowScale.style.transition = 'opacity linear 3s';
		eShowScale.style.opacity = 0;
	}, 100);
};

function getGraphBounds(margin = 0) {
	const graphEditor = document.querySelector('#graphEditor');
	const graphEditorRect = graphEditor.getBoundingClientRect();

	const scale = getGraphEditorScale();
	const [x, y] = getGraphPosition();

	return {
		left: (-x) / scale - margin,
		top: (-y) / scale - margin,
		right: (graphEditorRect.width - x) / scale + margin,
		bottom: (graphEditorRect.height - y) / scale + margin
	};
};