function openAdvancedSearch(input) {
	$.Drag.VisualEvent.openAdvancedSearchWindow(input);
	hideCommonEventContextMenu();
	hideMapEventContextMenu();
	hideTroopEventContextMenu();
};

// common event
function showCommonEventContextMenu(e) {
	const contextmenu = document.querySelector('#common-event-contextmenu');
	if (!contextmenu)
		return;
	
	const count = window._cache.graph["Common Event"].ceCount ? window._cache.graph["Common Event"].ceCount : window.data.$dataCommonEvents.length - 1;
	const ceMaximum = contextmenu.querySelector('#common-event-maximum');
	ceMaximum.innerHTML = `<span>Set Maximum</span>${$.Drag.VisualEvent.getInputField({type: "integer", min: 1, max: 9999, value: count})}<button onclick="changeMaximumCommonEvents(this)">OK</button>`;
	
	const eEvent = e.path.find(elem => typeof elem.hasAttribute === "function" && elem.hasAttribute('data-eventId'));
	const eventId = eEvent ? eEvent.getAttribute('data-eventId') : 0;
	contextmenu.setAttribute('data-eventId', eventId);
	
	const ceActions = contextmenu.querySelector('#common-event-actions');
	ceActions.innerHTML = `Common Event ${eventId} Actions`;
	
	const ceCopy = contextmenu.querySelector('#common-event-copy');
	if (eventId)
		ceCopy.classList.remove('disabled');
	else
		ceCopy.classList.add('disabled');
	
	const cePaste = contextmenu.querySelector('#common-event-paste');
	if (window._copiedCommonEvent && eventId)
		cePaste.classList.remove('disabled');
	else
		cePaste.classList.add('disabled');
	
	const ceClear = contextmenu.querySelector('#common-event-clear');
	if (eventId)
		ceClear.classList.remove('disabled');
	else
		ceClear.classList.add('disabled');
	
	const ceDiscard = contextmenu.querySelector('#common-event-discard');
	if (isUnsaved("Common Event", eventId))
		ceDiscard.classList.remove('disabled');
	else
		ceDiscard.classList.add('disabled');
	
	const ceCache = contextmenu.querySelector('#common-event-cache-delete');
	if (hasEventInCache("Common Event", eventId))
		ceCache.classList.remove('disabled');
	else
		ceCache.classList.add('disabled');
	
	contextmenu.classList.remove('hidden');
	window._commonEventContextMenuOpened = true;
	
	const leftPanelRect = document.querySelector('#left-panel').getBoundingClientRect();
	const graphEditorRect = document.querySelector('#graphEditor').getBoundingClientRect();
	const contextMenuRect = contextmenu.getBoundingClientRect();
	
	const x = e.x + contextMenuRect.width > graphEditorRect.right ? e.x - (e.x + contextMenuRect.width - graphEditorRect.right) : e.x;
	const y = e.y + contextMenuRect.height > leftPanelRect.bottom ? e.y - (e.y + contextMenuRect.height - leftPanelRect.bottom) : e.y;
	contextmenu.style.left = `${x}px`;
	contextmenu.style.top = `${y}px`;
};

function hideCommonEventContextMenu() {
	const contextmenu = document.querySelector('#common-event-contextmenu');
	if (!contextmenu)
		return;
	
	contextmenu.classList.add('hidden');
	
	window._commonEventContextMenuOpened = false;
};

