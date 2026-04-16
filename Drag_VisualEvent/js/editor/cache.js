//-------------------------------------------------------------------------------------------------------
// CACHE
function saveCache(callback) {
	if (!window._saveCacheOnExit)
		if (callback) {
			callback();
			return;
		}
	
	if (!window._cache)
		setupCache();
	
	if (window.data.targetType && window.data.targetId)
		saveEventInCache();
	
	$.Drag.VisualEvent.saveEditorCache(window._cache, callback);
};

// function bakeTempCache(type = null, mapId = null, targetId = null, pageId = null) {
	// if (type)
		// if (mapId || targetId || pageId) {
			// const filter = getEventKey(type, mapId, targetId, pageId); // just save eventcache ?
			// window._cache.graph[type] = $.Drag.VisualEvent.mergeObjects(window._cache.graph[type], $.Drag.VisualEvent.filterObjectByKey(window._tempCache.graph[type], filter));
		// } else
			// window._cache.graph[type] = $.Drag.VisualEvent.mergeObjects(window._cache.graph[type], window._tempCache.graph[type]);
	// else
		// window._cache = $.Drag.VisualEvent.mergeObjects(window._cache, window._tempCache);
// };

function loadCache() {
	window._cacheLoadRequested = true;
	$.Drag.VisualEvent.loadEditorCache();
};

function onCacheLoaded(data) {
	console.log(`Editor cache successfully loaded.`);
	setupCache(data);
	
	updateUnsavedStatus();
	if (window._cache.editor.leftPanelWidth !== undefined)
		setLeftPanelWidth(window._cache.editor.leftPanelWidth);
	
	window._cacheLoaded = true;
};

function onCacheLoadError() {
	console.warn(`Couldn't load editor cache.`);
	setupCache();
	window._cacheLoaded = true;
};

function setupCache(data) {
	if (data)
		window._cache = data;
	else
		window._cache = {
			graph: {
				"Common Event": {},
				"Map Event": {},
				"Troop Event": {},
				"Last Event": {}
			},
			editor: {}
		};
		
	if (!window._cache.editor)
		window._cache.editor = {};
	
	if (!window._cache.editor.options)
		window._cache.editor.options = {
			autosave: true,
			autosaveInterval: 20,
			backup: true,
			backupFilename: "$name_$year-$month-$day-$hours-$minutes-$seconds",
			backupLocation: "data/data_backup",
			focus: false,
			uiScale: 16,
		}
};

function clearCache() {
	reloadGraphEditor(0, "");
	setupCache();
};

//keys
function getEventKey(type = window.data.targetType, mapTargetId = window.data.mapTargetId, targetId = window.data.targetId, pageId = window.data.pageId) {
	switch (type) {
		case "Common Event":
			return `t${targetId}_`;
		case "Map Event":
			return `m${mapTargetId || 0}_t${targetId}_p${pageId || 0}_`;
		case "Troop Event":
			return `t${targetId}_p${pageId || 0}_`;
		default:
			return '';
	};
};

function getPartialEventKey(type = null, mapTargetId = null, targetId = null, pageId = null) {
	switch (type) {
		case "Common Event":
			return `${targetId !== null ? 't' + targetId + '_' : ''}`;
		case "Map Event":
			return `${mapTargetId !== null ? 'm' + mapTargetId + '_' : ''}${targetId !== null ? 't' + targetId + '_' : ''}${pageId !== null ? 'p' + pageId + '_' : ''}`;
		case "Troop Event":
			return `${targetId !== null ? 't' + targetId + '_' : ''}${pageId !== null ? 'p' + pageId + '_' : ''}`;
		default:
			return '';
	};
};

function isPartialEventKey(type, eventKey) {
	if (!eventKey)
		return true;
	
	switch (type) {
		case "Common Event":
			return !eventKey.includes("t");
		case "Map Event":
			return !eventKey.includes("t") || !eventKey.includes("m") || !eventKey.includes("p");
		case "Troop Event":
			return !eventKey.includes("t") || !eventKey.includes("p");
		default:
			return false;
	};
};

