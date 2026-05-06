function setupEventList() {
	const start = performance.now();
	const eventContainer = document.querySelector('#event-container');
	
	const expandedCount = window._cache.editor.eventListCollapsed ? Object.values(window._cache.editor.eventListCollapsed).reduce((acc, val) => val ? acc - 1 : acc, 3) : 3;
	eventContainer.style.setProperty('--expanded-event-list-count', expandedCount);
	
	eventContainer.innerHTML = `
		<div id="common-event-container" data-collapsed="${!!(window._cache.editor.eventListCollapsed && window._cache.editor.eventListCollapsed['common-event'])}">
			<h2 onclick="toggleEventList('common-event');">
				<span>Common Events</span>
				<span>&#10097;</span>
			</h2>
			<div id="common-event-search">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="25px" height="25px">
					<circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" fill="none"/>
					<line x1="16.5" y1="16.5" x2="22" y2="22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
				</svg>
				<input type="text" placeholder="Search Common Event..." data-eventType="Common Event" onchange="searchEvent(this);" onkeyup="this.onchange();" onpaste="this.onchange();" oninput="this.onchange();"/>
			</div>
			<div id="common-event-select">
				${getCommonEventSelect()}
			</div>
			<div id="common-event-list">
				${getCommonEventList()}
			</div>
		</div>
		<div id="map-event-container" data-collapsed="${!!(window._cache.editor.eventListCollapsed && window._cache.editor.eventListCollapsed['map-event'])}">
			<h2 onclick="toggleEventList('map-event');">
				<span>Map Events</span>
				<span>&#10097;</span>
			</h2>
			<div class="select">
				<select id="mapList" onchange="loadMapData(parseInt(this.value));">
					<option value="0" disabled selected hidden>Select a map</option>
					${
						$.Drag.VisualEvent.getMapList().map(map => {
							const currentMapId = $.Drag.VisualEvent.getCurrentMapId();
							const mapId = parseInt(map.replace(/^\D+/g, ''));
							const mapName = $.Drag.VisualEvent.getMapName(mapId);
							return `<option value="${mapId}" ${currentMapId === mapId ? 'selected' : ''}>${map.replace('.json', '')}: ${mapName}</option>`;
						}).join("")
					}
				</select>
				<span class="focus"></span>
			</div>
			<div id="map-event-search">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="25px" height="25px">
					<circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" fill="none"/>
					<line x1="16.5" y1="16.5" x2="22" y2="22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
				</svg>
				<input type="text" placeholder="Search Map Event..." data-eventType="Map Event" onchange="searchEvent(this);" onkeyup="this.onchange();" onpaste="this.onchange();" oninput="this.onchange();"/>
			</div>
			<div id="map-event-select"></div>
			<div id="map-event-list"></div>
		</div>
		<div id="troop-event-container" data-collapsed="${!!(window._cache.editor.eventListCollapsed && window._cache.editor.eventListCollapsed['troop-event'])}">
			<h2 onclick="toggleEventList('troop-event');">
				<span>Troop Events</span>
				<span>&#10097;</span>
			</h2>
			<div id="troop-event-search">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="25px" height="25px">
					<circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" fill="none"/>
					<line x1="16.5" y1="16.5" x2="22" y2="22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
				</svg>
				<input type="text" placeholder="Search Troop Event..." data-eventType="Troop Event" onchange="searchEvent(this);" onkeyup="this.onchange();" onpaste="this.onchange();" oninput="this.onchange();"/>
			</div>
			<div id="troop-event-select">
				${getTroopEventSelect()}
			</div>
			<div id="troop-event-list">
				${getTroopEventList()}
			</div>
		</div>
	`;
	
	const mapList = document.querySelector('#mapList');
	if (mapList.value !== "0")
		loadMapData(parseInt(mapList.value));
	
	console.log(`Event list setup completed in ${performance.now() - start}ms`);
};

