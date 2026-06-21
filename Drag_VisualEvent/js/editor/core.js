function init() {
	// openDevTools();
	window._startPerformance = performance.now();
	console.log("Having the console open can cause performance issue with the Visual Event Editor. If you notice performance drop while having this window opened, please try to close it.");
	
	showLoading();
	
	document.title = "Drag_DevTools_VisualEventEditor";
	loadDataMainWindow();
	
	initLogs();
	$.Drag.VisualEvent.setLightMode(document);
	setAppropriateFontSize();
	
	document.body.setAttribute('data-RPGMAKER_NAME', $.Utils.RPGMAKER_NAME);
	document.querySelector('#bottom-panel-rm-version').innerHTML = `RPG Maker ${$.Utils.RPGMAKER_NAME} Corescript v${$.Utils.RPGMAKER_VERSION},`;
	document.querySelector('#bottom-panel-environment-version').innerHTML = `Chromium v${process.versions["chromium"]}, NodeJS v${process.versions["node"]}, NWJS v${process.versions["nw"]}, PIXI v${$.PIXI.VERSION},`;
	document.querySelector('#bottom-panel-unsaved-status').innerHTML = `0 events unsaved.`;
	document.querySelector('#title-visual-event-version').innerHTML = ` v${$.Drag.VisualEvent.version} BETA`;
	
	window.graphNodes = document.querySelector('#graphNodes');
	window.graphSVG = document.querySelector('#graphSVG');
	window.graphCamera = document.querySelector('#graph-camera');
	
	$.Drag.VisualEvent.getHTTP($.Drag.VisualEvent.pluginVersionUrl, checkNewVersionAvailable);
	verifyInstalledAddons();
	
	window._isGraphNode = true;
	if (window.data && window.data.targetId)
		setupTopPanel();
	
	importEditorMods();
	setupNodeList();
	
	const setupGraphEditorInterval = setInterval(() => {
		if (window._pluginsImported && window._dataLoaded >= $.Drag.VisualEvent.dataFiles.length) {						
			if (!window._cacheLoadRequested)
				loadCache();
			
			if (!window._cacheLoaded)
				return;
			
			if (window._invalidatedPluginCache)
				$.Drag.VisualEvent.savePluginsCache();
			
			clearInterval(setupGraphEditorInterval);
			
			if (window._cache.editor.options.uiScale)
				setFontSize(window._cache.editor.options.uiScale);
			
			if (window._cache.editor.search && window._cache.editor.search.open)
				toggleSearch();
			
			console.log(`Initialization completed in ${performance.now() - window._startPerformance}ms`);
			
			resetGraphState();
			loadDummyNodes();
			
			setupEventList();			
			if (hasLastEventInCache())
				restoreLastEvent();
			else
				setupGraphEditor();
			
			setupOptions();
			setupAutoSave();
			hideLoading();
			
			nw.Window.get().maximize();
			if (!(window._cache.editor.options.focus))
				setTimeout(() => {
					focusPlayTestWindow();
				}, 10);
			
			window._saveCacheOnExit = true;
		}
	}, 10);
};

function verifyInstalledAddons() {
	const addons = ["expandedEventCommands"];
	const customNodes = $.Drag.VisualEvent.getFileList('./Drag_VisualEvent/js/custom_nodes');
	
	for (const addon of addons) {
		switch (addon) {
			case "expandedEventCommands":
				const installed = customNodes.includes('node_expandedEventCommands.js');
				const elem = document.querySelector(`#editor-addons-menu *[data-addon="${addon}"]`);
				if (elem) {
					elem.innerHTML = installed ? "Installed" : "Not Installed";
					elem.style.color = installed ? "forestgreen" : "darkgrey";
				}
				break;
		}
		
	}
};

function checkNewVersionAvailable(data) {
	if (data === '404: Not Found')
		return;
	
	data = data.trim().toLowerCase();
	if (data !== $.Drag.VisualEvent.version.trim().toLowerCase()) {
		document.querySelector('#title-new-version').classList.remove('hidden');
		document.querySelector('#title-new-version > span').innerHTML = `New version available (v${data}) !`;
	}
};

function setupOptions() {
	const options = window._cache.editor.options;
	if (!options)
		return;
	
	if (options.focus !== undefined)
		document.querySelector('#editor-options-focus').checked = options.focus;
	
	if (options.autosave !== undefined)
		document.querySelector('#editor-options-autosave').checked = options.autosave;
	
	if (options.autosaveInterval !== undefined)
		document.querySelector('#editor-options-autosave-interval').value = options.autosaveInterval;
	
	if (options.backup !== undefined)
		document.querySelector('#editor-options-backup').checked = options.backup;
	
	if (options.backupLocation !== undefined)
		document.querySelector('#editor-options-backup-location').value = options.backupLocation;
	
	if (options.backupFilename !== undefined)
		document.querySelector('#editor-options-backup-filename').value = options.backupFilename;
	
	if (options.uiScale !== undefined)
		document.querySelector('#editor-options-ui-scale').value = options.uiScale;
	
	if (options.fontStyle !== undefined) {
		document.querySelector('#editor-options-font-style').value = options.fontStyle;
		setFontStyle(options.fontStyle);
	}
};

function saveOptions() {
	const options = window._cache.editor.options;
	if (!options)
		return;
	
	options.focus = document.querySelector('#editor-options-focus').checked;
	options.autosave = document.querySelector('#editor-options-autosave').checked;
	options.autosaveInterval = parseInt(document.querySelector('#editor-options-autosave-interval').value) || 5;
	options.backup = document.querySelector('#editor-options-backup').checked;
	options.backupLocation = document.querySelector('#editor-options-backup-location').value;
	options.backupFilename = document.querySelector('#editor-options-backup-filename').value;
	options.uiScale = parseInt(document.querySelector('#editor-options-ui-scale').value);
	options.fontStyle = document.querySelector('#editor-options-font-style').value;
};

function restoreLastEvent() {
	const start = performance.now();
	console.log("Restoring last event from cache...");
	const {targetType, mapId, targetId, pageId} = getLastEventFromCache();
	if (!targetType || !targetId || (targetType === "Map Event" && !mapId))
		return setupGraphEditor();
	
	if (targetType === "Map Event" && mapId) {
		window.data._tempTargetId = targetId;
		window.data._tempPageId = pageId;
		loadMapData(mapId, true);
	} else {
		if (targetType === "Troop Event" && (!window.data.$dataTroops[targetId] || !window.data.$dataTroops[targetId].pages[pageId]) && !hasGraphNodesInCache(targetType, 0, targetId, pageId))
			return setupGraphEditor();
		
		if (targetType === "Common Event" && !window.data.$dataCommonEvents[targetId] && !hasGraphNodesInCache(targetType, 0, targetId))
			return setupGraphEditor();
		
		reloadGraphEditor(targetId, targetType, pageId, true);
	}
	console.log(`Last event from cache restored in ${performance.now() - start}ms.`);
};

function readClipboard() {
	navigator.clipboard.readText().then(text => {
		console.log(text);
	}).catch(err => {
		console.error(err);
	});
};

function setAppropriateFontSize() {
	const screenWidth = window.screen.width;
	const fontSize = Math.min(Math.max(screenWidth * 0.01, 8), 16);
	setFontSize(fontSize);
};

function setFontSize(fontSize) {
	fontSize = Math.max(Math.min(20, fontSize), 6); 
	$.Drag.VisualEvent.setDocumentFontSize(document, fontSize);				
	document.querySelector('#editor-options-ui-scale').value = parseInt(fontSize);
};

function setFontStyle(font) {
	document.documentElement.style.fontFamily = font;
};

function loadDataMainWindow() {
	$ = window.opener;
	
	window._dataLoaded = 0;
	for (file of $.Drag.VisualEvent.dataFiles)
		$.Drag.VisualEvent.loadDataFile(file, onDataFileLoaded);
};

function onDataFileLoaded(data, name) {
	console.log(`${name} successfully loaded.`);
	window.data[`$data${name}`] = data;
	window._dataLoaded++;
};

function loadMapData(mapId, fromRestore = false) {
	if (!mapId)
		mapId = parseInt(document.querySelector('#mapList').value)

	if (!mapId)
		return;
	
	if (!fromRestore) {
		delete window.data._tempTargetId;
		delete window.data._tempPageId;
	}
	
	if (window.data.targetType === "Map Event" && window.data.mapTargetId !== mapId)
		reloadGraphEditor(0, "");
	
	window.data.mapTargetId = mapId;
	
	if (hasMapInCache(mapId))
		loadMapDataFromCache(mapId);
	else
		requestLoadDataMap(mapId);
};

function requestLoadDataMap(mapId = window.data.mapTargetId, callback) {				
	const filename = $.Drag.VisualEvent.getMapFileName(mapId);
	const map = require(`./data/${$.Drag.VisualEvent.getMapFileName(mapId)}.json`);
	if (callback)
		callback(map);
	else
		onDataMapLoad(map);
};

function onDataMapLoad(data) {
	if (!data || !data.events) {
		window.data.mapTargetId = 0;
		return;
	}
	
	window.data.loadedMap = data;
	if (!window.data._cacheMaps)
		window.data._cacheMaps = [];
	window.data._cacheMaps[window.data.mapTargetId] = data;
	
	makeMapEventList();
	
	if (window.data._tempTargetId !== undefined && window.data._tempPageId !== undefined) {
		if (!data.events[window.data._tempTargetId])
			setupGraphEditor();
		else if (!data.events[window.data._tempTargetId].pages[window.data._tempPageId] && data.events[window.data._tempTargetId].pages[0])
			reloadGraphEditor(window.data._tempTargetId, "Map Event", 0, true);
		else
			reloadGraphEditor(window.data._tempTargetId, "Map Event", window.data._tempPageId, true);

		delete window.data._tempTargetId;
		delete window.data._tempPageId;
	}
};