function getMatchingEventKeys(type, mapTargetId = null, targetId = null, pageId = null) {
	const filter = getPartialEventKey(type, mapTargetId, targetId, pageId);
	
	if (window._cache.graph[type])
		return Object.keys(window._cache.graph[type]).filter(key => key.includes(filter));
	else 
		return [];
};

//event cache
function setupEventCache(type, eventKey) {
	if (isPartialEventKey(type, eventKey))
		window._cache.graph[type][eventKey] = {};
	else
		window._cache.graph[type][eventKey] = {nodes: [], _nodes: []};
	return window._cache.graph[type][eventKey];
};

function getEventCache(type = window.data.targetType, eventKey = getEventKey()) {
	if (!window._cache || !type)
		return {};
	
	let eventCache = window._cache.graph[type][eventKey];
	if (!eventCache)
		eventCache = setupEventCache(type, eventKey);
	
	return eventCache;
};

function getEventCachesFromKeys(type, keys) {
	if (!type || !keys || !Array.isArray(keys))
		return [];
	
	return Object.entries(window._cache.graph[type]).filter(entry => keys.includes(entry[0])).map(entry => entry[1]);
};

function hasEventInCache(type, targetId, mapTargetId = null) {
	if (!type || !targetId)
		return false;
	
	return getMatchingEventKeys(type, mapTargetId, targetId, null).length > 0;
};

function deleteEventCache(type, mapTargetId, targetId, pageId) {
	if (type)
		if (mapTargetId || targetId || pageId) {
			const eventKeys = getMatchingEventKeys(type, mapTargetId, targetId, pageId);
			for (const eventKey of eventKeys)
				delete window._cache.graph[type][eventKey];
		} else					
			delete window._cache.graph[type];
};

//event cache items
function saveEventInCache() {
	if (window.data.targetType && window.data.targetId)
		saveEventDataInCache(parseEventDataFromEditor());				
};

function saveEventDataInCache(data, type = window.data.targetType, mapId = window.data.mapTargetId, targetId = window.data.targetId) {
	if (!data)
		switch (type) {
			case "Common Event":
				data = window.data.$dataCommonEvents[targetId] || $.Drag.VisualEvent.getDefaultCommonEvent();
				break;
			case "Map Event":
				data = window.data._cacheMaps[mapId].events[targetId] || $.Drag.VisualEvent.getDefaultMapEvent();
				break;
			case "Troop Event":
				data = window.data.$dataTroops[targetId] || $.Drag.VisualEvent.getDefaultTroopEvent();
				break;
		}
	
	if (data)
		saveItemInEventCache("data", $.Drag.VisualEvent.deepCopyJSON(data), type, mapId, targetId);
};

function saveItemInEventCache(itemName, itemValue, type, mapTargetId, targetId, pageId) {
	if (!itemName || !type || !targetId)
		return;
	
	const eventKey = getPartialEventKey(type, mapTargetId, targetId, pageId);
	const eventCache = getEventCache(type, eventKey);
	eventCache[itemName] = itemValue;
};			

function hasItemInEventCache(itemName, type, mapTargetId, targetId, pageId) {
	if (!itemName || !type || !targetId)
		return false;
	
	if (!hasEventInCache(type, targetId, mapTargetId))
		return false;
	
	const eventKey = getPartialEventKey(type, mapTargetId, targetId, pageId);
	const eventCache = getEventCache(type, eventKey);
	
	return eventCache[itemName] !== undefined && eventCache[itemName] !== null;
};

function getEventCacheItem(itemName, type, mapTargetId, targetId, pageId) {
	if (!itemName || !type || !targetId)
		return false;
	
	const eventKey = getPartialEventKey(type, mapTargetId, targetId, pageId);
	const eventCache = getEventCache(type, eventKey);
	
	return eventCache[itemName];
};