function deleteCommonEventCache() {
	const contextmenu = document.querySelector('#common-event-contextmenu');
	if (!contextmenu)
		return;
	
	const eventId = parseInt(contextmenu.getAttribute('data-eventId'));
	if (!eventId)
		return;
	
	if (!confirm(`Are you sure you want to clear this event's cache?\n\nThe editor will discard all cached data and rebuild the graph from the original RPG Maker event.\n\nWarning:\n• Unconnected nodes will be lost\n• Custom page names will be removed\n• Non-linear layouts will be rebuilt as linear flows\n• Some custom nodes may not be restored perfectly\n\nThis operation cannot be undone.`))
		return;
	
	$.Drag.VisualEvent.loadDataFile("CommonEvents", (data) => {
		const commonEvent = data[eventId] ? $.Drag.VisualEvent.deepCopyJSON(data[eventId]) : $.Drag.VisualEvent.getDefaultCommonEvent();
		saveEventDataInCache(commonEvent, "Common Event", 0, eventId);
		clearEventNodesCache("Common Event", 0, eventId);
		setAsSaved("Common Event", eventId);
		
		if (eventId === window.data.targetId && window.data.targetType === "Common Event") {
			reloadGraphEditor(window.data.targetId, window.data.targetType);
			setGraphEditorScale(1);
			setGraphPosition(500, 200);
		}
	
		refreshCommonEventList();
		hideCommonEventContextMenu();
	});
};

function discardCommonEventChanges() {
	const contextmenu = document.querySelector('#common-event-contextmenu');
	if (!contextmenu)
		return;
	
	const eventId = parseInt(contextmenu.getAttribute('data-eventId'));
	if (!eventId)
		return;
	
	if (!confirm(`Are you sure you want to discard your changes?\n\nAll unsaved modifications to this event will be lost and the event will be reloaded from its last saved state.`))
		return;
	
	const commonEvent = window.data.$dataCommonEvents[eventId] ? $.Drag.VisualEvent.deepCopyJSON(window.data.$dataCommonEvents[eventId]) : $.Drag.VisualEvent.getDefaultCommonEvent();
	saveEventDataInCache(commonEvent, "Common Event", 0, eventId);
	restoreEventNodesFromCache("Common Event", 0, eventId);			
	setAsSaved("Common Event", eventId);
	
	if (eventId === window.data.targetId && window.data.targetType === "Common Event")
		reloadGraphEditor(window.data.targetId, window.data.targetType);
	
	refreshCommonEventList();
	hideCommonEventContextMenu();
};

function changeMaximumCommonEvents(element) {
	const maximum = parseInt(element.parentElement.querySelector('input').value);
	const commonEventCount = getCommonEventCount();
	
	if (maximum > commonEventCount) {
		const count = maximum - commonEventCount;
		for (let i = 1; i <= count; i++) {
			if (!window.data.$dataCommonEvents[commonEventCount + i])
				window.data.$dataCommonEvents[commonEventCount + i] = $.Drag.VisualEvent.getDefaultCommonEvent();
		}
	} else if (maximum < commonEventCount)
		for (let i = maximum + 1; i <= commonEventCount; i++)
			clearCommonEvent(i);
	
	window._cache.graph["Common Event"].ceCount = maximum;
	
	if (window.data.targetId > maximum && window.data.targetType === "Common Event")
		reloadGraphEditor(maximum, window.data.targetType);
	else
		refreshCommonEventList();
	
	hideCommonEventContextMenu();
};

function clearCommonEvent(eventId = null) {
	if (eventId === null) {
		const contextmenu = document.querySelector('#common-event-contextmenu');
		if (!contextmenu)
			return;
		eventId = parseInt(contextmenu.getAttribute('data-eventId'));
	}
	
	if (!eventId)
		return;
	
	if (!confirm(`Are you sure you want to clear this event?\n\nThis will remove all event commands and reset the event to its default empty state.\n\n`));
		return;
	
	setAsUnsaved("Common Event", eventId);
	
	const commonEvent = $.Drag.VisualEvent.getDefaultCommonEvent();
	commonEvent.id = eventId;
	
	clearEventNodesCache("Common Event", 0, eventId);
	saveEventDataInCache(commonEvent, "Common Event", 0, eventId);		
	
	updateCommonEventListName(eventId, "");
	hideCommonEventContextMenu();
	
	if (eventId === window.data.targetId && window.data.targetType === "Common Event")
		reloadGraphEditor(window.data.targetId, window.data.targetType);
};

function copyCommonEvent() {
	const contextmenu = document.querySelector('#common-event-contextmenu');
	if (!contextmenu)
		return;
	
	const eventId = parseInt(contextmenu.getAttribute('data-eventId'));
	if (!eventId)
		return;
	
	window._copiedCommonEvent = $.Drag.VisualEvent.deepCopyJSON(window.data.$dataCommonEvents[eventId] || $.Drag.VisualEvent.getDefaultCommonEvent());
	
	hideCommonEventContextMenu();
};