function focusPlayTestWindow() {
	nw.Window.get().blur();
	$.nw.Window.get().focus();
};

function openGameFolder() {
	require('child_process').exec('start "" ""');
};

function openPluginItchLink() {
	$.Drag.VisualEvent.openUrl($.Drag.VisualEvent.pluginUrl);
};

function openPatreonLink() {
	$.Drag.VisualEvent.openUrl($.Drag.VisualEvent.patreonUrl);
};

function openItchLink() {
	$.Drag.VisualEvent.openUrl($.Drag.VisualEvent.itchUrl);
};

function openDiscordLink() {
	$.Drag.VisualEvent.openUrl($.Drag.VisualEvent.discordUrl);
};

function openExpandedEventCommandsLink() {
	$.Drag.VisualEvent.openUrl($.Drag.VisualEvent.expandedEventCommandsUrl);
};

function toggleEditorOptionsMenu() {
	const eOptions = document.querySelector('#editor-option-menu');
	const button = document.querySelector('#editor-option-button');
	if (eOptions.classList.contains('hidden')) {
		eOptions.classList.remove('hidden');
		button.innerHTML = "&#10539;";
	} else {
		eOptions.classList.add('hidden');
		button.innerHTML = `
			<svg width="24px" height="24px" viewBox="0 0 24.00 24.00" xmlns="http://www.w3.org/2000/svg">
				<path style="stroke-width: 2px;" d="M11 3H13C13.5523 3 14 3.44772 14 4V4.56879C14 4.99659 14.2871 5.36825 14.6822 5.53228C15.0775 5.69638 15.5377 5.63384 15.8403 5.33123L16.2426 4.92891C16.6331 4.53838 17.2663 4.53838 17.6568 4.92891L19.071 6.34312C19.4616 6.73365 19.4615 7.36681 19.071 7.75734L18.6688 8.1596C18.3661 8.46223 18.3036 8.92247 18.4677 9.31774C18.6317 9.71287 19.0034 10 19.4313 10L20 10C20.5523 10 21 10.4477 21 11V13C21 13.5523 20.5523 14 20 14H19.4312C19.0034 14 18.6318 14.2871 18.4677 14.6822C18.3036 15.0775 18.3661 15.5377 18.6688 15.8403L19.071 16.2426C19.4616 16.6331 19.4616 17.2663 19.071 17.6568L17.6568 19.071C17.2663 19.4616 16.6331 19.4616 16.2426 19.071L15.8403 18.6688C15.5377 18.3661 15.0775 18.3036 14.6822 18.4677C14.2871 18.6318 14 19.0034 14 19.4312V20C14 20.5523 13.5523 21 13 21H11C10.4477 21 10 20.5523 10 20V19.4313C10 19.0034 9.71287 18.6317 9.31774 18.4677C8.92247 18.3036 8.46223 18.3661 8.1596 18.6688L7.75732 19.071C7.36679 19.4616 6.73363 19.4616 6.34311 19.071L4.92889 17.6568C4.53837 17.2663 4.53837 16.6331 4.92889 16.2426L5.33123 15.8403C5.63384 15.5377 5.69638 15.0775 5.53228 14.6822C5.36825 14.2871 4.99659 14 4.56879 14H4C3.44772 14 3 13.5523 3 13V11C3 10.4477 3.44772 10 4 10L4.56877 10C4.99658 10 5.36825 9.71288 5.53229 9.31776C5.6964 8.9225 5.63386 8.46229 5.33123 8.15966L4.92891 7.75734C4.53838 7.36681 4.53838 6.73365 4.92891 6.34313L6.34312 4.92891C6.73365 4.53839 7.36681 4.53839 7.75734 4.92891L8.15966 5.33123C8.46228 5.63386 8.9225 5.6964 9.31776 5.53229C9.71288 5.36825 10 4.99658 10 4.56876V4C10 3.44772 10.4477 3 11 3Z"></path>
				<path d="M14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12Z" stroke="#000000" stroke-width="1.5"></path>
			</svg>
		`;
	}
};

function toggleEditorAddonsMenu(elem) {
	const rect = elem ? elem.getBoundingClientRect() : null;
	const eAddons = document.querySelector('#editor-addons-menu');
	eAddons.style.left = `${rect ? rect.left : 0}px`;
	if (eAddons.classList.contains('hidden'))
		eAddons.classList.remove('hidden');
	else
		eAddons.classList.add('hidden');
};

function toggleEditorLogsMenu(elem) {
	const eLogs = document.querySelector('#editor-logs-menu');
	if (eLogs.classList.contains('hidden'))
		eLogs.classList.remove('hidden');
	else
		eLogs.classList.add('hidden');
};

function loadEvent(eventId, eventType, pageId, mapId) {
	saveEventInCache();				
	
	if (eventType === "Map Event" && mapId && mapId !== window.data.mapTargetId) {
		window.data._tempTargetId = eventId;
		window.data._tempPageId = pageId;
		loadMapData(mapId, true);
	} else
		reloadGraphEditor(eventId, eventType, pageId, true);
};

function getGraph() {
	return document.querySelector('#graphEditor');
};

function getGraphCamera() {
	return window.graphCamera;
};

function getNodesGraph() {
	return window.graphNodes;
};

function getGraphSVG() {
	return window.graphSVG;
};

function reloadGraphEditor(id, type, pageId = null, refreshTopPanel = true, refreshLeftPanel = true) {
	if (window._requestReloadGraphEditor) {
		cancelAnimationFrame(window._requestReloadGraphEditor);
		console.log("Pending request reload graph editor canceled, new request received...");
	}
		
	resetGraphState();
	showLoading();
	
	window._requestReloadGraphEditor = requestAnimationFrame(() => {
		requestAnimationFrame(() => {
			window._requestReloadGraphEditor = null;
			window._registerInputChange = false;
			window.data.targetId = id;
			window.data.targetType = type;
			window.data.pageId = pageId;
			
			getNodesGraph().innerHTML = '';
			document.querySelector('#graphSVG').innerHTML = '';
			
			if (!id || !type) {
				document.querySelector('#topPanel').innerHTML = '';
				hideLoading();
				return;
			}

			const [x, y] = getGraphPositionFromCache();
			setGraphPosition(x, y);
			setGraphEditorScale(getGraphScaleFromCache());
			cacheLastEvent();
			
			if (refreshTopPanel)
				setupTopPanel();
			
			if (refreshLeftPanel)
				switch (type) {
					case "Common Event":
						refreshCommonEventList();
						break;
					case "Map Event":
						refreshMapEventList();
						break;
					case "Troop Event":
						refreshTroopEventList();
						break;
				}
			
			document.querySelector('#playtest-button').classList.remove('hidden');
			document.querySelector('#save-changes-button').classList.remove('hidden');
			document.querySelector('#save-all-changes-button').classList.remove('hidden');
			
			ensureLeftPanelSelection();
			setupGraphEditor();
			
			triggerAllOnReadyOnChange();
			autofitAllTextArea();
			
			enableCullingGraphNodes();
			enableCullingGraphCurves();
			
			refreshAllNodesCull();
			refreshAllCurvesCull();
			hideLoading();
		});
	});
};

function resetGraphState() {
	window.nodes = [];
	window.indentNodes = [];
	window.nodesReadyCount = 0;
	window._updateNodeReadyCountGauge = true;
	
	window._graphNodeQueue = [];
	window._graphNodeQueueParams = {};
	window._nodesCount = 0;
	window._graphReady = false;
	
	if (window._processPendingNodeInputsRequest) {
		cancelAnimationFrame(window._processPendingNodeInputsRequest);
		window._processPendingNodeInputsRequest = null;
	}
	window._processingPendingNodeInputs = false;
	window._pendingNodeInputs = [];
};

function setupGraphEditor() {
	setupGraphEditorListeners();
	resetGraphState();
	
	requestAnimationFrame(() => {
		requestAnimationFrame(() => {
			if (window.data.targetId) {
				const start = performance.now();
				if (hasGraphNodesInCache()) {
					setupGraphNodesFromCache();
					console.log(`Setup graph nodes from cache completed in ${performance.now() - start}ms`);
				} else {
					window.onNodesReady = (() => deepCacheAllGraphNodes(window.data.targetType, window.data.mapTargetId, window.data.targetId, window.data.pageId, false));
					if (hasItemInEventCache("data", window.data.targetType, window.data.mapTargetId, window.data.targetId)) {
						const dataCache = getEventCacheItem("data", window.data.targetType, window.data.mapTargetId, window.data.targetId);
						if (window.data.targetType === "Common Event" || dataCache.pages[window.data.pageId || 0]) {
							setupGraphNodes(dataCache);
						} else {
							setupGraphNodes();
							saveEventDataInCache();
						}
					} else {
						setupGraphNodes();
						saveEventDataInCache();
					}
					
					console.log(`Setup graph nodes from data completed in ${performance.now() - start}ms`);
				}
			}
			
			if (window._onEditorReady)
				window._onEditorReady();
			triggerModsFunction("onEditorReady");
		});
	});
};