function getAllEventCacheItems(itemName, type, mapTargetId) {
	const cacheItems = {};
	const eventKeys = getMatchingEventKeys(type, mapTargetId);
	const eventCaches = getEventCachesFromKeys(type, eventKeys);
	return eventCaches.filter(eventCache => eventCache[itemName]).map(eventCache => eventCache[itemName]);
};

//utilities
function extractPageIdFromEventKey(eventKey) {
	const match = eventKey.match(/p\d+_/);
	if (match && match[0])
		return parseInt(match[0].replace('p', '').replace('_', ''));
	else
		return null;
};

function getCacheMaxEventId(type, mapTargetId = null) {
	const targetIds = getMatchingEventKeys(type, mapTargetId, null, null).map(eventKey => parseInt(eventKey.match(/t\d+/)[0].replace('t', '')));
	return targetIds.reduce((maxId, targetId) => Math.max(targetId, maxId), 0);
};

function incrementCachePageIds(startingId = 0, type = window.data.targetType, targetId = window.data.targetId, mapTargetId = window.data.mapTargetId) {	
	const eventKey = type === "Map Event" ? `m${mapTargetId}_t${targetId}_p` : `t${targetId}_p`;
	for (const property of Object.keys(window._cache.graph[type]).filter(key => key.includes(eventKey)).sort().reverse()) {
		const pageId = parseInt(property.replace(`${eventKey}`, ''));
		if (pageId < startingId)
			continue;
		
		const newKey = property.replace(`p${pageId}`, `p${pageId + 1}`);
		$.Drag.VisualEvent.renameObjectKey(window._cache.graph[type], property, newKey);
	}
};

function decrementCachePageIds(startingId = 1, type = window.data.targetType, targetId = window.data.targetId, mapTargetId = window.data.mapTargetId) {	
	const eventKey = type === "Map Event" ? `m${mapTargetId}_t${targetId}_p` : `t${targetId}_p`;
	for (const property of Object.keys(window._cache.graph[type]).filter(key => key.includes(eventKey)).sort()) {
		const pageId = parseInt(property.replace(`${eventKey}`, ''));
		if (pageId < startingId || !pageId)
			continue;
		
		const newKey = property.replace(`p${pageId}`, `p${pageId - 1}`);
		$.Drag.VisualEvent.renameObjectKey(window._cache.graph[type], property, newKey);
	}
};

function removeEventPagesFromCache(targetType, mapTargetId, targetId, startingId = 0) {
	if (!targetType || !targetId)
		return;
	
	if (startingId < 0)
		startingId = 0;
	
	const eventKeys = getMatchingEventKeys(targetType, mapTargetId, targetId, null);
	const excludedKeys = Array(startingId).fill(0).map((item, index) => targetType === "Map Event" ? `m${mapTargetId}_t${targetId}_p${index}_` : `t${targetId}_p${index}_`);
	for (const eventKey of eventKeys) {
		if (excludedKeys.includes(eventKey))
			continue;
		
		delete window._cache.graph[targetType][eventKey];
	}
}

function removeEventPageFromCache(targetType, mapTargetId, targetId, pageId = 0) {
	const eventKey = getEventKey(targetType, mapTargetId, targetId, pageId);
	delete window._cache.graph[targetType][eventKey];
};

//last opened event
function cacheLastEvent() {			
	window._cache.graph["Last Event"] = {
		targetType: window.data.targetType,
		mapId: window.data.targetType === "Map Event" ? window.data.mapTargetId : 0,
		targetId: window.data.targetId,
		pageId: window.data.targetType === "Map Event" || window.data.targetType === "Troop Event" ? window.data.pageId || 0 : 0,
	};
};

function hasLastEventInCache() {
	return !!window._cache.graph["Last Event"];
};