function pasteCommonEvent() {
	if (!window._copiedCommonEvent)
		return;
	
	const contextmenu = document.querySelector('#common-event-contextmenu');
	if (!contextmenu)
		return;
	
	const eventId = parseInt(contextmenu.getAttribute('data-eventId'));
	if (!eventId)
		return;
	
	setAsUnsaved("Common Event", eventId);
	saveEventDataInCache($.Drag.VisualEvent.deepCopyJSON(window._copiedCommonEvent), "Common Event", 0, eventId);
	clearEventNodesCache("Common Event", 0, eventId);
	
	if (eventId === window.data.targetId && window.data.targetType === "Common Event")
		reloadGraphEditor(window.data.targetId, window.data.targetType);
	
	updateCommonEventListName(eventId);
	hideCommonEventContextMenu();
};

//troop event
function showTroopEventContextMenu(e) {
	const contextmenu = document.querySelector('#troop-event-contextmenu');
	if (!contextmenu)
		return;
	
	const count = window._cache.graph["Troop Event"].count ? window._cache.graph["Troop Event"].count : window.data.$dataTroops.length - 1;
	const eMaximum = contextmenu.querySelector('#troop-event-maximum');
	eMaximum.innerHTML = `
		<span>Set Maximum</span>
		${$.Drag.VisualEvent.getInputField({type: "integer", min: 1, max: 9999, value: count})}
		<button onclick="changeMaximumTroopEvents(this);">OK</button>
	`;
	
	const eEvent = e.path.find(elem => typeof elem.hasAttribute === "function" && elem.hasAttribute('data-eventId'));
	const eventId = eEvent ? eEvent.getAttribute('data-eventId') : 0;
	contextmenu.setAttribute('data-eventId', eventId);
	
	const eActions = contextmenu.querySelector('#troop-event-actions');
	eActions.innerHTML = `Troop Event ${eventId} Actions`;
	
	const eCopy = contextmenu.querySelector('#troop-event-copy');
	if (eventId)
		eCopy.classList.remove('disabled');
	else
		eCopy.classList.add('disabled');
	
	const ePaste = contextmenu.querySelector('#troop-event-paste');
	if (window._copiedTroopEvent && eventId)
		ePaste.classList.remove('disabled');
	else
		ePaste.classList.add('disabled');
	
	const eClear = contextmenu.querySelector('#troop-event-clear');
	if (eventId)
		eClear.classList.remove('disabled');
	else
		eClear.classList.add('disabled');
	
	const eCache = contextmenu.querySelector('#troop-event-cache-delete');
	if (hasEventInCache("Troop Event", eventId))
		eCache.classList.remove('disabled');
	else
		eCache.classList.add('disabled');
	
	const eDiscard = contextmenu.querySelector('#troop-event-discard');
	if (isUnsaved("Troop Event", eventId))
		eDiscard.classList.remove('disabled');
	else
		eDiscard.classList.add('disabled');
	
	contextmenu.classList.remove('hidden');
	window._troopEventContextMenuOpened = true;
	
	const leftPanelRect = document.querySelector('#left-panel').getBoundingClientRect();
	const graphEditorRect = document.querySelector('#graphEditor').getBoundingClientRect();
	const contextMenuRect = contextmenu.getBoundingClientRect();
	
	const x = e.x + contextMenuRect.width > graphEditorRect.right ? e.x - (e.x + contextMenuRect.width - graphEditorRect.right) : e.x;
	const y = e.y + contextMenuRect.height > leftPanelRect.bottom ? e.y - (e.y + contextMenuRect.height - leftPanelRect.bottom) : e.y;
	contextmenu.style.left = `${x}px`;
	contextmenu.style.top = `${y}px`;
};

function hideTroopEventContextMenu() {
	const contextmenu = document.querySelector('#troop-event-contextmenu');
	if (!contextmenu)
		return;
	
	contextmenu.classList.add('hidden');
	
	window._troopEventContextMenuOpened = false;
};