function setupGraphNodesFromCache() {
	const cacheNodes = getGraphNodesFromCache();
	window._nodesCount = cacheNodes.filter(node => node).length;
	
	const addedNodes = [];
	for (const cacheNode of cacheNodes) {
		if (!cacheNode)
			continue;

		if (cacheNode.nodeId === 0) {
			const name = getEventNodeName();
			addNodeFromParams({
				x: cacheNode.x, y: cacheNode.y, nodeId: cacheNode.nodeId, name: name, classList: "nodeEvent undeletable uncopyable",
				isPluginCommand: false,	commandCode: 0, parametersValues: cacheNode.parameters
			}, false, false);
			addedNodes.push(cacheNode);
			continue;
		}
		
		const isPluginCommand = cacheNode.commandCode === 357;
		const isCustom = typeof cacheNode.commandCode === "string";
		
		if (isCustom) {
			if (!window._customNodes[cacheNode.commandCode])
				continue;
			
			cacheNode.commandCategory = window._customNodes[cacheNode.commandCode].category;
			cacheNode.commandName = window._customNodes[cacheNode.commandCode].name;
		}
		
		// if (isInGraphBounds(cacheNode.x, cacheNode.y, 0, 0, 300)) {
			const node = addNodeFromParams({
				x: cacheNode.x, y: cacheNode.y, nodeId: cacheNode.nodeId, isCustom: isCustom,
				isPluginCommand: isPluginCommand, commandName: cacheNode.commandName, commandText: cacheNode.commandText, commandCategory: cacheNode.commandCategory,
				commandCode: cacheNode.commandCode, parametersValues: cacheNode.parameters, parameterListsLength: cacheNode.listsLength
			}, false, false);
			addedNodes.push(cacheNode);
		// } else {
			// window._graphNodeQueueParams[cacheNode.nodeId] = {
				// x: cacheNode.x,
				// y: cacheNode.y,
				// nodeId: cacheNode.nodeId,
				// isCustom,
				// isPluginCommand,
				// commandName: cacheNode.commandName,
				// commandText: cacheNode.commandText,
				// commandCategory: cacheNode.commandCategory,
				// commandCode: cacheNode.commandCode,
				// parametersValues: cacheNode.parameters,
				// parameterListsLength: cacheNode.listsLength,
				// connectionsMap: cacheNode.connectionsMap
			// };

			// window._graphNodeQueue.push(cacheNode.nodeId);
		// }
	}

	// for (const cacheNode of cacheNodes)
		// if (cacheNode)
			// rebuildListFromConnectionsMap(getNodeById(cacheNode.nodeId), cacheNode.connectionsMap);
	
	// const fragSVG = document.createDocumentFragment();
	// for (const cacheNode of cacheNodes)
		// if (cacheNode)
			// reconnectNodeFromConnectionsMap(getNodeById(cacheNode.nodeId), cacheNode.connectionsMap, true, fragSVG, false);
	
	// document.querySelector('#graphSVG').appendChild(fragSVG);
	
	for (const cacheNode of addedNodes)
		if (cacheNode)
			rebuildListFromConnectionsMap(getNodeById(cacheNode.nodeId), cacheNode.connectionsMap);
	
	const fragSVG = document.createDocumentFragment();
	for (const cacheNode of addedNodes)
		if (cacheNode)
			reconnectNodeFromConnectionsMap(getNodeById(cacheNode.nodeId), cacheNode.connectionsMap, true, fragSVG, false);
	
	getGraphSVG().appendChild(fragSVG);
		
	requestAnimationFrame(() => {
		requestAnimationFrame(() => {
			if (!window._pendingNodeInputs.length)
				onAllNodeReady();
		});
	});
	
	// if (window._graphNodeQueue.length > 0)
		// processNodeQueue();
};

function processNodeQueue() {
	const start = performance.now();
	const frag = document.createDocumentFragment();
	
	while (window._graphNodeQueue.length > 0) {
		const nodeId = window._graphNodeQueue.shift();
		const params = window._graphNodeQueueParams[nodeId];

		params._lazyLoadInputs = false;
		const node = addNodeFromParams(params, false, false);
		rebuildListFromConnectionsMap(node, params.connectionsMap);
		reconnectNodeFromConnectionsMap(node, params.connectionsMap, false, null, false);
		
		if (performance.now() - start > 2)
			break;
	}

	if (window._graphNodeQueue.length > 0)
		requestAnimationFrame(processNodeQueue);
	else
		console.log(`Editor ready (${performance.now() - window._startPerformance}ms).`);
};

function setupGraphNodes(target) {
	window._indentNodes = [];
	window._highestHeightBranch = [0];
	
	const nodeSnap = getNodeSnap();
	let y = nodeSnap.x * 2;
	let x = nodeSnap.y * 2;
	
	if (!target)
		target = window.data.targetType === "Common Event" ? window.data.$dataCommonEvents[window.data.targetId] : window.data.targetType === "Map Event" ? window.data.loadedMap.events[window.data.targetId] : window.data.targetType === "Troop Event" ? window.data.$dataTroops[window.data.targetId] : null;
	if (!target)
		target = $.Drag.VisualEvent.getDefaultEvent(window.data.targetType);
	if (!target)
		return console.log("ERROR: Setup Graph Node aborted, no target graph");
	
	const name = getEventNodeName();
	let node = makeNodeFromParams(
		{x: x, y: y, name: name, classList: "nodeEvent undeletable uncopyable", 
		haveOutputExecNode: true, indent: 0, inputs: getEventInput(window.data.targetType, window.data.targetId, window.data.pageId || 0, parseInt(document.querySelector('#mapList').value) || 0)},
		false, false);
		
	updateCacheGraphNodeParameters(node);
	registerNodeReferences(node);
	cacheNodeProperty(node, "parsedParameters", parseNodeInputs(node));
	
	window._indentNodes[0] = node;
	x += Math.ceil((node.offsetWidth + nodeSnap.x) / nodeSnap.x) * nodeSnap.x;
	
	let list;
	switch (window.data.targetType) {
		case "Common Event":
			list = target.list || [{code: 0}];
			break;
		case "Map Event":
		case "Troop Event":
			if (target.pages[window.data.pageId || 0])
				list = target.pages[window.data.pageId || 0].list || [{code: 0}];
			else 
				list = [{code: 0}];
			break;
	}
		
	const flattenedAssociatedCommands = $.Drag.VisualEvent.flattenArray(Object.values($.Drag.VisualEvent.associatedCommands));
	
	for (const [commandId, command] of list.entries()) {
		if (!command)
			continue;
		
		const commandCode = command.code;
		if (commandCode === 0) { //ignore command0
			window._indentNodes[command.indent] = null;
			y += window._highestHeightBranch[command.indent] || 0;
			window._highestHeightBranch[command.indent] = 0;
			continue;
		}
		
		if (flattenedAssociatedCommands.includes(`command${commandCode}`)) //ignore associated commands
			continue;
		
		const isCustom = typeof commandCode === "string" && hasCustomNodeData(commandCode);
		const customNodeData = isCustom ? getCustomNodeData(commandCode) : null;
		const commandParameters = isCustom ? customNodeData.inputs : $.Drag.VisualEvent.getCommandParameters(commandCode);
		if (!Array.isArray(commandParameters) && !isCustom) //ignore command without parameters unless custom
			continue;
			
		x += 500;
		y = command.indent * 500;
			
		if (isCustom) {
			const node2 = addNodeFromParams({
				x: x, y: y, isCustom: isCustom,
				isPluginCommand: false, commandName: customNodeData.name, commandCategory: customNodeData.category,
				commandCode: commandCode, parametersValues: command.parameters, _lazyLoadInputs: false
			}, false, false);
			
			if (!node2)
				continue;
			
			const prevNode = window._indentNodes[command.indent] ? window._indentNodes[command.indent] : window._indentNodes[command.indent - 1];
			const outputConnection = isNodeCustom(prevNode) ? prevNode.querySelector(`.outputConnection.exec[data-connected="false"][data-indent="${command.indent}"]`) : prevNode.querySelector(`.outputConnection.exec[data-connected="false"][data-indent="${command.indent}"]:not([data-keepUnconnected="true"])`);
			const inputConnection = node2.querySelector(`.inputConnection.exec[data-connected="false"]`);
			if (inputConnection && outputConnection)
				connectConnections(outputConnection, inputConnection);
			
			updateCacheGraphNodeParameters(node2);
			registerNodeReferences(node2);
			cacheNodeProperty(node2, "parsedParameters", parseNodeInputs(node2));
			
			window._indentNodes[command.indent] = node2;
			continue;
		}
		
		const commandParametersIndex = $.Drag.VisualEvent.commandsParametersIndex[`command${commandCode}`];
		setCommandParametersIndexs(commandParameters, commandParametersIndex);

		const outputs = makeOutputsFromCommand(commandParameters, command, commandId, list);
		const miscInputs = commandParameters.filter(param => param.notParam && !param.isOutput) || [];
		const [inputs, attributes, hasWarning] = commandCode !== 357 ? makeInputsFromCommand(commandParameters, command, commandId, list) : makeInputsFromPluginCommand(command.parameters[0], command.parameters[1], command.parameters[2], command.parameters[3]);
		
		const classList = isCustom ? makeCustomClassList(customNodeData.category) : getCommandClassList(commandCode);
		const outputLabel = getCommandOutputLabel(commandCode);
		const name = commandCode === 357 ? getCommandName(commandCode, command.parameters[0], command.parameters[1]) : isCustom ? customNodeData.name : getCommandName(commandCode);
		const footer = getCommandFooter(commandCode, hasWarning);
		
		const prevNode = window._indentNodes[command.indent] ? window._indentNodes[command.indent] : window._indentNodes[command.indent - 1];
		const prevNodeCommandCode = parseInt(prevNode.getAttribute('data-commandCode'));
		
		const node2 = makeNodeFromParams({
			x: x, y: y, name: name, commandCode: commandCode, attributes: attributes, isCustom: isCustom,
			classList: classList + (hasWarning ? ' warning' : ''), haveInputExecNode: true, haveOutputExecNode: true, 
			inputs: inputs, miscInputs: miscInputs, outputsExec: outputs, indent: command.indent, outputLabel: outputLabel, footer: footer,
			_lazyLoadInputs: false
		}, false, false);
		
		if (!node2)
			continue;
		
		const outputConnection = isNodeCustom(prevNode) ? prevNode.querySelector(`.outputConnection.exec[data-connected="false"][data-indent="${command.indent}"]`) : prevNode.querySelector(`.outputConnection.exec[data-connected="false"][data-indent="${command.indent}"]:not([data-keepUnconnected="true"])`);
		const inputConnection = node2.querySelector(`.inputConnection.exec[data-connected="false"]`);
		if (inputConnection && outputConnection)
			connectConnections(outputConnection, inputConnection);
		
		updateCacheGraphNodeParameters(node2);
		registerNodeReferences(node2);
		cacheNodeProperty(node2, "parsedParameters", parseNodeInputs(node2));
		
		window._indentNodes[command.indent] = node2;
	}
	
	delete window._indentNodes;
	onAllNodeReady();
};