function getLastEventFromCache() {
	return window._cache.graph["Last Event"] || {targetType: '', mapId: 0, eventId: 0, pageId: 0};
};


//graph position
function cacheGraphPosition(x, y) {
	if (!window.data.targetType)
		return;
	
	saveItemInEventCache("position", [x, y], window.data.targetType, window.data.mapTargetId, window.data.targetId, window.data.pageId || 0);
};

function getGraphPositionFromCache() {
	return getEventCacheItem("position", window.data.targetType, window.data.mapTargetId, window.data.targetId, window.data.pageId || 0) || [500, 200];
};

//page name
function cachePageName(input) {
	saveItemInEventCache("pageName", input.value, window.data.targetType, window.data.mapTargetId, window.data.targetId, window.data.pageId || 0);
};


function getPageNameFromCache(type = window.data.targetType, mapTargetId = window.data.mapTargetId, targetId = window.data.targetId, pageId = window.data.pageId || 0) {
	return getEventCacheItem("pageName", type, mapTargetId, targetId, pageId) || "";
};

//page conditions
function saveEventPagesConditionsInCache(conditions, input) {
	const eventData = getEventCacheItem("data", window.data.targetType, window.data.mapTargetId, window.data.targetId);
	for (const [pageId, condition] of conditions.entries()) {
		if (!$.Drag.VisualEvent.isIdentical(eventData.pages[pageId].conditions, condition)) {
			eventData.pages[pageId].conditions = condition;
			setAsUnsaved(window.data.targetType, window.data.targetId, window.data.mapTargetId, pageId, true);
			
			if (pageId === (window.data.pageId || 0))
				$.Drag.VisualEvent.updateEventConditionsList(input, window.data.targetType, condition);
		}
	}
};

//graph scale
function cacheGraphScale(scale) {
	if (!window.data.targetType)
		return;
	
	const eventCache = getEventCache();
	eventCache.scale = scale;
};

function getGraphScaleFromCache() {
	return getEventCache().scale || 1;
};

//nodes			
function deepCacheAllGraphNodes(type = window.data.targetType, mapTargetId = window.data.mapTargetId, targetId = window.data.targetId, pageId = window.data.pageId) {	
	// if (type === window.data.targetType, mapTargetId === window.data.mapTargetId, targetId === window.data.targetId, pageId === window.data.pageId)
		// for (const node of window.nodes)
			// deepCacheGraphNode(node, type, mapTargetId, targetId, pageId);
	// else {
		const eventKeys = getMatchingEventKeys(type, mapTargetId, targetId, pageId);
		for (const eventKey of eventKeys) {
			const eventCache = getEventCache(type, eventKey);
			if (!eventCache || !eventCache.nodes)
				continue;
			
			eventCache._nodes = $.Drag.VisualEvent.deepCopyJSON(eventCache.nodes);
		}
	// }
};

function deepCacheGraphNode(node, type = window.data.targetType, mapTargetId = window.data.mapTargetId, targetId = window.data.targetId, pageId = window.data.pageId) {
	if (!node)
		return
	
	const nodeId = getNodeId(node);
	const eventCache = getEventCache(type, getEventKey(type, mapTargetId, targetId, pageId));
	if (!eventCache || !eventCache.nodes)
		return;
	
	if (!Array.isArray(eventCache._nodes))
		eventCache._nodes = [];
	
	if (!eventCache.nodes[nodeId])
		cacheGraphNode(node, eventCache);
	
	eventCache._nodes[nodeId] = $.Drag.VisualEvent.deepCopyJSON(eventCache.nodes[nodeId]);
};

function cacheAllGraphNodes() {
	const eventCache = getEventCache(window.data.targetType, getEventKey());
	eventCache.nodes = [];
	
	for (const node of window.nodes)
		cacheGraphNode(node, eventCache);
};