function deleteTroopEventCache() {
	const contextmenu = document.querySelector('#troop-event-contextmenu');
	if (!contextmenu)
		return;
	
	const eventId = parseInt(contextmenu.getAttribute('data-eventId'));
	if (!eventId)
		return;
	
	if (!confirm(`Are you sure you want to clear this event's cache?\n\nThe editor will discard all cached data and rebuild the graph from the original RPG Maker event.\n\nWarning:\n• Unconnected nodes will be lost\n• Custom page names will be removed\n• Non-linear layouts will be rebuilt as linear flows\n• Some custom nodes may not be restored perfectly\n\nThis operation cannot be undone.`))
		return;
	
	$.Drag.VisualEvent.loadDataFile("Troops", (data) => {
		const troopEvent = data[eventId] ? $.Drag.VisualEvent.deepCopyJSON(data[eventId]) : $.Drag.VisualEvent.getDefaultTroopEvent();
		saveEventDataInCache(troopEvent, "Troop Event", 0, eventId);
		clearEventNodesCache("Troop Event", 0, eventId);
		setAsSaved("Troop Event", eventId);
		
		if (eventId === window.data.targetId && window.data.targetType === "Troop Event") {
			setGraphEditorScale(1);
			setGraphPosition(500, 200);
			reloadGraphEditor(window.data.targetId, window.data.targetType, 0);
		}
		
		refreshTroopEventList();
		hideTroopEventContextMenu();
	});
	
	
};

function discardTroopEventChanges() {
	const contextmenu = document.querySelector('#troop-event-contextmenu');
	if (!contextmenu)
		return;
	
	const eventId = parseInt(contextmenu.getAttribute('data-eventId'));
	if (!eventId)
		return;
	
	if (!confirm(`Are you sure you want to discard your changes?\n\nAll unsaved modifications to this event will be lost and the event will be reloaded from its last saved state.`))
		return;
	
	const reset = getEventCacheItem("_resetOnDiscard", "Troop Event", 0, eventId);
	const troopEvent = window.data.$dataTroops[eventId] ? $.Drag.VisualEvent.deepCopyJSON(window.data.$dataTroops[eventId]) : $.Drag.VisualEvent.getDefaultTroopEvent();
	saveEventDataInCache(troopEvent, "Troop Event", 0, eventId);
	
	if (reset)
		removeEventPagesFromCache("Troop Event", 0, eventId);
	else {
		for (let i = 0; i < troopEvent.pages.length; i++) {
			setAsSaved("Troop Event", eventId, 0, i);
			restoreEventNodesFromCache("Troop Event", 0, eventId, i);
		}
		removeEventPagesFromCache("Troop Event", 0, eventId, troopEvent.pages.length);
	}
	
	saveItemInEventCache("_resetOnDiscard", false, "Troop Event", 0, eventId);
	setAsSaved("Troop Event", eventId);
	
	refreshTroopEventList();
	hideTroopEventContextMenu();
	
	if (eventId === window.data.targetId && window.data.targetType === "Troop Event")
		reloadGraphEditor(window.data.targetId, window.data.targetType, 0);
};

function changeMaximumTroopEvents(element) {
	const maximum = parseInt(element.parentElement.querySelector('input').value);
	const eventCount = getTroopEventCount();
	
	if (maximum > eventCount) {
		const count = maximum - eventCount;
		for (let i = 1; i <= count; i++)
			if (!window.data.$dataCommonEvents[eventCount + i])
				window.data.$dataTroops[eventCount + i] = $.Drag.VisualEvent.getDefaultTroopEvent();
	} else if (maximum < eventCount)
		for (let i = maximum + 1; i <= eventCount; i++)
			clearTroopEvent(i);
	
	window._cache.graph["Troop Event"].count = maximum;
	
	if (window.data.targetId > maximum && window.data.targetType === "Troop Event")
		reloadGraphEditor(maximum, window.data.targetType);
	else
		refreshTroopEventList();
	
	hideTroopEventContextMenu();
};