function getCommandClassList(commandCode) {
	switch (commandCode) {
		case 102:
		case 111:
			return "nodeIf";
		case 112:
			return "nodeWhile";
		case 108:
			return "node-comment";
	}
	
	const commandCategory = $.Drag.VisualEvent.getCommandCategory(commandCode).toLowerCase().replace(/ /g, "-").replace("&", "and");
	return `node-${commandCategory}`;
};

function makeCustomClassList(commandCategory) {
	return `node-${commandCategory.toLowerCase().replace(/ /g, "-").replace("&", "and")}`;
};

function getCommandOutputLabel(commandCode) {
	switch (commandCode) {
		case 102:
		case 111:
		case 112:
		case 301:
			return "<span>Then</span>";
		default:
			return "";
	}
};

function getCommandName(commandCode, pluginName = "", pluginCommand = "") {
	return commandCode === 357 ? `${pluginName}: ${pluginCommand}` : $.Drag.VisualEvent.getCommandName(commandCode);
};

function getCommandFooter(commandCode, hasWarning) {
	return commandCode === 357 && hasWarning ? `<span style="text-align: center; display: block; margin: 0em 1em;">⚠ Plugin is not enabled. <br>Couln't load plugin command parameters.</span>` : '';
};

function makeOutputsFromCommand(commandParameters, command = null, commandId = 0, list = []) {
	const outputs = commandParameters.filter(param => param.isOutput) || [];
	const commandChildBranch = list.length > 0 ? $.Drag.VisualEvent.getCommandBranchsChilds(list, commandId) : [];
	
	const fOutputs = [];
	for (const [outputId, output] of outputs.entries()) {
		if (output.condition && !eval(output.condition))
			output.containerClass = "hidden";
			
		if (output.type.toLowerCase() === "stringarray") { 
			for (let i = 0; i < output.count; i++) {
				const fOutput = {type: "string", class: "onReadyOnChange", isOutput: true, name: output.name || '', default: output.default[i] || '', data: output.data ? output.data : '', value: command && !output.notParam ? command.parameters[commandParameters.indexOf(output)][i] || '' : ''};
				fOutputs.push(fOutput);
				if (!commandChildBranch[outputId + i] || commandChildBranch[outputId + i].length === 0)
					fOutput.connectionData = `${fOutput.connectionData || ''} data-keepUnconnected="true"`;
			}
		} else {
			if (!commandChildBranch[outputId] || commandChildBranch[outputId].length === 0)
				output.connectionData = `${output.connectionData || ''} data-keepUnconnected="true"`;
			
			fOutputs.push(output);
		}
	}
	return fOutputs;
};

function makeInputsFromCommand(commandParameters, command = null, commandId = 0, list = null) {
	const inputs = (commandParameters.filter(param => !param.isOutput && !param.notParam) || []).map(item => ({...item}));
	let offset = 0;
	
	for (const [i, input] of inputs.entries()) {
		if (i === 0 && input.startIndex > 0)
			offset = input.startIndex;
		
		if (input.valueCount && input.valueCount > 1) {
			input.value = [];
			for (let j = 0; j < input.valueCount; j++)
				input.value.push(command ? command.parameters[i + j + offset] : '');
			offset += input.valueCount - 1;
		} else if (input.type === "interactive") {
			if (command)
				offset = makeInteractiveInput(input, i, offset, command);
		} else {
			const index = input.parameterIndex !== undefined ? input.parameterIndex : i + offset;
			const parameter = command ? index < command.parameters.length ? command.parameters[index] : command.parameters[command.parameters.length - 1] : '';
			if (Array.isArray(parameter))
				input.value = parameter;
			else if (typeof parameter === "object" && parameter !== null)
				input.value = parameter[input.name.toLowerCase()];
			else
				input.value = parameter;
		}
	}		
	
	if (command && list)
		appendAssociatedCommandsInputs(inputs, command, commandId, list);				
	return [inputs, [], false];
};

function makeInteractiveInput(input, inputIndex, offset, command) {
	//make data-parameterIndex mandatory on interactive input, to avoid all the offset mess ?
	if (!input.controller.notParam) {
		const index = input.controller.parameterIndex !== undefined ? input.controller.parameterIndex : inputIndex + offset;
		input.controller.value = command.parameters[index];
		offset++; //temp offset for dependances
	}
	
	if (!input.behavior)
		input.behavior = Array(input.dependances.length).fill(1);
	
	input.dependances = input.dependances.map(dependance => ({...dependance}));
	
	let maxOffset = 1;
	for (const behavior of input.behavior) {
		if (Array.isArray(behavior)) {
			for (const [k, id] of behavior.entries()) {
				if (input.dependances[id].valueCount && input.dependances[id].valueCount > 1) {
					input.dependances[id].value = [];
					for (let l = 0; l < input.dependances[id].valueCount; l++)
						input.dependances[id].value.push(inputIndex + l + offset < command.parameters.length ? command.parameters[inputIndex + l + offset] :  command.parameters[command.parameters.length - 1]);
				} else {
					if (input.dependances[id].type === "interactive")
						offset = makeInteractiveInput(input.dependances[id], inputIndex, offset, command); //nested interactive probably need data-parameterIndex to work properly
					else {
						const index = input.dependances[id].parameterIndex !== undefined ? input.dependances[id].parameterIndex : inputIndex + k + offset < command.parameters.length ? inputIndex + k + offset : command.parameters.length - 1;
						input.dependances[id].value = command.parameters[index];
					}
				}
			}
			
			if (behavior.length > maxOffset)
				maxOffset = behavior.length;
		} else if (behavior > -1) {
			if (!input.dependances[behavior])
				input.dependances[behavior] = {...input.dependances[input.dependances.length - 1]};
			
			if (input.dependances[behavior].valueCount && input.dependances[behavior].valueCount > 1) {
				input.dependances[behavior].value = [];
				for (let k = 0; k < input.dependances[behavior].valueCount; k++)
					input.dependances[behavior].value.push(inputIndex + k + offset < command.parameters.length ? command.parameters[inputIndex + k + offset] :  command.parameters[command.parameters.length - 1]);
			} else {
				if (input.dependances[behavior].type === "interactive")
					offset = makeInteractiveInput(input.dependances[behavior], inputIndex, offset, command); //nested interactive probably need data-parameterIndex to work properly
				else {
					const index = input.dependances[behavior].parameterIndex !== undefined ? input.dependances[behavior].parameterIndex : inputIndex + offset < command.parameters.length ? inputIndex + offset : command.parameters.length - 1;
					input.dependances[behavior].value = command.parameters[index];
				}
			}
		}
	}
	offset += maxOffset;
	
	for (const dependance of input.dependances) {
		if (dependance.value !== undefined && dependance.evalValue) {
			const value = dependance.value;
			dependance.value = eval(dependance.evalValue);
		}
	}
	
	offset -= !input.controller.notParam ? 1 : 0;
	return offset;
};

function appendAssociatedCommandsInputs(inputs, command, commandId, list) {
	const commandCode = command.code;
	const associatedCommands = $.Drag.VisualEvent.getAssociatedCommands(commandCode);
	let commandOffset = 1;
	while (associatedCommands.includes("command" + list[commandId + commandOffset].code)) {
		const associatedParameters = $.Drag.VisualEvent.getCommandParameters(list[commandId + commandOffset].code);
		for (const [i, associatedParameter] of associatedParameters.entries()) {
			const parameter = {...associatedParameter};
			if (parameter.valueCount && parameter.valueCount > 1)
				parameter.value = list[commandId + commandOffset].parameters.slice(i, i + parameter.valueCount);
			else
				parameter.value = list[commandId + commandOffset].parameters[i];
			
			const sameTypeInput = inputs.filter(input => input.type === parameter.type);
			if (sameTypeInput.length > 0) {
				if (Array.isArray(sameTypeInput[0].value))
					sameTypeInput[0].value = sameTypeInput[0].value.concat(parameter.value);
				else
					sameTypeInput[0].value += "\n" + parameter.value;
			} else
				inputs.push(parameter);
		}
		commandOffset++;
	}
};