function toggleEventList(type) {
	if (!type)
		return;
	
	const list = document.querySelector(`#${type}-container`);
	const collapsed = !(list.getAttribute('data-collapsed') === "true");
	list.setAttribute('data-collapsed', collapsed);
	
	const eventContainer = document.querySelector('#event-container');
	const expandedCount = parseInt(getComputedStyle(eventContainer).getPropertyValue('--expanded-event-list-count'));
	eventContainer.style.setProperty('--expanded-event-list-count', collapsed ? expandedCount - 1 : expandedCount + 1);
	
	if (!window._cache.editor.eventListCollapsed)
		window._cache.editor.eventListCollapsed = {};
	window._cache.editor.eventListCollapsed[type] = collapsed;
};

function makeMapEventList(data = window.data.loadedMap) {
	const mapEventList = document.querySelector('#map-event-list');		
	const mapEventSelect = document.querySelector('#map-event-select');	
	
	if (!data) {
		mapEventList.innerHTML = ``;
		mapEventSelect.innerHTML = ``;
		return;
	}
	
	const mapList = document.querySelector('#mapList');
	mapList.value = window.data.mapTargetId;
	
	mapEventSelect.innerHTML = getMapEventSelect(data);
	
	const mapEventCount = getMapEventCount(data);
	const min = Math.max(Math.floor((window.data.targetId - 1) / 100) * 100, 0) + 1;
	const max = Math.min(min + 99, mapEventCount);
	const list = getRangedMapEventList(min, max, data);
	mapEventList.innerHTML = list;
};

function getMapEventSelect(data = window.data.loadedMap) {
	const value = window.data.targetId && window.data.targetType === "Map Event" ? Math.max(Math.floor((window.data.targetId - 1) / 100), 0) : 0;
	return $.Drag.VisualEvent.getInputField({type: "select", options: getMapEventSelectOptions(), value: value, onchange: "onMapEventSelectChange(this);"});
};

function getMapEventCount(data = window.data.loadedMap) {
	if (!data)
		return 0;
	
	const maxMapEventId = data.events.reduce((maxId, ev) => ev ? Math.max(ev.id, maxId) : maxId, 0);
	const maxCacheEventId = getCacheMaxEventId("Map Event", window.data.mapTargetId);
	return Math.max(maxMapEventId, maxCacheEventId);
};

function getMapEventSelectOptions(data = window.data.loadedMap) {
	const mapEventCount = Math.ceil(getMapEventCount() / 100);
	const mapEventOptions = [];
	for (let i = 0; i <= mapEventCount - 1; i++)
		mapEventOptions.push(`${i * 100} - ${(i * 100) + 100}`);
	return mapEventOptions;
};

function onMapEventSelectChange(select) {
	setTimeout(() => {
		const mapEventCount = getMapEventCount();
		const mapEventList = document.querySelector('#map-event-list');
		const min = parseInt(select.value) * 100;
		const max = Math.min(min + 100, mapEventCount);
		mapEventList.innerHTML = getRangedMapEventList(min, max);
	}, 1);
};

function getRangedMapEventList(min = 1, max = min + 100, data = window.data.loadedMap) {
	if (!data)
		return "";
	
	let list = "";
	for (let i = min; i <= max; i++) {
		if (hasItemInEventCache("deleted", "Map Event", window.data.mapTargetId, i) && getEventCacheItem("deleted", "Map Event", window.data.mapTargetId, i))
			list += `
				<div class="selectable" data-eventId="${i}" data-eventType="Map Event" data-unsaved="true">
					<span class="red">DELETED</span>
				</div>
			`;
		else if (hasEventInCache("Map Event", i, window.data.mapTargetId) || data.events[i])
			list += `
				<div class="${i === window.data.targetId && window.data.targetType === "Map Event" ? 'selected' : ''} selectable" 
					data-eventId="${i}" data-eventType="Map Event" ${isUnsaved("Map Event", i, window.data.mapTargetId) ? 'data-unsaved="true"' : ''} onclick="selectEvent(this);">
					${String(i).padStart(3, "0")} ${(hasItemInEventCache("data", "Map Event", window.data.mapTargetId, i) ? getEventCacheItem("data", "Map Event",  window.data.mapTargetId, i).name : data.events[i].name) || '<span class="red">No name</span>'}
				</div>
			`;
	}
	return list;
};