function copyTroopEvent() {
	const contextmenu = document.querySelector('#troop-event-contextmenu');
	if (!contextmenu)
		return;
	
	const eventId = parseInt(contextmenu.getAttribute('data-eventId'));
	if (!eventId)
		return;
	
	window._copiedTroopEvent = $.Drag.VisualEvent.deepCopyJSON(window.data.$dataTroops[eventId] || $.Drag.VisualEvent.getDefaultTroopEvent());
	
	hideTroopEventContextMenu();
};

function pasteTroopEvent() {
	if (!window._copiedTroopEvent)
		return;
	
	const contextmenu = document.querySelector('#troop-event-contextmenu');
	if (!contextmenu)
		return;
	
	const eventId = parseInt(contextmenu.getAttribute('data-eventId'));
	if (!eventId)
		return;
	
	const copiedEvent = $.Drag.VisualEvent.deepCopyJSON(window._copiedTroopEvent);
	copiedEvent.id = eventId;
	
	setAsUnsaved("Troop Event", eventId);
	for (let i = 0; i < copiedEvent.pages.length; i++)
		setAsUnsaved("Troop Event", eventId, 0, i);
	
	saveEventDataInCache(copiedEvent, "Troop Event", 0, eventId);
	clearEventNodesCache("Troop Event", 0, eventId);
	
	if (eventId === window.data.targetId && window.data.targetType === "Troop Event")
		reloadGraphEditor(window.data.targetId, window.data.targetType);
	
	updateTroopEventListName(eventId);
	hideTroopEventContextMenu();
};

function clearTroopEvent(eventId = null) {
	if (eventId === null) {
		const contextmenu = document.querySelector('#troop-event-contextmenu');
		if (!contextmenu)
			return;
		eventId = parseInt(contextmenu.getAttribute('data-eventId'));
	}
	
	if (!eventId)
		return;
	
	if (!confirm(`Are you sure you want to clear this event?\n\nThis will remove all event commands and reset the event to its default empty state.\n\nCustom event page names will also be removed.\n\n`));
	
	setAsUnsaved("Troop Event", eventId);
	setAsUnsaved("Troop Event", eventId, 0, 0);
	
	const defaultTroopEvent = $.Drag.VisualEvent.getDefaultTroopEvent();
	defaultTroopEvent.id = eventId;

	removeEventPagesFromCache("Troop Event", 0, eventId, 1);
	clearEventNodesCache("Troop Event", 0, eventId);
	saveEventDataInCache(defaultTroopEvent, "Troop Event", 0, eventId);
	
	updateTroopEventListName(eventId, "");
	hideTroopEventContextMenu();
	
	if (eventId === window.data.targetId && window.data.targetType === "Troop Event")
		reloadGraphEditor(window.data.targetId, window.data.targetType);				
};