function makeInputsFromPluginCommand(pluginName, commandName, commandText, commandValues = []) {
	const attributes = [];				
	const inputs = $.Drag.VisualEvent.getPluginCommandParameters(pluginName, commandName);
	
	for (const input of inputs) {
		input.pluginName = pluginName;
		input.data = `data-parameterName="${input.name}" data-parameterText="${input.text || ""}"`;
		input.isPluginParameter = true;
		
		if (!input.value)
			input.value = commandValues[input.name] !== undefined ? commandValues[input.name] : input.default !== undefined ? input.default : "";

		if (input.isList) {
			try { 
				input.value = typeof input.value === "string" && input.value[0] === "[" ? JSON.parse(input.value) : [input.value]; 
				if (!Array.isArray(input.value))
					input.value = [input.value];
				if (input.value.length === 0) //initialize list with empty string value so input isn't empty without buttons to add/remove item
					input.value.push("")
			} catch(err) { 
				input.value = [""] 
			}
		} else
			input.value = [input.value];
		
		for (const [i, value] of input.value.entries()) {
			if (input.type === "boolean") {
				input.values = ["true", "false"];
				input.options = [input.on ? input.on : "On", input.off ? input.off : "Off"];
			} else if (input.type === "location") {
				let defaultValue;
				try { defaultValue = JSON.parse(input.default); } catch(err) { defaultValue = {mapId: 0, x: 0, y: 0} };
				
				const loc = commandValues[input.name] ? JSON.parse(commandValues[input.name]) : defaultValue;
				
				input.value[i] = [parseInt(loc.mapId) || 0, parseInt(loc.x) || 0, parseInt(loc.y) || 0];
				input.data += ` data-allowSearch=true' data-allowMapChange='true'"`;
			}
		}
		
		if (!input.isList)
			input.value = input.value[0];
	}
	
	attributes.push(...[["data-pluginName", pluginName], ["data-pluginCommandName", commandName], ["data-pluginCommandText", commandText]]);
	const hasWarning = !$.Drag.VisualEvent.getPluginList($.document).includes(pluginName) ? 'warning' : '';
	
	return [inputs, attributes, hasWarning];
};

function getEventInput(type = "", id = 0, pageId = 0, mapId = 0) {
	switch (type) {
		case "Common Event":
			return [];
		case "Map Event": {
			const eventData = hasItemInEventCache("data", "Map Event", mapId, id) ? getEventCacheItem("data", "Map Event", mapId, id) : (window.data.loadedMap.events[id] || $.Drag.VisualEvent.getDefaultMapEvent());
			const pageData = eventData.pages[pageId] || $.Drag.VisualEvent.getDefaultEventPage(type);
			
			const conditions = $.Drag.VisualEvent.getInputParameters("mapEventConditions");
			conditions.conditions = pageData.conditions;
			
			const character = $.Drag.VisualEvent.getInputParameters("singleFrameCharacter");
			const tilesets = window.data.$dataTilesets[window.data.loadedMap.tilesetId];
			const tilesetNames = tilesets ? tilesets.tilesetNames : [];
			const isBigImage = pageData.image.characterName[0] === "$" || pageData.image.characterName[1] === "$";
			if (!tilesetNames.includes(pageData.image.characterName)) {
				const row = Math.floor(pageData.image.characterIndex / 4) * 4 + (pageData.image.direction / 2);
				const col = (pageData.image.characterIndex % 4 * 3) + pageData.image.pattern + 1;
				const imageIndex = (row - 1) * (isBigImage ? 3 : 12) + col - 1;
				character.value = `${pageData.image.characterName},${imageIndex}`;
			} else
				character.value = `${tilesetNames[$.Drag.VisualEvent.getTilesetIndex(pageData.image.tileId)]},${pageData.image.tileId}`;
			
			character.data += ` data-tilesetNames="${tilesetNames[5]},${tilesetNames[6]},${tilesetNames[7]},${tilesetNames[8]}"`;
			
			const priority = $.Drag.VisualEvent.getInputParameters("selectPriority");
			priority.value = pageData.priorityType;
			const trigger = $.Drag.VisualEvent.getInputParameters("selectTrigger");
			trigger.value = pageData.trigger;
			
			const walking = $.Drag.VisualEvent.getInputParameters("walking");
			walking.value = pageData.walkAnime;
			const stepping = $.Drag.VisualEvent.getInputParameters("stepping");
			stepping.value = pageData.stepAnime;
			const directionFix = $.Drag.VisualEvent.getInputParameters("directionFix");
			directionFix.value = pageData.directionFix;
			const through = $.Drag.VisualEvent.getInputParameters("through");
			through.value = pageData.through;
			
			const moveType = $.Drag.VisualEvent.getInteractiveInputParameters("selectAutonomousMovementType");
			moveType.controller.value = pageData.moveType;
			moveType.dependances[3].thisEventOnly = true;
			moveType.dependances[3].mapId = mapId;
			moveType.dependances[3].x = eventData.x;
			moveType.dependances[3].y = eventData.y;
			moveType.dependances[3].value = [0, {repeat: pageData.moveRoute.repeat, skippable: pageData.moveRoute.skippable, wait: pageData.moveRoute.wait, list: pageData.moveRoute.list}];
			
			const speed = $.Drag.VisualEvent.getInputParameters("selectSpeed");
			speed.value = pageData.moveSpeed;
			const frequency = $.Drag.VisualEvent.getInputParameters("selectFrequency");
			frequency.value = pageData.moveFrequency;
			
			return [conditions, character, priority, trigger, moveType, speed, frequency, walking, stepping, directionFix, through];
		} case "Troop Event": {
			const eventData = hasItemInEventCache("data", "Troop Event", 0, id) ? getEventCacheItem("data", "Troop Event", 0, id) : (window.data.$dataTroops[id] || $.Drag.VisualEvent.getDefaultTroopEvent());
			const pageData = eventData.pages[pageId] || $.Drag.VisualEvent.getDefaultEventPage(type);
			
			const conditions = $.Drag.VisualEvent.getInputParameters("troopEventConditions");
			conditions.conditions = pageData.conditions;
			
			const span = $.Drag.VisualEvent.getInputParameters("selectSpan");
			span.value = pageData.span;
			
			return [conditions, span];
		} default:
			return [];
	}
};

function setCommandParametersIndexs(commandParameters, commandParametersIndex) {
	if (!commandParameters || !commandParametersIndex)
		return;
	
	for (const [i, parameterIndex] of commandParametersIndex.entries()) {
		const commandParameter = commandParameters.filter(parameter => !parameter.notParam)[i];
		
		if (commandParameter.type === "interactive") {
			commandParameter.controller.data = `${(commandParameter.controller.data || "")} data-parameterIndex="${parameterIndex.controller}"`;
			commandParameter.controller.parameterIndex = parameterIndex.controller;
			
			for (const [j, dependanceParameterIndex] of parameterIndex.dependances.entries()) {
				if (commandParameter.dependances[j].type === "interactive") {
					setCommandParametersIndexs([commandParameter.dependances[j]], [dependanceParameterIndex])
				} else { 
					commandParameter.dependances[j].data = `${(commandParameter.dependances[j].data || "")} data-parameterIndex="${dependanceParameterIndex}"`;
					commandParameter.dependances[j].parameterIndex = dependanceParameterIndex;
				}
			}
		} else {
			commandParameter.data = `${(commandParameter.data || "")} data-parameterIndex="${parameterIndex}"`;
			commandParameter.parameterIndex = parameterIndex;
		}
	}
};			

function loadDummyNodes() {
	window._preventAddNode = true;
	
	const now = performance.now();
	const graph = getNodesGraph();
	
	window.onNodesReady = registerDummyNodesSizes;
	
	window._dummyNodes = {native: {}};
	for (const category in $.Drag.VisualEvent.commandsCategories) {
		for (const commandCode of $.Drag.VisualEvent.commandsCategories[category]) {
			window._dummyNodes.native[commandCode] = addNodeFromParams({
				x: 0, y: 0, isPluginCommand: false, commandCode: parseInt(commandCode.replace('command', '')), commandName: "", commandText: "", commandCategory: ""
			});
			
			window._dummyNodes.native[commandCode].isDummy = true;
			
			setNodePosition(window._dummyNodes.native[commandCode], -9999, -9999);
			window._dummyNodes.native[commandCode].removeAttribute('data-nodeId');
			
			nodeResizeObserver.observe(window._dummyNodes.native[commandCode]);
			graph.appendChild(window._dummyNodes.native[commandCode]);
		}
	}
	
	if ($.Utils.RPGMAKER_NAME === "MZ") 
		for (const pluginName in $.Drag.VisualEvent.pluginJSDocData) {
			for (const commandName in $.Drag.VisualEvent.getLocalizedPluginData(pluginName).commands) {
				if (!window._dummyNodes[pluginName])
					window._dummyNodes[pluginName] = {};
				
				window._dummyNodes[pluginName][commandName] = addNodeFromParams({
					x: 0, y: 0, isPluginCommand: true, commandCode: 357, commandName: commandName, commandText: $.Drag.VisualEvent.getLocalizedPluginData(pluginName).commands[commandName].text, commandCategory: pluginName
				});
				window._dummyNodes[pluginName][commandName].isDummy = true;
				
				setNodePosition(window._dummyNodes[pluginName][commandName], -9999, -9999);
				window._dummyNodes[pluginName][commandName].removeAttribute('data-nodeId');
				
				nodeResizeObserver.observe(window._dummyNodes[pluginName][commandName]);
				graph.appendChild(window._dummyNodes[pluginName][commandName]);
				
			}
		}
			
	window._preventAddNode = false;
	console.log(`Dummy nodes loaded in ${performance.now() - now}ms.`);
};

function registerDummyNodesSizes() {
	for (const category in window._dummyNodes) 
		for (const node of Object.values(window._dummyNodes[category])) {
			node.width = node.offsetWidth;
			node.height = node.offsetHeight;
		}
		
	window.onNodesReady = null;
};

function getDummyNode(commandCode, commandCategory, commandName) {
	if (commandCode !== 357) {
		const node = window._dummyNodes.native[`command${commandCode}`];
		return node ? node.cloneNode(true) : null;
	} else {
		if (window._dummyNodes[commandCategory] && window._dummyNodes[commandCategory][commandName])
			return window._dummyNodes[commandCategory][commandName].cloneNode(true);
		else
			return null;
	}
};