function refreshMapEventList() {
	makeMapEventList();
};

function getCommonEventSelect() {
	const value = window.data.targetId && window.data.targetType === "Common Event" ? Math.max(Math.floor((window.data.targetId - 1) / 100), 0) : 0;
	return $.Drag.VisualEvent.getInputField({type: "select", options: getCommonEventSelectOptions(), value: value, onchange: "onCommonEventSelectChange(this);"});
};

function getCommonEventCount() {
	return window._cache.graph["Common Event"].ceCount ? window._cache.graph["Common Event"].ceCount : window.data.$dataCommonEvents.length - 1;
};

function getCommonEventSelectOptions() {
	const commonEventCount = Math.ceil(getCommonEventCount() / 100);
	const commonEventOptions = [];
	for (let i = 0; i <= commonEventCount - 1; i++)
		commonEventOptions.push(`${i * 100 + 1} - ${(i * 100) + 100}`);
	return commonEventOptions;
};

function onCommonEventSelectChange(select) {
	requestAnimationFrame(() => {
		const commonEventCount = getCommonEventCount();
		const commonEventList = document.querySelector('#common-event-list');
		const min = parseInt(select.value) * 100 + 1;
		const max = Math.min(min + 99, commonEventCount);
		commonEventList.innerHTML = getRangedCommonEventList(min, max);
	});
};

function getCommonEventList() {			
	const start = performance.now();
	const commonEventCount = getCommonEventCount();
	const min = Math.max(Math.floor((window.data.targetId - 1) / 100) * 100, 0) + 1;
	const max = Math.min(min + 99, commonEventCount);
	const list = getRangedCommonEventList(min, max);
	console.log(`Common event list built in ${performance.now() - start}ms`);
	return list;
};

function getRangedCommonEventList(min = 1, max = min + 100) {
	let list = "";
	for (let i = Math.max(min, 1); i <= max; i++)
		list += `
			<div class="${i === window.data.targetId && window.data.targetType === "Common Event" ? 'selected' : ''} selectable" 
				data-eventId="${i}" data-eventType="Common Event" ${isUnsaved("Common Event", i) ? 'data-unsaved="true"' : ''} onclick="selectEvent(this);">
				${String(i).padStart(4, "0")} 
				${(hasItemInEventCache("data", "Common Event", 0, i) ? getEventCacheItem("data", "Common Event", 0, i).name : window.data.$dataCommonEvents[i] ? window.data.$dataCommonEvents[i].name : "") || '<span class="red">No name</span>'}
			</div>
		`;
	return list;
};

function refreshCommonEventList() {
	document.querySelector('#common-event-select').innerHTML = getCommonEventSelect();
	document.querySelector('#common-event-list').innerHTML = getCommonEventList();
};

function getTroopEventSelect() {
	const value = window.data.targetId && window.data.targetType === "Troop Event" ? Math.max(Math.floor((window.data.targetId - 1) / 100), 0) : 0;
	return $.Drag.VisualEvent.getInputField({type: "select", options: getTroopEventSelectOptions(), value: value, onchange: "onTroopEventSelectChange(this);"});
};

function getTroopEventCount() {
	return window._cache.graph["Troop Event"].count ? window._cache.graph["Troop Event"].count : window.data.$dataTroops.length - 1;
};