//map event
function showMapEventContextMenu(e) {
	const contextmenu = document.querySelector('#map-event-contextmenu');
	if (!contextmenu)
		return;
	
	const eEvent = e.path.find(elem => typeof elem.hasAttribute === "function" && elem.hasAttribute('data-eventId'));
	const eventId = eEvent ? eEvent.getAttribute('data-eventId') : 0;
	contextmenu.setAttribute('data-eventId', eventId);
	
	const eCreate = contextmenu.querySelector('#map-event-create');
	
	const locationInput = $.Drag.VisualEvent.getInputParameters('currentMapLocation');
	locationInput.mapId = window.data.mapTargetId;
	locationInput.value = [0, 0];
	eCreate.innerHTML = `<span style="margin-right: 10px;">New Event</span><div style="margin-right: 10px;">${$.Drag.VisualEvent.getInputField(locationInput)}</div><button onclick="createMapEvent(this);">OK</button></span>`;
	
	const eEdit = contextmenu.querySelector('#map-properties-edit');
	if (window.data.mapTargetId)
		eEdit.classList.remove('disabled');
	else
		eEdit.classList.add('disabled');
	
	const eActions = contextmenu.querySelector('#map-event-actions');
	eActions.innerHTML = `Map Event ${eventId} Actions`;
	
	const isDeleted = getEventCacheItem("deleted", "Map Event", window.data.mapTargetId, eventId);
	
	const eMove = contextmenu.querySelector('#map-event-move');
	if (!isDeleted && window.data.loadedMap && eventId) {
		eMove.classList.remove('disabled');
		locationInput.value = hasItemInEventCache("location", "Map Event", window.data.mapTargetId, eventId) ? getEventCacheItem("location", "Map Event", window.data.mapTargetId, eventId) : [window.data.loadedMap.events[eventId].x, window.data.loadedMap.events[eventId].y];
		eMove.innerHTML = `<span style="margin-right: 10px;">Move</span><div style="margin-right: 10px;">${$.Drag.VisualEvent.getInputField(locationInput)}</div><button data-eventId="${eventId}" onclick="updateEventLocation(this);">OK</button></span>`;
	} else {
		eMove.innerHTML = `<span class="disabled">Move</span>`;
	}
	
	const eCopy = contextmenu.querySelector('#map-event-copy');
	const ePaste = contextmenu.querySelector('#map-event-paste');
	const eCut = contextmenu.querySelector('#map-event-cut');
	const eDelete = contextmenu.querySelector('#map-event-delete');
	if (!isDeleted && eventId) {
		eMove.classList.remove('disabled');
		eCopy.classList.remove('disabled');
		if (window._copiedMapEvent)
			ePaste.classList.remove('disabled');
		else
			ePaste.classList.add('disabled');
		eCut.classList.remove('disabled');
		eDelete.classList.remove('disabled');
	} else {
		eMove.classList.add('disabled');
		eCopy.classList.add('disabled');
		ePaste.classList.add('disabled');
		eCut.classList.add('disabled');
		eDelete.classList.add('disabled');
	}
	
	const eCache = contextmenu.querySelector('#map-event-cache-delete');
	if (hasEventInCache("Map Event", eventId, window.data.mapTargetId))
		eCache.classList.remove('disabled');
	else
		eCache.classList.add('disabled');
	
	const eDiscard = contextmenu.querySelector('#map-event-discard');
	if (isDeleted || (eventId && isUnsaved("Map Event", eventId, window.data.mapTargetId)))
		eDiscard.classList.remove('disabled');
	else
		eDiscard.classList.add('disabled');
	
	contextmenu.classList.remove('hidden');
	window._mapEventContextMenuOpened = true;
	
	const leftPanelRect = document.querySelector('#left-panel').getBoundingClientRect();
	const graphEditorRect = document.querySelector('#graphEditor').getBoundingClientRect();
	const contextMenuRect = contextmenu.getBoundingClientRect();
	
	const x = e.x + contextMenuRect.width > graphEditorRect.right ? e.x - (e.x + contextMenuRect.width - graphEditorRect.right) : e.x;
	const y = e.y + contextMenuRect.height > leftPanelRect.bottom ? e.y - (e.y + contextMenuRect.height - leftPanelRect.bottom) : e.y;
	contextmenu.style.left = `${x}px`;
	contextmenu.style.top = `${y}px`;
};

function hideMapEventContextMenu() {
	const contextmenu = document.querySelector('#map-event-contextmenu');
	if (!contextmenu)
		return;
	
	contextmenu.classList.add('hidden');
	window._mapEventContextMenuOpened = false;
};

function openMapPropertiesMenu(input) {
	$.Drag.VisualEvent.openMapPropertiesMenu(input, window.data.mapTargetId);				
	hideMapEventContextMenu();
};