function getDummyNodeWidth(commandCode, commandCategory, commandName) {
	const dummyNode = getDummyNode(commandCode, commandCategory, commandName);
	if (dummyNode)
		return dummyNode.width || 0;
	
	return 0;
};

function getDummyNodeHeight(commandCode, commandCategory, commandName) {
	const dummyNode = getDummyNode(commandCode, commandCategory, commandName);
	if (dummyNode)
		return dummyNode.height || 0;
	
	return 0;
};

function addNodeFromParams(params = {}, saveInHistory = false, cache = false, onNodeReady = null) {
	const commandCode = params.commandCode || 0;
	const commandParameters = 
		params.isPluginCommand ? $.Drag.VisualEvent.getPluginCommandParameters(params.commandCategory, params.commandName) 
		: params.commandCode === 0 ? getEventInput(window.data.targetType, window.data.targetId, window.data.pageId || 0, window.data.mapTargetId || 0) 
			: params.isCustom ? getCustomNodeParameters(commandCode)
				: $.Drag.VisualEvent.getCommandParameters(commandCode);
				
	if (!Array.isArray(commandParameters))
		return;
	
	const commandParametersIndex = $.Drag.VisualEvent.commandsParametersIndex[`command${commandCode || 0}`];
	setCommandParametersIndexs(commandParameters, commandParametersIndex);
	const [inputs, attributes, hasWarning] = !params.isPluginCommand ? makeInputsFromCommand(commandParameters) : makeInputsFromPluginCommand(params.commandCategory, params.commandName, params.commandText || params.commandName);
	const miscInputs = commandParameters.filter(param => param.notParam && !param.isOutput) || [];
	const outputs = makeOutputsFromCommand(commandParameters);
	const haveInputExecNode = params.commandCode !== 0 && !(params.isCustom && !getCustomNodeData(params.commandCode).exec_input);
	const haveOutputExecNode = !(params.isCustom && !getCustomNodeData(params.commandCode).exec_output);
	
	const associatedCommands = $.Drag.VisualEvent.getAssociatedCommands(commandCode);
	for (const associatedCommand of associatedCommands) {
		const associatedParameters = $.Drag.VisualEvent.getCommandParameters(associatedCommand) || [];
		for (const associatedParameter of associatedParameters) {
			if (!associatedParameter.isOutput) {
				const sameTypeInput = inputs.filter(input => input.type === associatedParameter.type);
				if (sameTypeInput.length === 0)
					inputs.push({...associatedParameter});
			}
			else 
				outputs.push({...associatedParameter});
		}
	}
	
	if (window.data.mapTargetId && window.data.targetType === "Map Event")
		for (const input of inputs) {
			if (input.type === "moveRoute" || input.type === "location")
				input.mapId = window.data.mapTargetId || 0;
			else if (input.type === "interactive")
				for (const dependance of input.dependances)
					if (dependance.type === "moveRoute" || dependance.type === "location")
						dependance.mapId = window.data.mapTargetId || 0;
		}
		
	const classList = params.isCustom ? makeCustomClassList(params.commandCategory) : params.classList || getCommandClassList(commandCode);
	const outputLabel = getCommandOutputLabel(commandCode);
	const name = params.name ? params.name : commandCode === 357 ? getCommandName(commandCode, params.commandCategory, params.commandText) : params.isCustom ? params.commandName : getCommandName(commandCode);
	const footer = getCommandFooter(commandCode, hasWarning);
	const node = makeNodeFromParams({
		x: params.x, y: params.y, nodeId: params.nodeId, name: name, commandCode: commandCode, attributes: attributes, isCustom: params.isCustom,
		classList: classList + (hasWarning ? ' warning' : ''), haveInputExecNode: haveInputExecNode, haveOutputExecNode: haveOutputExecNode, 
		inputs: inputs, miscInputs: miscInputs, outputsExec: outputs, indent: 0, outputLabel: outputLabel, footer: footer, _lazyLoadInputs: params._lazyLoadInputs
	}, saveInHistory, cache, () => {
		if (params.parameterListsLength)
			assignNodeListsLength(node, params.parameterListsLength);
		if (params.parametersValues)
			assignNodeParametersValues(node, params.parametersValues);
		
		triggerAllOnReadyOnChange();
	});
	
	return node;
};

function getDummyNode(commandCode) {
	return commandCode === 357 ? null : window._dummyNodes.native[`command${commandCode}`];
};

function addNodeFromDummy(params, cache = false, saveInHistory = false, onNodeReady = null) {
	const dummyNode = getDummyNode(params.commandCode);
	if (dummyNode) {
		console.log(`Adding Graph Node ${params.name} (${params.commandCode})`);
		const node = dummyNode.cloneNode(true);
		setNodePosition(node, params.x || 0, params.y || 0, false, cache);
		setNodeOffset(node, 0, 0);
		
		if (!window._preventAddNode)
			addNodeToGraphNode(node, saveInHistory, cache, null);
		
		requestAnimationFrame(() => {
			onNodeInputsReady(node, onNodeReady);
		});
		
		return node;
	}
};

function assignNodeParametersValues(node, values) {
	if (!node || !values || !values.length)
		return;
	
	const commandCode = getNodeCommandCode(node);
	if (commandCode !== 357) {
		const inputs = getNodeInputs(node, false, false, false);
		for (const [i, value] of values.entries())
			if (inputs[i])
				$.Drag.VisualEvent.setInputValue(inputs[i], value);
	} else {
		for (const key of Object.keys(values[3])) {
			const input = node.querySelector(`*[data-parameterName="${key}"]`);
			if (!input)
				continue;
			
			const isList = input.getAttribute('data-islist') === "true";
			if (isList) {
				
				//destroy existing inputs due to defaults values
				const inputWrapper = $.Drag.VisualEvent.getAncestorById(input, 'input-wrapper');
				if (inputWrapper.childElementCount > 1)
					for (let i = 1; i < inputWrapper.childElementCount; i++)
						inputWrapper.children[i].remove();
				
				let listValues = JSON.parse(values[3][key]);
				let listInput = input;
				
				if (!Array.isArray(listValues))
					listValues = [listValues];
				
				for (const [i, listValue] of listValues.entries()) {
					if (i > 0) {
						//recreate all inputs of list by cloning
						const addListInputButtons = inputWrapper.querySelectorAll('#add-list-input-button');
						const addListInputButton = addListInputButtons[addListInputButtons.length - 1];
						listInput = $.Drag.VisualEvent.addListInput(addListInputButton).querySelector(`*[data-parameterName="${key}"]`);
					}
					$.Drag.VisualEvent.setPluginCommandInputValue(listInput, listValue, node);
				}
			} else {
				if (input)
					$.Drag.VisualEvent.setPluginCommandInputValue(input, values[3][key], node);
			}
		}
	}
};

function assignNodeListsLength(node, listsLength) {
	if (!node || !listsLength || !listsLength.length)
		return;
	
	const commandCode = getNodeCommandCode(node);
	if (commandCode !== 357) {
		let listId = 0;
		
		const inputs = getNodeInputs(node, false, false);
		for (const input of inputs) {
			if (input.getAttribute('data-isList') === 'true' && listsLength[listId]) {
				const wrapper = input.parentElement;							
				const addListInputButton = findInputAssociatedAddListInputButton(input);
				for (let i = node.querySelectorAll(`*[data-listId="${input.getAttribute('data-listId')}"]`).length; i < listsLength[listId]; i++)
					$.Drag.VisualEvent.addListInput(addListInputButton);
				
				listId++;
			}
		}
		
		for (const list of node.querySelectorAll('#list-wrapper')) {
			const addListInputButton = list.querySelector('#add-list-input-button');
			for (let i = list.querySelectorAll('#add-list-input-button').length; i < listsLength[listId]; i++)
				$.Drag.VisualEvent.addListInput(addListInputButton);
			
			listId++;
		}
	}
};

function findInputAssociatedAddListInputButton(input) {
	let button;
	while (!button && input) {
		input = input.parentElement;
		button = input.querySelector('#add-list-input-button');
	}
	return button;
};

function getEventPageData(eventType, eventId, pageId, parseIfCurrent = true) {
	if (parseIfCurrent && eventType === window.data.targetType && eventId === window.data.targetId && pageId === (window.data.pageId || 0))
		return parseEventDataFromEditor().pages[pageId];
	
	switch (eventType) {
		case "Map Event":
			if (window.data.loadedMap)
				return window.data.loadedMap.events[window.data.targetId].pages[pageId] || $.Drag.VisualEvent.getDefaultEventPage("Map Event");
			else
				return null;
		case "Troop Event":
			return window.data.$dataTroops[window.data.targetId].pages[pageId] || $.Drag.VisualEvent.getDefaultEventPage("Troop Event");
		default:
			return null;
	};
};

function saveAll() {
	showLoading();
	requestAnimationFrame(() => {
		requestAnimationFrame(() => {
			setupAutoSave();

			let events = getAllEventCacheItems("data", "Common Event");
			for (const ev of events)
				if (isUnsaved("Common Event", ev.id))
					apply("Common Event", 0, ev.id);
				else
					console.log(`Common Event ${ev.id} is already saved.`)
			save(false, "Common Event");
			
			events = getAllEventCacheItems("data", "Troop Event");
			for (const ev of events)
				if (isUnsaved("Troop Event", ev.id))
					apply("Troop Event", 0, ev.id);
				else
					console.log(`Troop Event ${ev.id} is already saved.`)
			save(false, "Troop Event");
			
			if (window.data.mapTargetId && window.data.loadedMap) {
				events = getAllEventCacheItems("data", "Map Event", window.data.mapTargetId);
				for (const ev of events)
					if (isUnsaved("Map Event", ev.id, window.data.mapTargetId))
						apply("Map Event", window.data.mapTargetId, ev.id);
					else
						console.log(`Map ${window.data.mapTargetId} Event ${ev.id} is already saved.`)
				save(false, "Map Event");
			}
				
			hideLoading();
		});
	});
};