function getTroopEventSelectOptions() {
	const troopEventCount = Math.ceil(getTroopEventCount() / 100);
	const troopEventOptions = [];
	for (let i = 0; i <= troopEventCount - 1; i++)
		troopEventOptions.push(`${i * 100 + 1} - ${(i * 100) + 100}`);
	return troopEventOptions;
};

function onTroopEventSelectChange(select) {
	requestAnimationFrame(() => {
		const troopEventCount = getTroopEventCount();
		const troopEventList = document.querySelector('#troop-event-list');
		const min = parseInt(select.value) * 100 + 1;
		const max = Math.min(min + 99, troopEventCount);
		troopEventList.innerHTML = getRangedTroopEventList(min, max);
	});
};

function getTroopEventList() {
	const start = performance.now();
	const troopEventCount = getTroopEventCount();
	const min = Math.max(Math.floor((window.data.targetId - 1) / 100) * 100, 0) + 1;
	const max = Math.min(min + 99, troopEventCount);
	list = getRangedTroopEventList(min, max);
	console.log(`Troop event list built in ${performance.now() - start}ms`);
	return list;
};

function getRangedTroopEventList(min = 1, max = min + 100) {
	let list = "";
	for (let i = Math.max(min, 1); i <= max; i++)
		list += `
			<div class="${i === window.data.targetId && window.data.targetType === "Troop Event" ? 'selected' : ''} selectable" 
				data-eventId="${i}" data-eventType="Troop Event" ${isUnsaved("Troop Event", i) ? 'data-unsaved="true"' : ''} onclick="selectEvent(this);">
				${String(i).padStart(4, "0")} 
				${(hasItemInEventCache("data", "Troop Event", 0, i) ? getEventCacheItem("data", "Troop Event", 0, i).name : window.data.$dataTroops[i] ? window.data.$dataTroops[i].name : "") || '<span class="red">No name</span>'}
			</div>
		`;
	return list;
};

function refreshTroopEventList() {
	document.querySelector('#troop-event-select').innerHTML = getTroopEventSelect();
	document.querySelector('#troop-event-list').innerHTML = getTroopEventList();
};

function searchEvent(input) {
	if (!input)
		return;
	
	const evType = input.getAttribute('data-eventType')
	const list = evType === "Common Event" ? document.querySelector('#common-event-list') : evType === "Map Event" ? document.querySelector('#map-event-list') : document.querySelector('#troop-event-list');
	if (!list)
		return;
	
	const value = input.value.toLowerCase().trim();
	for (const ev of list.querySelectorAll('div'))
		if (ev.innerHTML.toLowerCase().includes(input.value))
			ev.classList.remove('hidden')
		else 
			ev.classList.add('hidden');
};

function updateEventName(name = "", type = window.data.targetType, id = window.data.targetId) {
	const eventElement = document.querySelector(`#event-container div[data-eventType="${type}"][data-eventId="${id}"]`);
	if (eventElement)
		eventElement.innerHTML = `${String(id).padStart(4, '0')} ${name || "<span class='red'>No name</span>"}`;
};

function updateEventNote(input) {
	input.querySelector('#map-event-notes').value = window.data.loadedMap.events[window.data.targetId].note;
	setAsUnsaved(window.data.targetType, window.data.targetId, window.data.mapTargetId, null);
	saveItemInEventCache("note", window.data.loadedMap.events[window.data.targetId].note, window.data.targetType, window.data.mapTargetId, window.data.targetId);
};

function updateCommonEventListName(eventId = 0, name = null) {
	if (!eventId)
		return;
	
	const ce = document.querySelector('#common-event-list').querySelector(`*[data-eventId="${eventId}"]`);
	if (!ce)
		return;
	
	if (name === null)
		name = (hasItemInEventCache("data", "Common Event", 0, eventId) ? getEventCacheItem("data", "Common Event", 0, eventId).name : window.data.$dataCommonEvents[eventId].name) || "<span class='red'>No name</span>";
	
	ce.innerHTML = `${String(eventId).padStart(4, "0")} ${name}`;
};