function deleteMapEventCache() {
	const contextmenu = document.querySelector('#map-event-contextmenu');
	if (!contextmenu)
		return;
	
	const eventId = parseInt(contextmenu.getAttribute('data-eventId'));
	if (!eventId || !window.data.mapTargetId)
		return;
	
	if (!confirm(`Are you sure you want to clear this event's cache?\n\nThe editor will discard all cached data and rebuild the graph from the original RPG Maker event.\n\nWarning:\n• Unconnected nodes will be lost\n• Custom page names will be removed\n• Non-linear layouts will be rebuilt as linear flows\n• Some custom nodes may not be restored perfectly\n\nThis operation cannot be undone.`))
		return;
	
	$.Drag.VisualEvent.loadDataFile($.Drag.VisualEvent.getMapFileName(window.data.mapTargetId), (data) => {
		const mapEvent = data.events[eventId] ? $.Drag.VisualEvent.deepCopyJSON(data.events[eventId]) : $.Drag.VisualEvent.getDefaultMapEvent();
		clearEventNodesCache("Map Event", window.data.mapTargetId, eventId);
		saveEventDataInCache(mapEvent, "Map Event", window.data.mapTargetId, eventId);
		deleteEventCache("Map Event", window.data.mapTargetId, eventId);
		setAsSaved("Map Event", eventId, window.data.mapTargetId);
		
		if (eventId === window.data.targetId && window.data.targetType === "Map Event") {
			reloadGraphEditor(window.data.targetId, window.data.targetType, 0);
			setGraphEditorScale(1);
			setGraphPosition(500, 200);
		}
		
		refreshMapEventList();
		hideMapEventContextMenu();
	});
};

function discardMapEventChanges() {
	const contextmenu = document.querySelector('#map-event-contextmenu');
	if (!contextmenu)
		return;
	
	const eventId = parseInt(contextmenu.getAttribute('data-eventId'));
	if (!eventId)
		return;
	
	if (!confirm(`Are you sure you want to discard your changes?\n\nAll unsaved modifications to this event will be lost and the event will be reloaded from its last saved state.`))
		return;
	
	const reset = getEventCacheItem("_resetOnDiscard", "Map Event", window.data.mapTargetId, eventId);
	const mapEvent = window.data.loadedMap.events[eventId] ? $.Drag.VisualEvent.deepCopyJSON(window.data.loadedMap.events[eventId]) : $.Drag.VisualEvent.getDefaultMapEvent();
	saveEventDataInCache(mapEvent, "Map Event", window.data.mapTargetId, eventId);
	
	if (reset)
		removeEventPagesFromCache("Map Event", window.data.mapTargetId, eventId);
	else {
		for (let i = 0; i < mapEvent.pages.length; i++) {
			setAsSaved("Map Event", eventId, window.data.mapTargetId, i);
			restoreEventNodesFromCache("Map Event", window.data.mapTargetId, eventId, i);
		}
		removeEventPagesFromCache("Map Event", window.data.mapTargetId, eventId, mapEvent.pages.length);
	}
	
	saveItemInEventCache("_resetOnDiscard", false, "Map Event", window.data.mapTargetId, eventId);
	saveItemInEventCache("deleted", false, "Map Event", window.data.mapTargetId, eventId);
	setAsSaved("Map Event", eventId, window.data.mapTargetId);
	
	refreshMapEventList();
	hideMapEventContextMenu();
	
	if (eventId === window.data.targetId && window.data.targetType === "Map Event")
		reloadGraphEditor(window.data.targetId, window.data.targetType, 0);
};

function clearMapEvent(eventId = null) {
	if (eventId === null) {
		const contextmenu = document.querySelector('#map-event-contextmenu');
		if (!contextmenu)
			return;
		eventId = parseInt(contextmenu.getAttribute('data-eventId'));
	}
	
	if (!eventId)
		return;
	
	if (!confirm(`Are you sure you want to clear this event?\n\nThis will remove all event commands and reset the event to its default empty state.\n\nCustom event page names will also be removed.\n\n`));
	
	setAsUnsaved("Map Event", eventId);
	setAsUnsaved("Map Event", eventId, window.data.mapTargetId, 0);
	
	const defaultMapEvent = $.Drag.VisualEvent.getDefaultMapEvent();
	defaultMapEvent.id = eventId;

	removeEventPagesFromCache("Map Event", window.data.mapTargetId, eventId, 1);
	clearEventNodesCache("Map Event", window.data.mapTargetId, eventId);
	saveEventDataInCache(defaultMapEvent, "Map Event", window.data.mapTargetId, eventId);
	
	updateMapEventListName(eventId, "");
	hideMapEventContextMenu();
	
	if (eventId === window.data.targetId && window.data.targetType === "Map Event")
		reloadGraphEditor(window.data.targetId, window.data.targetType, 0);	
};

