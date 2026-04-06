window._graphEditorMovedDist = 0;
function moveGraphEditor(event) {
	const graphEditor = document.querySelector('#graphEditor');
	const scale = getGraphEditorScale();
	
	const mousex = parseInt(graphEditor.getAttribute('data-mousex')) || 0;
	const mousey = parseInt(graphEditor.getAttribute('data-mousey')) || 0;
	const [xGraphEditor, yGraphEditor] = getGraphPosition();

	const scaleMult = 100 / (scale * 100);
	const hMovement = (event.x - mousex) * scaleMult;
	const vMovement = (event.y - mousey) * scaleMult;
	
	setGraphPosition(xGraphEditor + hMovement, yGraphEditor + vMovement, false);
	
	graphEditor.setAttribute('data-mousex', event.x);
	graphEditor.setAttribute('data-mousey', event.y);
	
	window._graphEditorMoved = true;
	
	// window._graphEditorMovedDist += Math.abs(event.x - mousex) + Math.abs(event.y - mousey);
	// if (window._graphEditorMovedDist >= window._graphEditorCullMoveTreshold)
		// startCullingGraphNodes();
};

function getGraphPosition() {
	return [(window._xGraph || 0), (window._yGraph || 0)];
	
	// const graphEditor = document.querySelector('#graphEditor');
	// const xGraphEditor = parseInt(graphEditor.getAttribute('data-xGraphEditor'));
	// const yGraphEditor = parseInt(graphEditor.getAttribute('data-yGraphEditor'));
	// return [xGraphEditor, yGraphEditor];
};

function getGraphCoordinatesFromAbsolute(absx, absy) {
	const graphEditorRect = document.querySelector('#graphEditor').getBoundingClientRect();
	const [xGraphEditor, yGraphEditor] = getGraphPosition();
	
	const scale = getGraphEditorScale();
	const scaleMult = 100 / (scale * 100);

	const x = absx * scaleMult + graphEditorRect.width * (1 - scaleMult) / 2 - xGraphEditor;
	const y = absy * scaleMult + graphEditorRect.height * (1 - scaleMult) / 2 - yGraphEditor;
	
	return [x, y];
};

function setGraphPosition(x, y, resetDataMouse = true) {
	const graphEditor = document.querySelector('#graphEditor');
	
	if (resetDataMouse) {
		graphEditor.setAttribute('data-mousex', 0);
		graphEditor.setAttribute('data-mousey', 0);
	}
	
	// graphEditor.setAttribute('data-xGraphEditor', x);
	// graphEditor.setAttribute('data-yGraphEditor', y);
	window._xGraph = x;
	window._yGraph = y;
	
	const scale = getGraphEditorScale();
	const xScaled = x * scale;
	const yScaled = y * scale;
	
	//set bg
	graphEditor.style.backgroundPosition = `${xScaled}px ${yScaled}px`;
	
	//set svgs
	const graphSVG = document.querySelector('#graphSVG');
	graphSVG.style.left = `${xScaled}px`;
	graphSVG.style.top = `${yScaled}px`;
	
	//set nodes
	const graphNodes = document.querySelector('#graphNodes');
	graphNodes.style.left = `${xScaled}px`;
	graphNodes.style.top = `${yScaled}px`;
	
	cacheGraphPosition(x, y);
};

function disableGraphZoom() {
	window._zoomGraphEditorEnabled = false;
};

function enableGraphZoom() {
	window._zoomGraphEditorEnabled = true;
};

function zoomGraphEditor(event) {
	if (window._nodeListDisplayed || window._zoomGraphEditorEnabled === false)
		return;
	
	if (isInput(document.activeElement) && (document.activeElement.type === "number" || document.activeElement.type === "text"))
		return;
	
	const minScale = 0.1;
	const maxScale = 3;
	
	const delta = Math.sign(event.deltaY) * -0.1;			
	const scaleGraphEditor = getGraphEditorScale();
	
	// const scale = parseFloat(Math.min(Math.max(scaleGraphEditor + delta, minScale), maxScale).toFixed(1));
	
	const zoomFactor = 1.1;
	const scale = event.deltaY < 0 ? scaleGraphEditor * zoomFactor : scaleGraphEditor / zoomFactor;
	console.log(scale);
	if (scaleGraphEditor < scale) {
		const cursorPosition = getCursorPosition();
		const graphPosition = getGraphPosition();
		const graphCenter = getGraphCenter();
		const strength = scale > 1 ? 0.1 : $.Drag.VisualEvent.lerp(1, 0.1, scale);
		const x = graphPosition[0] + ((graphCenter[0] - cursorPosition[0]) * strength);
		const y = graphPosition[1] + ((graphCenter[1] - cursorPosition[1]) * strength);
		setGraphPosition(x, y);
	}
	
	setGraphEditorScale(scale, true, false, true, true);
};

function getGraphCenter() {
	const graphEditorRect = document.querySelector('#graphEditor').getBoundingClientRect();
	const x = graphEditorRect.width / 2 - graphEditorRect.x;
	const y = graphEditorRect.height / 2 - graphEditorRect.y - document.querySelector('#bottom-panel').getBoundingClientRect().height;
	return [x, y];
	return getGraphCoordinatesFromAbsolute(x, y);
};

function getGraphEditorScale() {
	// return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--scaleGraphEditor')) || 1;
	return window._graphScale || 1;
	// return parseFloat(document.querySelector('#graphEditor').getAttribute('data-scale')) || 1;
};

function setGraphEditorScale(scale, showScale = true, redrawCurves = true, refreshCulling = true, saveInCache = false) {
	// document.querySelector(':root').style.setProperty('--scaleGraphEditor', scale);
	// const graphEditor = document.querySelector('#graphEditor');
	// graphEditor.setAttribute('data-scale', scale);
	window._graphScale = scale;
	
	graphEditor.style.backgroundSize = `calc(var(--bgSizeGraphEditor) * ${scale}) calc(var(--bgSizeGraphEditor) * ${scale})`;
	document.querySelector('#graphNodes').style.transform = `scale(${scale})`;
	document.querySelector('#graphSVG').style.transform = `scale(${scale})`;
	// for (const nodeHeader of document.querySelectorAll('#node-header'))
		// nodeHeader.style.fontSize = `max(calc((2 - ${scale}) * 20px), 20px)`;
	
	const [xGraphEditor, yGraphEditor] = getGraphPosition();
	setGraphPosition(xGraphEditor, yGraphEditor, false);
	
	// if (redrawCurves)
		// redrawAllCurves();
	
	if (saveInCache)
		cacheGraphScale(scale);
	
	// if (refreshCulling)
		// startCullingGraphNodes();
	
	if (!showScale)
		return;
	
	const topPanel = document.querySelector('#topPanel');
	const eShowScale = document.querySelector('#show-scale');
	eShowScale.innerHTML = `${Math.round(100 * scale)}%`;	
	// eShowScale.style.top = window.data.targetType === "Common Event" ? '7.5em' : '11.25em';
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