function save(shouldApply = true, type = window.data.targetType, mapId = window.data.mapTargetId, targetId = window.data.targetId) {
	const success = shouldApply ? apply(type, mapId, targetId) : true;
	if (!success)
		return console.error("ERROR: Apply changes failed, save changes aborted.");
	
	const requestBackup = window._cache.editor.options.backup;
	const backupFormat = window._cache.editor.options.backupFilename;
	const backupPath = window._cache.editor.options.backupLocation;
	switch (type) {
		case "Common Event":
			if (window.data.$dataCommonEvents.length - 1 > getCommonEventCount())
				window.data.$dataCommonEvents.length = getCommonEventCount() + 1;
			
			if (requestBackup)
				$.Drag.VisualEvent.requestBackup('data/', 'CommonEvents', 'json', backupPath, backupFormat, saveCommonEvents);
			else
				saveCommonEvents();
			
			break;
		case "Map Event":
			const mapName = `Map${String(mapId).padStart(3, '0')}`;
			if (requestBackup)
				$.Drag.VisualEvent.requestBackup('data/', mapName, 'json', backupPath, backupFormat, saveMapEvents);
			else
				saveMapEvents(mapName);

			break;
		case "Troop Event":
			if (window.data.$dataTroops.length - 1 > getTroopEventCount())
				window.data.$dataTroops.length = getTroopEventCount() + 1;
			
			if (requestBackup)
				$.Drag.VisualEvent.requestBackup('data/', 'Troops', 'json', backupPath, backupFormat, saveTroopEvents);
			else
				saveTroopEvents();
			
			break;
		default:
			console.warn(`Unrecognized event type: ${window.data.targetType}. Save changes aborted.`);
	}
};

function saveCommonEvents() {
	$.Drag.VisualEvent.writeJSON(`data/CommonEvents.json`, window.data.$dataCommonEvents, showSaveNotification);
	console.log(`Common Event changes saved in data/CommonEvents.json.`);
};

function saveMapEvents(name) {
	if (!name)
		name = $.Drag.VisualEvent.getMapFileName(window.data.mapTargetId);
	
	$.Drag.VisualEvent.writeJSON(`data/${name}.json`, window.data.loadedMap, showSaveNotification);
	console.log(`${name} changes saved in data/${name}.json.`);
};

function saveTroopEvents() {
	$.Drag.VisualEvent.writeJSON(`data/Troops.json`, window.data.$dataTroops, showSaveNotification);
	console.log(`Troop Event changes saved in data/Troops.json.`);
};

function showSaveNotification(success = true) {
	const saveButton = document.querySelector('#save-changes-button');
	const saveAllButton = document.querySelector('#save-all-changes-button');
	const notification = document.querySelector('#save-notification');
	
	saveButton.classList.add('hidden');
	saveAllButton.classList.add('hidden');
	
	if (window._saveTimeout)
		clearTimeout(window._saveTimeout);
	
	notification.classList.remove('hidden');
	notification.style.transition = 'opacity cubic-bezier(0.55, 0.06, 0.68, 0.19) 0s';
	notification.style.opacity = 1;
	
	window._saveTimeout = setTimeout(() => {
		clearTimeout(window._saveTimeout);
		
		notification.style.transition = 'opacity cubic-bezier(0.55, 0.06, 0.68, 0.19) 1s';
		notification.style.opacity = 0;
		
		window._saveTimeout = setTimeout(() => {
			notification.classList.add('hidden');
			
			saveButton.classList.remove('hidden');
			saveAllButton.classList.remove('hidden');
		}, 1000);
		
	}, 100);
};

function apply(type = window.data.targetType, mapId = window.data.mapTargetId, targetId = window.data.targetId) {
	if (type === window.data.targetType && mapId === window.data.mapTargetId && targetId === window.data.targetId)
		saveEventInCache();
	
	deepCacheAllGraphNodes(type, mapId, targetId, null);
	setAsSaved(type, targetId, mapId, null, true);
	
	let eventData = hasItemInEventCache("data", type, mapId, targetId) ? getEventCacheItem("data", type, mapId, targetId) : null;
	
	if (!eventData) {
		console.log(`Apply ${type} changes aborted, no changes detected.`);
		return false;
	}
	
	switch (type) {
		case "Common Event":
			window.data.$dataCommonEvents[targetId] = $.Drag.VisualEvent.deepCopyJSON(eventData);
			try {
				$.$dataCommonEvents[targetId] = $.Drag.VisualEvent.deepCopyJSON(eventData);
				console.log(`Common Event id:${targetId} changes applied.`);
			} catch (error) {
				console.error("Couldn't apply changes to runtime, please reload (F5) to apply.", error);
			}
			
			refreshCommonEventList();
			break;
		case "Map Event":			
			window.data._cacheMaps[mapId].events[targetId] = $.Drag.VisualEvent.deepCopyJSON(eventData);
			try {
				if ($.$dataMap && $.$gameMap && $.$gameMap._mapId === mapId) {
					$.$dataMap.events[targetId] = $.Drag.VisualEvent.deepCopyJSON(eventData);
					if ("note" in $.$dataMap.events[targetId])
						$.DataManager.extractMetadata($.$dataMap.events[targetId]);
					
					$.$gameMap._events[targetId] = new $.Game_Event(mapId, targetId);
					$.$gamePlayer.reserveTransfer($.$gameMap._mapId, $.$gamePlayer.x, $.$gamePlayer.y, 0, 0);
					$.$gameMap._interpreter.setWaitMode("transfer");
				}
				console.log(`Map Event id:${targetId} changes applied.`);
			} catch (error) {
				console.error("Couldn't apply changes to runtime, please reload (F5) to apply.", error);
			}
			
			refreshMapEventList();
			break;
		case "Troop Event":
			window.data.$dataTroops[targetId] = $.Drag.VisualEvent.deepCopyJSON(eventData);
			try {
				$.$dataTroops[targetId] = $.Drag.VisualEvent.deepCopyJSON(eventData);
				if ($.$gameTroop._inBattle && $.$gameTroop._troopId === targetId)
					$.$gameTroop.setup(targetId);
				console.log(`Troop Event id:${targetId} changes applied.`);
			} catch (error) {
				console.error("Couldn't apply changes to runtime, please reload (F5) to apply.", error);
			}
			
			refreshTroopEventList();
			break;
		default:
			console.warn(`Unrecognized event type: ${type}. Apply changes aborted.`);
			return false;
	}
	
	return true;
};

function applyPage(pageData, pageId = 0, sourceType) {
	pageData = JSON.parse(JSON.stringify(pageData));
	
	switch (window.data.targetType) {
		case "Common Event":
			if (window.data.targetType === sourceType)
				window.data.$dataCommonEvents[window.data.targetId] = pageData;
			else 
				window.data.$dataCommonEvents[window.data.targetId].list = pageData.list;
			console.log(`Common Event id:${window.data.targetId} changes applied.`);
			break;
		case "Map Event":
			if (window.data.targetType === sourceType)
				window.data.loadedMap.events[window.data.targetId].pages[pageId] = pageData;
			else
				window.data.loadedMap.events[window.data.targetId].pages[pageId].list = pageData.list;
			console.log(`Map Event id:${window.data.targetId} changes applied.`);
			break;
		case "Troop Event":
			if (window.data.targetType === sourceType)
				window.data.$dataTroops[window.data.targetId].pages[pageId] = pageData;
			else
				window.data.$dataTroops[window.data.targetId].pages[pageId].list = pageData.list;
			console.log(`Troop Event id:${window.data.targetId} changes applied.`);
			break;
		default:
			console.warn(`Unrecognized event type: ${window.data.targetType}. Apply changes aborted.`);
	}
	
	if ((window.data.pageId || 0) === pageId)
		reloadGraphEditor(window.data.targetId, window.data.targetType, pageId, false);
};

function getParametersFromParametersValues(parameters, parametersValues, result = []) {
	for (const [parameterId, parameter] of parameters.entries()) {
		if (!parameter)
			continue;
		
		if (parameter.type === 'interactive') {
			if (!parameter.controller.notParam) {
				parameter.controller.value = parametersValues[parameter.controller.parameterIndex !== undefined ? parameter.controller.parameterIndex : parameterId];
				result.push(parameter.controller);
				
				let behavior = parameter.behavior[parameter.controller.value];
				if (!Array.isArray(behavior))
					behavior = [behavior];
				for (const dependanceId of behavior)
					getParametersFromParametersValues([parameter.dependances[dependanceId]], parametersValues, result);
			} else 
				getParametersFromParametersValues(parameter.dependances, parametersValues, result);
			
			
		} else {
			parameter.value = parametersValues[parameter.parameterIndex !== undefined ? parameter.parameterIndex : parameterId];
			result.push(parameter);
		}
	}
	return result;
};

function getPluginParametersFromParametersValues(parameters, parametersValues) {
	for (const parameter in parameters)
		parameters[parameter].value = parametersValues[3][parameters[parameter].name];
		
	return parameters;
};

function getCommonEventsInRange(startId, endId) {
	if (startId > endId)
		endId = startId;
	
	const events = [];
	for (let i = startId; i <= endId; i++) {
		const eventKey = getEventKey('Common Event', null, i);
		const event = hasEventInCache("Common Event", i) ? getEventCache("Common Event", eventKey).data : data.$dataCommonEvents[i];
		if (event)
			events.push(event);
	}
	
	return events;
};