function cacheGraphNode(node, eventCache, connectionsMap) {
	if (!window.data.targetType || !node)
		return;
	
	const [x, y] = getNodePosition(node);
	const nodeId = getNodeId(node);
	const isCustom = node.getAttribute('data-isCustom') === "true";
	const commandCode = isCustom ? node.getAttribute('data-commandCode') : getNodeCommandCode(node);
	const commandName = node.getAttribute('data-pluginCommandName') || null;
	const commandText = node.getAttribute('data-pluginCommandText') || null;
	const commandCategory = node.getAttribute('data-pluginName') || null;
	
	const parameters = commandCode !== 357 ? parseNodeInputs(node, null, false, false, false) : parseNodeInputs(node, null, false, true, false);
	if (!connectionsMap)
		connectionsMap = getNodeConnectionsMap(node);
	
	const nodeInputs = getNodeInputs(node);
	const lists = [];
	for (const input of nodeInputs)
		if (input.getAttribute('data-isList') === 'true')
			if (!lists.includes(input.getAttribute('data-listId')))
				lists.push(input.getAttribute('data-listId'));
				
	let listsLength = [];
	for (const listId of lists)
		listsLength.push(node.querySelectorAll(`*[data-listId='${listId}']`).length);
	listsLength = listsLength.concat(Array.from(node.querySelectorAll('#list-wrapper')).map(list => list.children.length));
	
	
	setNodeCache(nodeId, {
		x: x, y: y, nodeId: nodeId, 
		commandCode: commandCode, commandName: commandName, commandText: commandText, commandCategory: commandCategory, 
		parameters: parameters, connectionsMap: connectionsMap, listsLength: listsLength
	});
	
	// if (!eventCache)
		// eventCache = getEventCache(window.data.targetType, getEventKey());

	// eventCache.nodes[nodeId] = {
		// x: x, y: y, nodeId: nodeId, 
		// commandCode: commandCode, commandName: commandName, commandText: commandText, commandCategory: commandCategory, 
		// parameters: parameters, connectionsMap: connectionsMap, listsLength: listsLength
	// };
	
	
};

function setNodeCache(nodeId, cache, eventCache = null) {
	if (!cache)
		return;
	
	if (!eventCache)
		eventCache = getEventCache();
	
	eventCache.nodes[nodeId] = cache;
	
	if (!eventCache.nodes[nodeId].commandName)
		delete eventCache.nodes[nodeId].commandName;
	if (!eventCache.nodes[nodeId].commandText)
		delete eventCache.nodes[nodeId].commandText;
	if (!eventCache.nodes[nodeId].commandCategory)
		delete eventCache.nodes[nodeId].commandCategory;
};

function clearEventNodesCache(targetType, mapTargetId, targetId, pageId) {
	if (!targetType)
		return;
	
	const eventKeys = getMatchingEventKeys(targetType, mapTargetId, targetId, pageId);
	for (const eventKey of eventKeys) {
		const eventCache = getEventCache(window.data.targetType, eventKey);
		eventCache.nodes = [];
	}
};

function uncacheGraphNode(node, eventCache) {
	if (!window.data.targetType || !node)
		return;
	
	if (!eventCache)
		eventCache = getEventCache(window.data.targetType, getEventKey());
	
	const nodeId = getNodeId(node);
	
	eventCache.nodes[nodeId] = null;
};

function getGraphNodesFromCache(targetType = window.data.targetType, mapTargetId = window.data.mapTargetId, targetId = window.data.targetId, pageId = window.data.pageId || 0) {
	return getEventCache(targetType, getEventKey(targetType, mapTargetId, targetId, pageId)).nodes || [];
};

function hasGraphNodesInCache(targetType = window.data.targetType, mapTargetId = window.data.mapTargetId, targetId = window.data.targetId, pageId = window.data.pageId || 0) {
	return getGraphNodesFromCache(targetType, mapTargetId, targetId, pageId).length > 0;
};