function createMapEvent(button) {
	const input = button.parentElement.querySelector('input');
	const value = $.Drag.VisualEvent.getInputValue(input);
	
	const cacheMaxId = getCacheMaxEventId("Map Event", window.data.mapTargetId) + 1;
	const dataMaxId = window.data.loadedMap.events.length;
	const id = Math.max(cacheMaxId, dataMaxId)
	
	const ev = $.Drag.VisualEvent.getDefaultMapEvent();
	ev.id = id;
	ev.x = value[0];
	ev.y = value[1];
	ev.name = `EV${String(id).padStart(3, "0")}`;
	
	saveEventDataInCache(ev, "Map Event", window.data.mapTargetId, ev.id);
	setAsUnsaved("Map Event", ev.id, window.data.mapTargetId, null, false);
	
	refreshMapEventList();
	hideMapEventContextMenu();
	
	selectEvent(document.querySelector(`#map-event-list > *[data-eventid="${id}"]`));
};

function updateEventLocation(button) {
	const eventId = parseInt(button.getAttribute('data-eventId'));
	if (!eventId)
		return;
	
	const input = button.parentElement.querySelector('input');
	const [x, y] = $.Drag.VisualEvent.getInputValue(input);
	
	setMapEventLocation(window.data.mapTargetId, eventId, x, y);
	
	hideMapEventContextMenu();
};

function copyMapEvent() {				
	const contextmenu = document.querySelector('#map-event-contextmenu');
	if (!contextmenu)
		return;
	
	const eventId = parseInt(contextmenu.getAttribute('data-eventId'));
	if (!eventId)
		return;
	
	window._copiedMapEvent = $.Drag.VisualEvent.deepCopyJSON(window.data.loadedMap.events[eventId] || $.Drag.VisualEvent.getDefaultMapEvent());
	
	hideMapEventContextMenu();
};

function pasteMapEvent() {
	if (!window._copiedMapEvent)
		return;
	
	const contextmenu = document.querySelector('#map-event-contextmenu');
	if (!contextmenu)
		return;
	
	const eventId = parseInt(contextmenu.getAttribute('data-eventId'));
	if (!eventId)
		return;
	
	const copiedEvent = $.Drag.VisualEvent.deepCopyJSON(window._copiedMapEvent);
	copiedEvent.id = eventId;
	
	setAsUnsaved("Map Event", eventId, window.data.mapTargetId);
	for (let i = 0; i < copiedEvent.pages.length; i++)
		setAsUnsaved("Map Event", eventId, window.data.mapTargetId, i);
	
	saveEventDataInCache(copiedEvent, "Map Event", window.data.mapTargetId, eventId);
	clearEventNodesCache("Map Event", window.data.targetId, eventId);
	
	updateMapEventListName(eventId);
	hideMapEventContextMenu();
	
	if (eventId === window.data.targetId && window.data.targetType === "Map Event")
		reloadGraphEditor(window.data.targetId, window.data.targetType);
};

function deleteMapEvent() {
	const contextmenu = document.querySelector('#map-event-contextmenu');
	if (!contextmenu)
		return;
	
	const eventId = parseInt(contextmenu.getAttribute('data-eventId'));
	if (!eventId)
		return;
	
	if (!confirm(`Are you sure you want to delete this map event?\n\nThis will remove the entire event from the current map, including all pages, commands and settings.\n\nThis operation cannot be undone.`))
		return;
	
	deleteEventCache("Map Event", window.data.mapTargetId, eventId);
	clearEventNodesCache("Map Event", window.data.mapTargetId, eventId);
	window.data.loadedMap.events[eventId] = null;
	
	save(false, "Map Event", window.data.mapTargetId, eventId)
	removeFromMapEventList(eventId);
	
	refreshMapEventList();
	hideMapEventContextMenu();
	
	if (eventId === window.data.targetId && window.data.targetType === "Map Event")
		reloadGraphEditor(0, "");
};

function cutMapEvent() {
	copyMapEvent();
	deleteMapEvent();
};