function getTroopEventsInRange(startId, endId) {
	if (startId > endId)
		endId = startId;
	
	const events = [];
	for (let i = startId; i <= endId; i++) {
		const eventKey = getPartialEventKey('Troop Event', null, i);
		const event = hasEventInCache("Troop Event", i) ? getEventCache("Troop Event", eventKey).data : data.$dataTroops[i];
		if (event)
			events.push(event);
	}
	
	return events;
};

function getMapEventsInRange(mapId, startId, endId) {
	if (startId > endId)
		endId = startId;
	
	const events = [];
	for (let i = startId; i <= endId; i++) {
		const eventKey = getPartialEventKey('Map Event', mapId, i);
		const event = hasEventInCache("Map Event", i, mapId) ? getEventCache("Map Event", eventKey).data : hasMapInCache(mapId) ? getMapFromCache(mapId).events[i] : null;
		if (event)
			events.push(event);
	}
	
	return events;
};

function setMapEventLocation(mapId = window.data.mapTargetId, eventId = window.data.targetId, x = 0, y = 0) {
	const eventCache = getEventCacheItem("data", "Map Event", mapId, eventId);
	eventCache.x = x;
	eventCache.y = y;
	
	setAsUnsaved("Map Event", eventId, mapId);
};

//-------------------------------------------------------------------------------------------------------
// INPUTS 

function getFlatInteractiveInputParameters(commandParameter) {
	const parameters = [commandParameter.controller];
	
	for (const dependance of commandParameter.dependances)
		if (dependance.type === "interactive")
			parameters.concat(getFlatInteractiveInputParameters(dependance));
		else
			parameters.push(dependance);
		
	return parameters;
};

function handleInteractiveInput(input) {
	$.Drag.VisualEvent.handleInteractiveInput(input);
};

function getNodeAudioParameters(node) {
	const inputsParameters = node.querySelectorAll('input[data-isCommandParameter="true"]');
	const parameters = Array.from(inputsParameters).map(element => element.value);
	
	return {
		type: inputsParameters[0].getAttribute('data-type') || "bgm",
		name: parameters[0],
		volume: parseInt(parameters[1]),
		pitch: parseInt(parameters[2]),
		pan: parseInt(parameters[3])
	};
};

function playAudio(button) {				
	const node = $.Drag.VisualEvent.getAncestorById(button, "graphNode");
	const parameters = getNodeAudioParameters(node);
	$.Drag.VisualEvent.playAudio(button, parameters);
};

function updateAudio(input) {				
	const node = $.Drag.VisualEvent.getAncestorById(input, "graphNode");
	const parameters = getNodeAudioParameters(node)
	$.Drag.VisualEvent.updateAudio(input, parameters);
};

function stopAudio(button) {
	const node = $.Drag.VisualEvent.getAncestorById(button, "graphNode");
	const type = node.querySelectorAll('input[data-isCommandParameter="true"]')[0].getAttribute('data-type') || "bgm";
	$.Drag.VisualEvent.stopAudio(button, type);
};

function onInputChange(input) {
	if (!input || input.classList.contains('onReadyOnChange'))
		return;
	
	const node = $.Drag.VisualEvent.getAncestorById(input, 'graphNode');
	const commandCode = getNodeCommandCode(node);
		if (typeof window[`onNodeInputChange_command${commandCode}`] === 'function')
			window[`onNodeInputChange_command${commandCode}`](input, node);
	
	if (!window._registerInputChange)
		return;
	
	if (node) {
		if (node._preventInputChange)
			return;
		
		const eventType = node.data.context.eventType;
		const eventId = node.data.context.eventId;
		const mapId = node.data.context.mapId;
		const pageId = node.data.context.pageId;
		
		if (!isUnsaved(eventType, eventId, mapId, pageId || 0))
			setAsUnsaved(eventType, eventId, mapId, pageId || 0);
		
		updateCacheGraphNodeParameters(node);
		registerNodeReferences(node);
		cacheNodeProperty(node, "parsedParameters", parseNodeInputs(node));
		
		
		
	} else if ($.Drag.VisualEvent.getAncestorById(input, 'event-data-container')) {
		const eventType = input.getAttribute('data-eventType') || window.data.targetType;
		const eventId = parseInt(input.getAttribute('data-eventId')) || window.data.targetId;
		const mapId = parseInt(input.getAttribute('data-mapId')) || window.data.mapTargetId;
		if (!isUnsaved(eventType, eventId, mapId, null))
			setAsUnsaved(eventType, eventId, mapId, null);
	}
};

function isFormInput(element) {
	return isInput(element) || isTextArea(element) || isSelect(element) || isCheckbox(element) || isRadio(element);
};

function isInput(element) {
	return (element && element.nodeName && element.nodeName.toLowerCase() === "input");
};

function isTextArea(element) {
	return (element && element.nodeName && element.nodeName.toLowerCase() === "textarea");
};

function isSelect(element) {
	return (element && element.nodeName && element.nodeName.toLowerCase() === "select");
};

function isCheckbox(element) {
	return (element && element.nodeName && element.nodeName.toLowerCase() === "checkbox");
};

function isRadio(element) {
	return (element && element.nodeName && isInput(element) && element.type.toLowerCase() === "radio");
};

function isButton(element) {
	return (element && element.nodeName && element.nodeName.toLowerCase() === "button");
};

function triggerAllOnReadyOnChange(container = document) {
	const elements = container.querySelectorAll('.onReadyOnChange');
	for (const element of elements) {
		if (isRadio(element) && !element.checked) {
			element.classList.remove('onReadyOnChange');
			continue;
		}

		if (element.onchange)
			element.onchange();
		
		element.classList.remove('onReadyOnChange');
	}
};

function isVisible(element) {
	return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
};

function autofitAllTextArea(container = document) {
	for (textArea of container.querySelectorAll(".unfitTextArea")) {
		$.Drag.VisualEvent.autoFitTextArea(textArea);
		textArea.classList.remove("unfitTextArea");
	}
};

//-------------------------------------------------------------------------------------------------------
// GRAPH LISTENERS && OBSERVERS

function startLeftPanelResize() {
	window._isLeftPanelResizing = true;
};

function resizeLeftPanel(event) {
	const mousex = event.x;
	const percentage = mousex / window.innerWidth * 100;
	
	setLeftPanelWidth(mousex);
};

function toggleLeftPanelCollapse(elem) {
	const leftPanelWidth = parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('--leftPanelWidth'));
	const screenWidth = window.screen.width;
	
	if (leftPanelWidth <= 0)
		setLeftPanelWidth(screenWidth * 0.15);
	else
		setLeftPanelWidth(0);
};

function setLeftPanelWidth(width) {
	if (width === undefined || width === null || isNaN(width))
		return;
	
	if (width < 0)
		width = 0;
	
	document.querySelector(':root').style.setProperty('--leftPanelWidth', width + "px");
	window._cache.editor.leftPanelWidth = width;
	
	const screenWidth = window.screen.width;
	const percentage = width / screenWidth * 100;
	
	if (percentage <= 0)
		document.querySelector('#left-panel-collapse').style.transform = "rotate(180deg)";
	else
		document.querySelector('#left-panel-collapse').style.removeProperty('transform');
	
	if (percentage < 8.5)
		for (const span of document.querySelectorAll('#author-links-container span'))
			span.style.display = "none";
	else 
		for (const span of document.querySelectorAll('#author-links-container span'))
			span.style.removeProperty("display");
		
	const container = document.querySelectorAll('#author-links-container svg');
	if (width < 275) {
		container[0].children[0].style.display = "none";
		container[1].children[0].style.display = "none";
		container[2].children[1].style.display = "none";
	} else {
		container[0].children[0].style.display = "block";
		container[1].children[0].style.display = "block";
		container[2].children[1].style.display = "block";
	}
};

function handleSelectionBox(event) {
	const graphEditorRect = document.querySelector('#graphEditor').getBoundingClientRect();
	if (!window._xGraphLeftMouseClick)
		window._xGraphLeftMouseClick = event.x - graphEditorRect.x;
	if (!window._yGraphLeftMouseClick)
		window._yGraphLeftMouseClick = event.y - graphEditorRect.y;
	
	const selectionBox = document.querySelector('#selection-box');
	let width = event.x - graphEditorRect.x - window._xGraphLeftMouseClick;
	let height = event.y - graphEditorRect.y - window._yGraphLeftMouseClick;
	let left = window._xGraphLeftMouseClick;
	let top = window._yGraphLeftMouseClick;
	
	if (width < 0) {
		width = Math.abs(width);
		left -= width;
	}
	if (height < 0) {
		height = Math.abs(height);
		top -= height;
	}
	
	selectionBox.style.width = width + "px";
	selectionBox.style.height = height + "px";
	selectionBox.style.left = left + "px";
	selectionBox.style.top = top + "px";
	selectionBox.style.borderWidth = "3px";
	
	const selectionBoxRect = selectionBox.getBoundingClientRect();
	window._selectionBoxSelectedNodes = [];
	
	for (const node of document.querySelectorAll('#graphNode')) {
		const nodeRect = node.getBoundingClientRect();
		if (!(selectionBoxRect.right < nodeRect.left || selectionBoxRect.left > nodeRect.right || selectionBoxRect.bottom < nodeRect.top || selectionBoxRect.top > nodeRect.bottom)) {
			selectNode(node, false);
			window._selectionBoxSelectedNodes.push(node);
		} else if (!window._isCtrlPressed && isNodeSelected(node))
			unselectNode(node, false);
	};
};

function clearSelectionBox() {
	const selectionBox = document.querySelector('#selection-box');
	
	selectionBox.style.width = 0;
	selectionBox.style.height = 0;
	selectionBox.style.left = 0;
	selectionBox.style.top = 0;
	selectionBox.style.borderWidth = 0;
	
	delete window._selectionBoxSelectedNodes;
};