function getGraphNodeFromCache(node) {
	if (!node)
		return {};
	
	const nodeId = getNodeId(node);
	return getGraphNodesFromCache()[nodeId];
};

function hasGraphNodeInCache(node) {
	const nodeId = getNodeId(node);
	return hasGraphNodesInCache() && getGraphNodesFromCache()[nodeId];
};

function restoreEventNodesFromCache(targetType, mapTargetId, targetId, pageId) {
	if (!targetType || !targetId)
		return;
	
	// const eventKey = getEventKey(targetType, mapTargetId, targetId, pageId);
	// if (!window._cache.graph[targetType][eventKey] || !window._cache.graph[targetType][eventKey].nodes)
		// return;
	
	const nodes = $.Drag.VisualEvent.deepCopyJSON(getEventCacheItem("_nodes", targetType, mapTargetId, targetId, pageId));
	// if (nodes.length > 0)
		saveItemInEventCache("nodes", nodes, targetType, mapTargetId, targetId, pageId);
	
	// for (node of window._cache.graph[targetType][eventKey].nodes) {
		// if (!node.init)
			// continue;
		
		// node.x = node.init.x;
		// node.y = node.init.y;
		// node.parameters = $.Drag.VisualEvent.deepCopyJSON(node.init.parameters);
		// node.connectionsMap = $.Drag.VisualEvent.deepCopyJSON(node.init.connectionsMap);
	// }
};

function updateCacheGraphNodePosition(node) {
	if (!window.data.targetType || !node)
		return;
	
	if (hasGraphNodeInCache(node)) {
		const nodeCache = getGraphNodeFromCache(node);
		const [x, y] = getNodePosition(node);
		nodeCache.x = x;
		nodeCache.y = y;
	} else
		cacheGraphNode(node);
};

function updateCacheGraphNodeConnectionsMap(node) {
	if (!window.data.targetType || !node)
		return;
	
	if (hasGraphNodeInCache(node)) {
		const nodeCache = getGraphNodeFromCache(node);
		const connectionsMap = getNodeConnectionsMap(node);
		nodeCache.connectionsMap = connectionsMap;
	} else
		cacheGraphNode(node);
};

function updateCacheGraphNodeParameters(node) {
	if (!window.data.targetType || !node)
		return;
	
	if (hasGraphNodeInCache(node)) {
		const nodeCache = getGraphNodeFromCache(node);
		const commandCode = nodeCache.commandCode;
		const parameters = commandCode !== 357 ? parseNodeInputs(node, null, false, false, false) : parseNodeInputs(node, null, false, true, false);
		nodeCache.parameters = parameters;
	} else
		cacheGraphNode(node);
};

// unsaved
function setAllAsSaved() {
	for (const key in window._cache.graph["Common Event"])
		window._cache.graph["Common Event"][key].unsaved = false;
	
	for (const key in window._cache.graph["Map Event"])
		window._cache.graph["Map Event"][key].unsaved = false;
	
	for (const key in window._cache.graph["Troop Event"])
		window._cache.graph["Troop Event"][key].unsaved = false;
	
	for (const unsaved of document.querySelectorAll('*[data-unsaved="true"]'))
		unsaved.setAttribute('data-unsaved', 'false');
	
	updateUnsavedStatus();
};

function setAsSaved(targetType = window.data.targetType, targetId = window.data.targetId, mapTargetId = null, pageId = null, refreshIcon = true) {
	if (!targetType || !targetId)
		return;
	
	const eventKeys = getMatchingEventKeys(targetType, mapTargetId, targetId, pageId);
	for (const eventKey of eventKeys) {
		const eventCache = getEventCache(targetType, eventKey);
		eventCache.unsaved = false;
		
		const keyPageId = extractPageIdFromEventKey(eventKey);
		if (refreshIcon)
			hideUnsavedIcon(targetType, targetId, mapTargetId, keyPageId);
	}
	
	updateUnsavedStatus();
};