function updateTroopEventListName(eventId = 0, name = null) {
	if (!eventId)
		return;
	
	const ce = document.querySelector('#troop-event-list').querySelector(`*[data-eventId="${eventId}"]`);
	if (!ce)
		return;
	
	if (name === null)
		name = (hasItemInEventCache("data", "Troop Event", 0, eventId) ? getEventCacheItem("data", "Troop Event", 0, eventId).name : window.data.$dataTroops[eventId].name) || "<span class='red'>No name</span>";
	
	ce.innerHTML = `${String(eventId).padStart(4, "0")} ${name}`;
};

function updateMapEventListName(eventId = 0, name = null) {
	if (!eventId)
		return;
	
	const e = document.querySelector('#map-event-list').querySelector(`*[data-eventId="${eventId}"]`);
	if (!e)
		return;
	
	if (getEventCacheItem("deleted", "Map Event", window.data.mapTargetId, eventId))
		return e.innerHTML = "<span class='red'>DELETED</span>";
	
	if (name === null)
		name = (hasItemInEventCache("data", "Map Event", window.data.mapTargetId, eventId) ? getEventCacheItem("data", "Map Event", window.data.mapTargetId, eventId).name : window.data.loadedMap.events[eventId].name);
	
	e.innerHTML = `${String(eventId).padStart(3, "0")} ${name}`;
};

function removeFromMapEventList(eventId) {
	if (!eventId)
		return;
	
	const e = document.querySelector('#map-event-list').querySelector(`*[data-eventId="${eventId}"]`);
	if (!e)
		return;
	
	e.remove();
};

function selectEvent(div) {
	if (!div)
		return;
	
	showLoading();
	setLoadingText("Saving event in cache...");
	// setLoadingText("Loading event...");
	
	requestAnimationFrame(() => {
		requestAnimationFrame(() => {
			// if (!window._graphReady)
				// return selectEvent(div);
			
			ensureLeftPanelSelection(div);
			saveEventInCache();
			
			const eventId = parseInt(div.getAttribute('data-eventId'));
			const eventType = div.getAttribute('data-eventType');
			const pageId = hasItemInEventCache("lastPage", eventType, window.data.mapTargetId, eventId) ? getEventCacheItem("lastPage", eventType, window.data.mapTargetId, eventId) : 0;
			
			setLoadingText("Loading event...");
			reloadGraphEditor(eventId, eventType, pageId, true);
		});
	});
};

function ensureLeftPanelSelection(target) {
	const eventContainer = document.querySelector('#event-container');
	for (const selected of eventContainer.querySelectorAll('.selected'))
		selected.classList.remove('selected');
	
	if (!target)
		target = getLeftPanelEventTarget();
	
	if (target)
		target.classList.add('selected');
};

function getLeftPanelEventTarget() {
	switch (window.data.targetType) {
		case "Common Event":
			return document.querySelector(`#left-panel #common-event-list > div[data-eventId="${window.data.targetId}"]`);
		case "Map Event":
			return document.querySelector(`#left-panel #map-event-list > div[data-eventId="${window.data.targetId}"]`);
		case "Troop Event":
			return document.querySelector(`#left-panel #troop-event-list > div[data-eventId="${window.data.targetId}"]`);
		default:
			return null;
	}
};

function isEventSelected(type = window.data.targetType, mapId = window.data.mapTargetId, eventId = window.data.targetId, pageId = window.data.pageId) {
	if (window.data.targetType !== type)
		return false;
	
	switch (type) {
		case "Common Event":
			return window.data.targetId === eventId;
			break;
		case "Map Event":
			return window.data.mapTargetId === mapId && window.data.targetId === eventId && window.data.pageId === pageId;
			break;
		case "Troop Event":
			return window.data.targetId === eventId && window.data.pageId === pageId;
			break;
	};
	
	return false;
};