function setAsUnsaved(targetType = window.data.targetType, targetId = window.data.targetId, mapTargetId = null, pageId = null, refreshIcon = true) {
	if (!targetType || !targetId)
		return;
	
	// const eventKey = getEventKey(targetType, mapTargetId, targetId, pageId);
	const eventKey = getPartialEventKey(targetType, mapTargetId, targetId, pageId);
	const eventCache = getEventCache(targetType, eventKey);
	eventCache.unsaved = true;
	
	if (refreshIcon)
		showUnsavedIcon(targetType, targetId, pageId);
	
	updateUnsavedStatus();
};

function updateUnsavedStatus() {
	const eStatus = document.querySelector('#bottom-panel-unsaved-status');
	const unsavedCounter = Object.values(window._cache.graph["Common Event"]).filter(item => item.unsaved).length 
		+ Object.values(window._cache.graph["Map Event"]).filter(item => item.unsaved).length 
		+ Object.values(window._cache.graph["Troop Event"]).filter(item => item.unsaved).length;
	eStatus.innerHTML = `${unsavedCounter} events unsaved.`;
};

function isUnsaved(targetType = null, targetId = null, mapTargetId = null, pageId = null) {
	if (!targetType || !targetId)
		return false;
	
	const eventKeys = getMatchingEventKeys(targetType, mapTargetId, targetId, pageId);
	const eventCaches = getEventCachesFromKeys(targetType, eventKeys);
	return !!eventCaches.find(cache => cache.unsaved);
};

function showUnsavedIcon(targetType, targetId, pageId = 0) {
	let list;
	switch (targetType) {
		case "Common Event":
			list = document.querySelector('#common-event-list');
			break;
		case "Map Event":
			list = document.querySelector('#map-event-list');
			break;
		case "Troop Event":
			list = document.querySelector('#troop-event-list');
			break;
		default: 
			return;
	};
	
	const ev = list.querySelector(`*[data-eventId="${targetId}"]`);
	if (ev)
		ev.setAttribute('data-unsaved', 'true');
	
	if ((targetType === "Troop Event" || targetType === "Map Event") && window.data.targetType === targetType && window.data.targetId === targetId) {
		const eventPage = document.querySelector(`#event-page[data-pageId="${pageId}"]`);
		if (eventPage)
			eventPage.setAttribute('data-unsaved', 'true');
	}
};

function hideUnsavedIcon(targetType, targetId, mapTargetId, pageId = 0) {
	if ((targetType === "Troop Event" || targetType === "Map Event") && window.data.targetType === targetType && window.data.targetId === targetId) {
		const eventPage = document.querySelector(`#event-page[data-pageId="${pageId}"]`);
		if (eventPage)
			eventPage.setAttribute('data-unsaved', 'false');
	}
	
	if (isUnsaved(targetType, targetId, mapTargetId))
		return;
	
	let list;
	switch (targetType) {
		case "Common Event":
			list = document.querySelector('#common-event-list');
			break;
		case "Map Event":
			list = document.querySelector('#map-event-list');
			break;
		case "Troop Event":
			list = document.querySelector('#troop-event-list');
			break;
		default: 
			return;
	};
	
	const ev = list.querySelector(`*[data-eventId="${targetId}"]`);
	if (ev)
		ev.setAttribute('data-unsaved', 'false');
};

// maps cache

function hasMapInCache(mapId) {
	return window.data._cacheMaps && window.data._cacheMaps[mapId];
};

function loadMapDataFromCache(mapId = window.data.mapTargetId) {
	if (!window.data._cacheMaps || !window.data._cacheMaps[mapId] || !window.data._cacheMaps[mapId].events) {
		window.data.mapTargetId = 0;
		return;
	}
	
	window.data.loadedMap = getMapFromCache(mapId);				
	makeMapEventList();
};

function getMapFromCache(mapId) {
	return window.data._cacheMaps[mapId];
};