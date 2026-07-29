const EVENT_LIST_DEFAULT_GROUP_ID = "default";
const EVENT_LIST_DEFAULT_GROUP_NAME = "Default";
const EVENT_LIST_VIRTUAL_OVERSCAN = 4;
const EVENT_LIST_VIRTUAL_ROW_EM = 2.7;

function setupEventList() {
	const start = performance.now();
	const eventContainer = document.querySelector('#event-container');

	makeEventListGroupListeners();
	const resizeObserver = getEventListVirtualResizeObserver();
	if (resizeObserver)
		for (const viewport of eventContainer.querySelectorAll('.event-list-virtual-viewport'))
			resizeObserver.unobserve(viewport);

	const mapEntries = $.Drag.VisualEvent.getMapList().map(filename => {
		const mapId = parseInt(filename.replace(/^\D+/g, ''));
		return {
			filename: filename,
			mapId: mapId,
			name: $.Drag.VisualEvent.getMapName(mapId)
		};
	});
	const initialMapState = getInitialMapListState(mapEntries.map(entry => entry.mapId));
	const collapsedLists = window._cache.editor.eventListCollapsed || {};
	const expandedCount = Object.values(collapsedLists).reduce((count, collapsed) => collapsed ? count - 1 : count, 3);

	eventContainer.style.setProperty('--expanded-event-list-count', expandedCount);
	eventContainer.innerHTML = `
		<div id="common-event-container" data-collapsed="${!!collapsedLists['common-event']}">
			<h2 onclick="toggleEventList('common-event');">
				<span>Common Events</span>
				<span>&#10097;</span>
			</h2>
			${makeEventListSearchHTML("Common Event", "Common Event")}
			<div id="common-event-list" onscroll="saveEventListScrollInCache(this, 'common-event')">
				${getCommonEventList()}
			</div>
		</div>

		<div id="map-event-container" data-collapsed="${!!collapsedLists['map-event']}">
			<h2 onclick="toggleEventList('map-event');">
				<span>Map Events</span>
				<span>&#10097;</span>
			</h2>
			<div class="select">
				<select id="mapList" onchange="loadMapData(parseInt(this.value));">
					<option value="0" disabled ${initialMapState.mapId ? '' : 'selected'} hidden>Select a map</option>
					${mapEntries.map(entry => `
						<option value="${entry.mapId}" ${initialMapState.mapId === entry.mapId ? 'selected' : ''}>
							${entry.filename.replace('.json', '')}: ${entry.name}
						</option>
					`).join("")}
				</select>
				<span class="focus"></span>
			</div>
			${makeEventListSearchHTML("Map Event", "Map Event")}
			<div id="map-event-list" onscroll="saveEventListScrollInCache(this, 'map-event')"></div>
		</div>

		<div id="troop-event-container" data-collapsed="${!!collapsedLists['troop-event']}">
			<h2 onclick="toggleEventList('troop-event');">
				<span>Troop Events</span>
				<span>&#10097;</span>
			</h2>
			${makeEventListSearchHTML("Troop Event", "Troop Event")}
			<div id="troop-event-list" onscroll="saveEventListScrollInCache(this, 'troop-event')">
				${getTroopEventList()}
			</div>
		</div>
	`;

	initializeEventListVirtualGroups(document.querySelector('#common-event-list'));
	initializeEventListVirtualGroups(document.querySelector('#troop-event-list'));

	if (initialMapState.mapId && !initialMapState.deferToLastEvent)
		loadMapData(initialMapState.mapId);

	restoreEventListScrollFromCache();
	console.log(`Event list setup completed in ${performance.now() - start}ms`);
};

function makeEventListSearchHTML(eventType, label) {
	const id = eventType === "Common Event" ? "common-event-search" : eventType === "Map Event" ? "map-event-search" : "troop-event-search";
	return `
		<div id="${id}">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="25px" height="25px">
				<circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" fill="none"/>
				<line x1="16.5" y1="16.5" x2="22" y2="22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
			</svg>
			<input type="text" placeholder="Search ${label}..." data-eventType="${eventType}"
				onchange="searchEvent(this);" onkeyup="this.onchange();" onpaste="this.onchange();" oninput="this.onchange();"/>
		</div>
	`;
};

function getInitialMapListState(mapIds) {
	const hasMap = mapId => mapId > 0 && mapIds.includes(mapId);
	const lastEvent = getLastEventFromCache();
	const lastEventMapId = lastEvent.targetType === "Map Event" ? parseInt(lastEvent.mapId) || 0 : 0;

	if (hasMap(lastEventMapId))
		return {mapId: lastEventMapId, deferToLastEvent: true};

	const cachedMapId = getLastMapFromCache();
	if (hasMap(cachedMapId))
		return {mapId: cachedMapId, deferToLastEvent: false};

	const currentMapId = parseInt($.Drag.VisualEvent.getCurrentMapId()) || 0;
	if (hasMap(currentMapId))
		return {mapId: currentMapId, deferToLastEvent: false};

	return {mapId: 0, deferToLastEvent: false};
};

//-------------------------------------------------------------------------------------------------------
// GROUP CACHE

function getEventListGroupCache() {
	if (!window._cache.editor.eventListGroups) {
		window._cache.editor.eventListGroups = {
			common: null,
			troop: null,
			maps: {}
		};
	}

	const cache = window._cache.editor.eventListGroups;
	if (!cache.maps || typeof cache.maps !== "object")
		cache.maps = {};
	return cache;
};

function makeDefaultEventListOrganization() {
	return {
		nextGroupId: 1,
		defaultCollapsed: false,
		activeGroupId: EVENT_LIST_DEFAULT_GROUP_ID,
		groups: []
	};
};

function getEventListOrganization(eventType, mapId = window.data.mapTargetId) {
	const cache = getEventListGroupCache();
	let organization;

	if (eventType === "Common Event") {
		if (!cache.common || typeof cache.common !== "object")
			cache.common = makeDefaultEventListOrganization();
		organization = cache.common;
	} else if (eventType === "Troop Event") {
		if (!cache.troop || typeof cache.troop !== "object")
			cache.troop = makeDefaultEventListOrganization();
		organization = cache.troop;
	} else if (eventType === "Map Event") {
		mapId = parseInt(mapId) || 0;
		if (!cache.maps[mapId] || typeof cache.maps[mapId] !== "object")
			cache.maps[mapId] = makeDefaultEventListOrganization();
		organization = cache.maps[mapId];
	} else {
		return makeDefaultEventListOrganization();
	}

	normalizeEventListOrganization(organization);
	return organization;
};

function normalizeEventListOrganization(organization) {
	if (!organization || typeof organization !== "object")
		return;

	if (!Array.isArray(organization.groups))
		organization.groups = [];

	let nextGroupId = Math.max(parseInt(organization.nextGroupId) || 1, 1);
	const usedGroupIds = new Set();
	const usedNames = new Set([EVENT_LIST_DEFAULT_GROUP_NAME.toLowerCase()]);
	const assignedIds = new Set();
	const groups = [];

	for (const source of organization.groups) {
		if (!source || typeof source !== "object")
			continue;

		let id = typeof source.id === "string" ? source.id : "";
		while (!id || id === EVENT_LIST_DEFAULT_GROUP_ID || usedGroupIds.has(id))
			id = `group-${nextGroupId++}`;

		const numericId = parseInt(id.replace(/^\D+/g, ''));
		if (numericId)
			nextGroupId = Math.max(nextGroupId, numericId + 1);

		let name = normalizeEventListGroupName(source.name);
		if (!name || name.toLowerCase() === EVENT_LIST_DEFAULT_GROUP_NAME.toLowerCase())
			name = `Group ${nextGroupId}`;

		const baseName = name;
		let suffix = 2;
		while (usedNames.has(name.toLowerCase()))
			name = `${baseName} (${suffix++})`;

		const eventIds = [];
		for (const value of Array.isArray(source.eventIds) ? source.eventIds : []) {
			const eventId = parseInt(value);
			if (!eventId || eventId < 1 || assignedIds.has(eventId))
				continue;
			assignedIds.add(eventId);
			eventIds.push(eventId);
		}

		usedGroupIds.add(id);
		usedNames.add(name.toLowerCase());
		groups.push({
			id: id,
			name: name,
			collapsed: !!source.collapsed,
			eventIds: eventIds
		});
	}

	organization.nextGroupId = nextGroupId;
	organization.defaultCollapsed = !!organization.defaultCollapsed;
	organization.groups = groups;
	if (organization.activeGroupId !== EVENT_LIST_DEFAULT_GROUP_ID &&
		!groups.some(group => group.id === organization.activeGroupId))
		organization.activeGroupId = EVENT_LIST_DEFAULT_GROUP_ID;
};

function normalizeEventListGroupName(name) {
	return String(name || "").trim().replace(/\s+/g, ' ').slice(0, 64);
};

function getEventListGroupById(organization, groupId) {
	if (!organization || groupId === EVENT_LIST_DEFAULT_GROUP_ID)
		return null;
	return organization.groups.find(group => group.id === groupId) || null;
};

function isEventListGroupNameAvailable(organization, name, excludedGroupId = null) {
	const normalized = normalizeEventListGroupName(name).toLowerCase();
	if (!normalized || normalized === EVENT_LIST_DEFAULT_GROUP_NAME.toLowerCase())
		return false;
	return !organization.groups.some(group => group.id !== excludedGroupId && group.name.toLowerCase() === normalized);
};

function createEventListGroupId(organization) {
	let id;
	do {
		id = `group-${organization.nextGroupId++}`;
	} while (organization.groups.some(group => group.id === id));
	return id;
};

//-------------------------------------------------------------------------------------------------------
// VIRTUAL GROUP MODELS AND RENDERING

function getEventListVirtualModels() {
	if (!window._eventListVirtualModels)
		window._eventListVirtualModels = {};
	return window._eventListVirtualModels;
};

function getEventListVirtualScrollCache() {
	if (!window._eventListVirtualScroll)
		window._eventListVirtualScroll = {};
	return window._eventListVirtualScroll;
};

function getEventListGroupTabScrollCache() {
	if (!window._eventListGroupTabScroll)
		window._eventListGroupTabScroll = {};
	return window._eventListGroupTabScroll;
};

function getEventListVirtualResizeObserver() {
	if (typeof ResizeObserver === "undefined")
		return null;
	if (!window._eventListVirtualResizeObserver) {
		window._eventListVirtualResizeObserver = new ResizeObserver(entries => {
			for (const entry of entries)
				if (entry.target.isConnected && entry.target.clientHeight > 0)
					renderEventListVirtualGroup(entry.target, true);
		});
	}
	return window._eventListVirtualResizeObserver;
};

function getEventListScopeKey(eventType, mapId = window.data.mapTargetId) {
	if (eventType === "Common Event")
		return "common";
	if (eventType === "Troop Event")
		return "troop";
	return `map-${parseInt(mapId) || 0}`;
};

function clearEventListVirtualModels(eventType, mapId) {
	const models = getEventListVirtualModels();
	const prefix = `${getEventListScopeKey(eventType, mapId)}|`;
	for (const key of Object.keys(models))
		if (key.startsWith(prefix))
			delete models[key];
};

function registerEventListVirtualModel(eventType, mapId, groupId, eventIds) {
	const key = `${getEventListScopeKey(eventType, mapId)}|${groupId}`;
	getEventListVirtualModels()[key] = {
		key: key,
		eventType: eventType,
		mapId: parseInt(mapId) || 0,
		groupId: groupId,
		allEventIds: eventIds.slice(),
		visibleEventIds: eventIds.slice(),
		searchIndex: new Map()
	};
	return key;
};

function makeGroupedEventList(eventType, eventIds, mapId = window.data.mapTargetId) {
	clearEventListVirtualModels(eventType, mapId);

	const organization = getEventListOrganization(eventType, mapId);
	const validIds = new Set(eventIds);
	const assignedIds = new Set();

	for (const group of organization.groups) {
		group.eventIds = group.eventIds.filter(id => validIds.has(id) && !assignedIds.has(id));
		for (const id of group.eventIds)
			assignedIds.add(id);
	}

	const defaultIds = eventIds.filter(id => !assignedIds.has(id)).sort((a, b) => a - b);
	const groups = [{
		id: EVENT_LIST_DEFAULT_GROUP_ID,
		name: EVENT_LIST_DEFAULT_GROUP_NAME,
		eventIds: defaultIds
	}, ...organization.groups.map(group => ({
		id: group.id,
		name: group.name,
		eventIds: group.eventIds
	}))];

	if (!groups.some(group => group.id === organization.activeGroupId))
		organization.activeGroupId = EVENT_LIST_DEFAULT_GROUP_ID;

	for (const group of groups)
		registerEventListVirtualModel(eventType, mapId, group.id, group.eventIds);

	const activeGroup = groups.find(group => group.id === organization.activeGroupId) || groups[0];
	return `
		<div class="event-list-tab-layout" data-eventType="${eventType}" data-mapId="${parseInt(mapId) || 0}">
			<div class="event-list-group-tabs" role="tablist" onwheel="event.preventDefault(); event.deltaY > 0 ? this.scrollLeft += 100 : this.scrollLeft -= 100;">
				${groups.map(group => makeEventListGroupTabHTML(eventType, mapId, group, group.id === activeGroup.id)).join("")}
			</div>
			${makeEventListVirtualGroupHTML({
				eventType: eventType,
				mapId: mapId,
				groupId: activeGroup.id,
				name: activeGroup.name
			})}
		</div>
	`;
};

function makeEventListGroupTabHTML(eventType, mapId, group, active) {
	const movable = group.id !== EVENT_LIST_DEFAULT_GROUP_ID;
	return `
		<button type="button"
			class="event-list-group-tab ${active ? 'active' : ''}"
			role="tab"
			aria-selected="${active ? 'true' : 'false'}"
			draggable="${movable ? 'true' : 'false'}"
			data-eventType="${eventType}"
			data-mapId="${parseInt(mapId) || 0}"
			data-groupId="${group.id}"
			data-modelKey="${getEventListScopeKey(eventType, mapId)}|${group.id}"
			onclick="openEventListGroupTab(event, this);"
			oncontextmenu="showEventListGroupContextMenu(event, this); return false;"
			ondragstart="onEventListGroupTabDragStart(event, this);"
			ondragend="onEventListGroupTabDragEnd(event, this);"
			ondragover="onEventListTabDragOver(event, this);"
			ondragleave="onEventListTabDragLeave(event, this);"
			ondrop="onEventListTabDrop(event, this);"
		>
			<span class="event-list-group-tab-name">${$.Drag.VisualEvent.escapeHTML(group.name)}</span>
			<span class="event-list-group-count" data-total="${group.eventIds.length}">${group.eventIds.length}</span>
		</button>
	`;
};

function makeEventListVirtualGroupHTML(params) {
	const mapId = parseInt(params.mapId) || 0;
	const modelKey = `${getEventListScopeKey(params.eventType, mapId)}|${params.groupId}`;
	return `
		<div class="event-list-active-group"
			data-eventType="${params.eventType}"
			data-mapId="${mapId}"
			data-groupId="${params.groupId}"
			data-manualOrder="${params.groupId !== EVENT_LIST_DEFAULT_GROUP_ID ? 'true' : 'false'}"
			ondragover="onEventListGroupDragOver(event, this);"
			ondragleave="onEventListGroupDragLeave(event, this);"
			ondrop="onEventListGroupDrop(event, this);"
		>
			<div class="event-list-group-content event-list-virtual-viewport"
				data-modelKey="${modelKey}"
				onscroll="onEventListVirtualScroll(this);"
			>
				<div class="event-list-virtual-spacer"></div>
				<div class="event-list-virtual-items"></div>
			</div>
		</div>
	`;
};

function getEventListFolderSVG() {
	return `
		<svg width="14px" height="14px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path fill-rule="evenodd" clip-rule="evenodd" d="M1 5C1 3.34315 2.34315 2 4 2H8.55848C9.84977 2 10.9962 2.82629 11.4045 4.05132L11.7208 5H20C21.1046 5 22 5.89543 22 7V9.00961C23.1475 9.12163 23.9808 10.196 23.7695 11.3578L22.1332 20.3578C21.9603 21.3087 21.132 22 20.1654 22H3C1.89543 22 1 21.1046 1 20V5ZM20 9V7H11.7208C10.8599 7 10.0956 6.44914 9.82339 5.63246L9.50716 4.68377C9.37105 4.27543 8.98891 4 8.55848 4H4C3.44772 4 3 4.44772 3 5V12.2709L3.35429 10.588C3.54913 9.66249 4.36562 9 5.31139 9H20ZM3.36634 20C3.41777 19.9109 3.4562 19.8122 3.47855 19.706L5.31139 11L21 11H21.8018L20.1654 20L3.36634 20Z"></path>
		</svg>
	`;
};

function initializeEventListVirtualGroups(list) {
	if (!list)
		return;

	list.classList.add('event-list-tabbed');
	for (const viewport of list.querySelectorAll('.event-list-virtual-viewport')) {
		const model = getEventListVirtualModels()[viewport.getAttribute('data-modelKey')];
		if (!model)
			continue;

		updateEventListVirtualViewportHeight(viewport, model);
		const rowHeight = getEventListVirtualRowHeight(viewport);
		viewport.querySelector('.event-list-virtual-spacer').style.height = `${model.visibleEventIds.length * rowHeight}px`;
		const savedScroll = getEventListVirtualScrollCache()[model.key];
		if (savedScroll !== undefined)
			viewport.scrollTop = savedScroll;

		const selectedId = getSelectedEventIdForVirtualModel(model);
		const selectedIndex = model.visibleEventIds.indexOf(selectedId);
		if (selectedIndex >= 0 && savedScroll === undefined) {
			viewport.scrollTop = Math.max(0, (selectedIndex - 2) * rowHeight);
		}

		renderEventListVirtualGroup(viewport, true);
		const resizeObserver = getEventListVirtualResizeObserver();
		if (resizeObserver)
			resizeObserver.observe(viewport);
	}
};

function getSelectedEventIdForVirtualModel(model) {
	if (window.data.targetType !== model.eventType)
		return 0;
	if (model.eventType === "Map Event" && window.data.mapTargetId !== model.mapId)
		return 0;
	return parseInt(window.data.targetId) || 0;
};

function getEventListVirtualRowHeight(viewport) {
	const fontSize = parseFloat(getComputedStyle(viewport).fontSize) || 16;
	return fontSize * EVENT_LIST_VIRTUAL_ROW_EM;
};

function updateEventListVirtualViewportHeight(viewport, model) {
	viewport.style.height = "";
};

function onEventListVirtualScroll(viewport) {
	if (!viewport)
		return;

	const model = getEventListVirtualModels()[viewport.getAttribute('data-modelKey')];
	if (model)
		getEventListVirtualScrollCache()[model.key] = viewport.scrollTop;

	if (viewport._eventListRenderRequest)
		return;

	viewport._eventListRenderRequest = requestAnimationFrame(() => {
		viewport._eventListRenderRequest = null;
		renderEventListVirtualGroup(viewport);
	});
};

function renderEventListVirtualGroup(viewport, force = false) {
	if (!viewport)
		return;

	const model = getEventListVirtualModels()[viewport.getAttribute('data-modelKey')];
	if (!model)
		return;

	const eventIds = model.visibleEventIds;
	const rowHeight = getEventListVirtualRowHeight(viewport);
	const visibleRows = Math.max(Math.ceil(viewport.clientHeight / rowHeight), 1);
	const start = Math.max(Math.floor(viewport.scrollTop / rowHeight) - EVENT_LIST_VIRTUAL_OVERSCAN, 0);
	const end = Math.min(start + visibleRows + EVENT_LIST_VIRTUAL_OVERSCAN * 2, eventIds.length);

	if (!force && viewport._virtualStart === start && viewport._virtualEnd === end)
		return;

	viewport._virtualStart = start;
	viewport._virtualEnd = end;
	const spacer = viewport.querySelector('.event-list-virtual-spacer');
	const items = viewport.querySelector('.event-list-virtual-items');
	spacer.style.height = `${eventIds.length * rowHeight}px`;
	items.style.transform = `translateY(${start * rowHeight}px)`;

	if (eventIds.length === 0) {
		items.style.transform = "";
		items.innerHTML = `<div class="event-list-group-empty">${viewport.getAttribute('data-searchActive') === "true" ? "No matching events" : "No events"}</div>`;
	} else {
		items.innerHTML = eventIds.slice(start, end)
			.map(eventId => makeEventListEntryHTML(model.eventType, model.mapId, eventId))
			.join("");
	}
};

function captureEventListVirtualScrolls(list) {
	if (!list)
		return;
	for (const viewport of list.querySelectorAll('.event-list-virtual-viewport')) {
		const modelKey = viewport.getAttribute('data-modelKey');
		if (modelKey)
			getEventListVirtualScrollCache()[modelKey] = viewport.scrollTop;
	}
};

function captureEventListGroupTabScroll(list, eventType) {
	const tabs = list ? list.querySelector('.event-list-group-tabs') : null;
	const layout = list ? list.querySelector('.event-list-tab-layout') : null;
	if (!tabs || !layout)
		return;
	const mapId = parseInt(layout.getAttribute('data-mapId')) || 0;
	getEventListGroupTabScrollCache()[getEventListScopeKey(eventType, mapId)] = tabs.scrollLeft;
};

function restoreEventListGroupTabScroll(list, eventType) {
	const tabs = list ? list.querySelector('.event-list-group-tabs') : null;
	const layout = list ? list.querySelector('.event-list-tab-layout') : null;
	if (!tabs || !layout)
		return;
	const mapId = parseInt(layout.getAttribute('data-mapId')) || 0;
	const scrollLeft = getEventListGroupTabScrollCache()[getEventListScopeKey(eventType, mapId)];
	if (scrollLeft !== undefined)
		tabs.scrollLeft = scrollLeft;
};

function replaceEventListContent(list, eventType, html) {
	if (!list)
		return;

	captureEventListVirtualScrolls(list);
	captureEventListGroupTabScroll(list, eventType);
	const resizeObserver = getEventListVirtualResizeObserver();
	if (resizeObserver)
		for (const viewport of list.querySelectorAll('.event-list-virtual-viewport'))
			resizeObserver.unobserve(viewport);
	list.classList.add('event-list-tabbed');
	list.innerHTML = html;
	initializeEventListVirtualGroups(list);
	restoreEventListGroupTabScroll(list, eventType);
	reapplyEventListSearch(eventType);
};

//-------------------------------------------------------------------------------------------------------
// EVENT DATA ACCESS AND ROW CREATION

function getEventListRootCache(eventType, mapId, eventId) {
	if (!window._cache.graph[eventType])
		return null;

	const key = getPartialEventKey(eventType, eventType === "Map Event" ? mapId : 0, eventId, null);
	return window._cache.graph[eventType][key] || null;
};

function getEventListEntryData(eventType, mapId, eventId) {
	const rootCache = getEventListRootCache(eventType, mapId, eventId);
	const cachedData = rootCache && rootCache.data ? rootCache.data : null;

	if (eventType === "Common Event") {
		const data = cachedData || window.data.$dataCommonEvents[eventId];
		return {exists: true, deleted: false, name: data ? data.name || "" : ""};
	}

	if (eventType === "Troop Event") {
		const data = cachedData || window.data.$dataTroops[eventId];
		return {exists: true, deleted: false, name: data ? data.name || "" : ""};
	}

	const deleted = !!(rootCache && rootCache.deleted);
	const data = cachedData || (window.data.loadedMap && window.data.loadedMap.events ? window.data.loadedMap.events[eventId] : null);
	return {
		exists: deleted || !!data || !!rootCache,
		deleted: deleted,
		name: data ? data.name || "" : ""
	};
};

function getAllCommonEventIds() {
	const count = getCommonEventCount();
	return Array.from({length: count}, (_, index) => index + 1);
};

function getAllTroopEventIds() {
	const count = getTroopEventCount();
	return Array.from({length: count}, (_, index) => index + 1);
};

function getAllMapEventIds(data = window.data.loadedMap, mapId = window.data.mapTargetId) {
	if (!data || !Array.isArray(data.events))
		return [];

	const ids = new Set();
	for (const event of data.events)
		if (event && event.id > 0)
			ids.add(event.id);

	for (const key of getMatchingEventKeys("Map Event", mapId, null, null)) {
		const match = key.match(/_t(\d+)_/);
		if (match)
			ids.add(parseInt(match[1]));
	}

	return Array.from(ids).filter(id => id > 0).sort((a, b) => a - b);
};

function getEventListEntryDragAttributes() {
	return `
		draggable="true"
		ondragstart="onEventListEntryDragStart(event, this);"
		ondragend="onEventListEntryDragEnd(event, this);"
		ondragover="onEventListEntryDragOver(event, this);"
		ondragleave="onEventListEntryDragLeave(event, this);"
		ondrop="onEventListEntryDrop(event, this);"
	`;
};

function getEventListDisplayName(name) {
	const value = String(name || "");
	return value ? $.Drag.VisualEvent.escapeHTML(value) : '<span class="unnamed">No name</span>';
};

function makeEventListEntryHTML(eventType, mapId, eventId) {
	const data = getEventListEntryData(eventType, mapId, eventId);
	if (data.deleted) {
		return `
			<div class="event-list-entry selectable" data-eventId="${eventId}" data-eventType="${eventType}" data-unsaved="true">
				<span class="red">DELETED</span>
			</div>
		`;
	}

	const selected = eventId === window.data.targetId && eventType === window.data.targetType &&
		(eventType !== "Map Event" || mapId === window.data.mapTargetId);
	const unsaved = isUnsaved(eventType, eventId, eventType === "Map Event" ? mapId : 0);
	const digits = eventType === "Map Event" ? 3 : 4;

	return `
		<div class="event-list-entry ${selected ? 'selected' : ''} selectable"
			data-eventId="${eventId}" data-eventType="${eventType}" ${unsaved ? 'data-unsaved="true"' : ''}
			onclick="selectEvent(this);" ${getEventListEntryDragAttributes()}
		>
			<span class="event-id">${String(eventId).padStart(digits, "0")}</span>
			<span class="event-name">${getEventListDisplayName(data.name)}</span>
		</div>
	`;
};

function getEventListSearchText(model, eventId) {
	if (model.searchIndex.has(eventId))
		return model.searchIndex.get(eventId);

	const data = getEventListEntryData(model.eventType, model.mapId, eventId);
	const digits = model.eventType === "Map Event" ? 3 : 4;
	const text = `${String(eventId).padStart(digits, "0")} ${data.deleted ? "deleted" : data.name}`.toLowerCase();
	model.searchIndex.set(eventId, text);
	return text;
};

function invalidateEventListVirtualSearchIndex(eventType, mapId, eventId) {
	const prefix = `${getEventListScopeKey(eventType, mapId)}|`;
	for (const [key, model] of Object.entries(getEventListVirtualModels()))
		if (key.startsWith(prefix))
			model.searchIndex.delete(eventId);
};

//-------------------------------------------------------------------------------------------------------
// GROUP TABS AND CONTEXT MENU

function openEventListGroupTab(event, tab) {
	if (event) {
		event.preventDefault();
		event.stopPropagation();
	}
	if (window._eventListGroupDragEndedAt &&
		performance.now() - window._eventListGroupDragEndedAt < 150)
		return;
	if (!tab || tab.classList.contains('active'))
		return;

	const eventType = tab.getAttribute('data-eventType');
	const mapId = parseInt(tab.getAttribute('data-mapId')) || 0;
	const groupId = tab.getAttribute('data-groupId');
	const organization = getEventListOrganization(eventType, mapId);
	if (groupId !== EVENT_LIST_DEFAULT_GROUP_ID && !getEventListGroupById(organization, groupId))
		return;

	organization.activeGroupId = groupId;
	hideEventListGroupContextMenu();
	refreshCurrentEventListPage(eventType, mapId);
};

function makeEventListGroupListeners() {
	if (!window._eventListGroupListenersReady) {
		window._eventListGroupListenersReady = true;
		document.addEventListener('mousedown', event => {
			const menu = document.querySelector('#event-list-group-contextmenu');
			if (menu && !menu.classList.contains('hidden') && !menu.contains(event.target))
				hideEventListGroupContextMenu();
		});
		document.addEventListener('keydown', event => {
			if (event.key === "Escape")
				hideEventListGroupContextMenu();
		});
		window.addEventListener('blur', hideEventListGroupContextMenu);
	}
};

function showEventListGroupContextMenu(event, tab) {
	if (!event || !tab)
		return;

	event.preventDefault();
	event.stopPropagation();
	const menu = document.querySelector('#event-list-group-contextmenu');
	if (!menu)
		return;

	const eventType = tab.getAttribute('data-eventType');
	const mapId = parseInt(tab.getAttribute('data-mapId')) || 0;
	const groupId = tab.getAttribute('data-groupId');
	const isDefault = groupId === EVENT_LIST_DEFAULT_GROUP_ID;
	const group = getEventListGroupById(getEventListOrganization(eventType, mapId), groupId);
	const groupName = isDefault ? EVENT_LIST_DEFAULT_GROUP_NAME : group ? group.name : "";

	menu.setAttribute('data-eventType', eventType);
	menu.setAttribute('data-mapId', mapId);
	menu.setAttribute('data-groupId', groupId);
	menu.querySelector('#event-list-group-contextmenu-title').textContent = `${groupName} Group`;
	menu.querySelector('#event-list-group-rename').classList.toggle('disabled', isDefault);
	menu.querySelector('#event-list-group-delete').classList.toggle('disabled', isDefault);
	menu.classList.remove('hidden');

	const rect = menu.getBoundingClientRect();
	menu.style.left = `${Math.max(0, Math.min(event.clientX, window.innerWidth - rect.width))}px`;
	menu.style.top = `${Math.max(0, Math.min(event.clientY, window.innerHeight - rect.height))}px`;
};

function hideEventListGroupContextMenu() {
	const menu = document.querySelector('#event-list-group-contextmenu');
	if (menu)
		menu.classList.add('hidden');
};

function getEventListGroupContext() {
	const menu = document.querySelector('#event-list-group-contextmenu');
	if (!menu)
		return null;
	return {
		eventType: menu.getAttribute('data-eventType'),
		mapId: parseInt(menu.getAttribute('data-mapId')) || 0,
		groupId: menu.getAttribute('data-groupId')
	};
};

function createEventListGroup() {
	const context = getEventListGroupContext();
	if (!context)
		return;

	const organization = getEventListOrganization(context.eventType, context.mapId);
	const name = normalizeEventListGroupName(prompt("Enter the new group name:", ""));
	if (!name)
		return;
	if (!isEventListGroupNameAvailable(organization, name)) {
		alert(`A group named "${name}" already exists, or the name is reserved.`);
		return;
	}

	const groupId = createEventListGroupId(organization);
	organization.groups.push({
		id: groupId,
		name: name,
		collapsed: false,
		eventIds: []
	});
	organization.activeGroupId = groupId;
	hideEventListGroupContextMenu();
	refreshCurrentEventListPage(context.eventType, context.mapId);
};

function renameEventListGroup() {
	const context = getEventListGroupContext();
	if (!context || context.groupId === EVENT_LIST_DEFAULT_GROUP_ID)
		return;

	const organization = getEventListOrganization(context.eventType, context.mapId);
	const group = getEventListGroupById(organization, context.groupId);
	if (!group)
		return;

	const name = normalizeEventListGroupName(prompt("Enter the new group name:", group.name));
	if (!name || name === group.name)
		return;
	if (!isEventListGroupNameAvailable(organization, name, group.id)) {
		alert(`A group named "${name}" already exists, or the name is reserved.`);
		return;
	}

	group.name = name;
	hideEventListGroupContextMenu();
	refreshCurrentEventListPage(context.eventType, context.mapId);
};

function deleteEventListGroup() {
	const context = getEventListGroupContext();
	if (!context || context.groupId === EVENT_LIST_DEFAULT_GROUP_ID)
		return;

	const organization = getEventListOrganization(context.eventType, context.mapId);
	const group = getEventListGroupById(organization, context.groupId);
	if (!group)
		return;
	if (!confirm(`Delete group "${group.name}"?\n\nIts events will return to the ${EVENT_LIST_DEFAULT_GROUP_NAME} group.`))
		return;

	organization.groups = organization.groups.filter(candidate => candidate.id !== group.id);
	if (organization.activeGroupId === group.id)
		organization.activeGroupId = EVENT_LIST_DEFAULT_GROUP_ID;
	hideEventListGroupContextMenu();
	refreshCurrentEventListPage(context.eventType, context.mapId);
};

//-------------------------------------------------------------------------------------------------------
// EVENT AND GROUP DRAG AND DROP

function onEventListGroupTabDragStart(event, tab) {
	const eventType = tab ? tab.getAttribute('data-eventType') : "";
	const mapId = tab ? parseInt(tab.getAttribute('data-mapId')) || 0 : 0;
	const groupId = tab ? tab.getAttribute('data-groupId') : "";
	if (!eventType || !groupId || groupId === EVENT_LIST_DEFAULT_GROUP_ID) {
		event.preventDefault();
		return;
	}

	window._draggedEventListEntry = null;
	window._draggedEventListGroup = {
		eventType: eventType,
		mapId: mapId,
		groupId: groupId
	};
	tab.classList.add('event-list-group-tab-dragging');
	tab.setAttribute('aria-grabbed', "true");
	event.dataTransfer.effectAllowed = 'move';
	event.dataTransfer.setData('text/plain', `event-list-group:${eventType}:${mapId}:${groupId}`);
};

function onEventListGroupTabDragEnd(event, tab) {
	if (tab) {
		tab.classList.remove('event-list-group-tab-dragging');
		tab.removeAttribute('aria-grabbed');
	}
	clearEventListDragIndicators();
	window._draggedEventListGroup = null;
	window._eventListGroupDragEndedAt = performance.now();
};

function onEventListEntryDragStart(event, element) {
	const eventId = parseInt(element.getAttribute('data-eventId'));
	const eventType = element.getAttribute('data-eventType');
	const groupElement = element.closest('.event-list-active-group');
	if (!eventId || !eventType || !groupElement) {
		event.preventDefault();
		return;
	}

	window._draggedEventListGroup = null;
	window._draggedEventListEntry = {
		eventType: eventType,
		mapId: parseInt(groupElement.getAttribute('data-mapId')) || 0,
		eventId: eventId,
		sourceGroupId: groupElement.getAttribute('data-groupId')
	};
	element.classList.add('event-list-dragging');
	event.dataTransfer.effectAllowed = 'move';
	event.dataTransfer.setData('text/plain', `${eventType}:${window._draggedEventListEntry.mapId}:${eventId}`);
};

function onEventListEntryDragEnd(event, element) {
	if (element)
		element.classList.remove('event-list-dragging');
	clearEventListDragIndicators();
	window._draggedEventListEntry = null;
};

function isEventListDropCompatible(groupElement) {
	const dragged = window._draggedEventListEntry;
	if (!dragged || !groupElement)
		return false;
	const targetType = groupElement.getAttribute('data-eventType');
	const targetMapId = parseInt(groupElement.getAttribute('data-mapId')) || 0;
	return dragged.eventType === targetType && (targetType !== "Map Event" || dragged.mapId === targetMapId);
};

function canManuallyOrderEventListGroup(groupElement) {
	return !!groupElement &&
		groupElement.getAttribute('data-groupId') !== EVENT_LIST_DEFAULT_GROUP_ID;
};

function autoScrollEventListVirtualViewport(event, element) {
	const viewport = element ? element.closest('.event-list-virtual-viewport') ||
		element.querySelector('.event-list-virtual-viewport') : null;
	if (!viewport || viewport.scrollHeight <= viewport.clientHeight)
		return;

	const rect = viewport.getBoundingClientRect();
	const edge = Math.min(56, Math.max(28, rect.height * 0.18));
	const rowHeight = getEventListVirtualRowHeight(viewport);
	let delta = 0;
	if (event.clientY < rect.top + edge)
		delta = -rowHeight * Math.min((rect.top + edge - event.clientY) / edge, 1);
	else if (event.clientY > rect.bottom - edge)
		delta = rowHeight * Math.min((event.clientY - (rect.bottom - edge)) / edge, 1);

	if (delta)
		viewport.scrollTop += delta;
};

function isEventListGroupTabDropCompatible(tab) {
	const dragged = window._draggedEventListGroup;
	if (!dragged || !tab)
		return false;

	const targetType = tab.getAttribute('data-eventType');
	const targetMapId = parseInt(tab.getAttribute('data-mapId')) || 0;
	const targetGroupId = tab.getAttribute('data-groupId');
	return dragged.groupId !== targetGroupId &&
		dragged.eventType === targetType &&
		(targetType !== "Map Event" || dragged.mapId === targetMapId);
};

function getEventListGroupTabDropPlacement(event, tab) {
	if (tab.getAttribute('data-groupId') === EVENT_LIST_DEFAULT_GROUP_ID)
		return "after";
	const rect = tab.getBoundingClientRect();
	return event.clientX < rect.left + rect.width / 2 ? "before" : "after";
};

function autoScrollEventListGroupTabs(event, tab) {
	const tabs = tab ? tab.closest('.event-list-group-tabs') : null;
	if (!tabs)
		return;

	const rect = tabs.getBoundingClientRect();
	const edge = Math.min(48, rect.width / 4);
	if (event.clientX < rect.left + edge)
		tabs.scrollLeft -= 20;
	else if (event.clientX > rect.right - edge)
		tabs.scrollLeft += 20;
};

function onEventListTabDragOver(event, tab) {
	if (window._draggedEventListGroup) {
		if (!isEventListGroupTabDropCompatible(tab))
			return;

		event.preventDefault();
		event.stopPropagation();
		clearEventListGroupTabDropIndicators();
		autoScrollEventListGroupTabs(event, tab);
		const placement = getEventListGroupTabDropPlacement(event, tab);
		tab.classList.add(`event-list-group-tab-drop-${placement}`);
		event.dataTransfer.dropEffect = 'move';
		return;
	}

	if (!isEventListDropCompatible(tab) ||
		window._draggedEventListEntry.sourceGroupId === tab.getAttribute('data-groupId'))
		return;

	event.preventDefault();
	event.stopPropagation();
	clearEventListTabDropIndicators();
	autoScrollEventListGroupTabs(event, tab);
	tab.classList.add('event-list-tab-drag-over');
	event.dataTransfer.dropEffect = 'move';
};

function onEventListTabDragLeave(event, tab) {
	if (event.relatedTarget && tab.contains(event.relatedTarget))
		return;
	tab.classList.remove('event-list-tab-drag-over');
	tab.classList.remove('event-list-group-tab-drop-before');
	tab.classList.remove('event-list-group-tab-drop-after');
};

function onEventListTabDrop(event, tab) {
	if (window._draggedEventListGroup) {
		if (!isEventListGroupTabDropCompatible(tab))
			return;

		event.preventDefault();
		event.stopPropagation();
		const dragged = window._draggedEventListGroup;
		const targetGroupId = tab.getAttribute('data-groupId');
		const placement = tab.classList.contains('event-list-group-tab-drop-before') ?
			"before" : getEventListGroupTabDropPlacement(event, tab);
		moveEventListGroup(dragged.eventType, dragged.mapId, dragged.groupId, targetGroupId, placement);
		clearEventListDragIndicators();
		window._draggedEventListGroup = null;
		window._eventListGroupDragEndedAt = performance.now();
		return;
	}

	if (!isEventListDropCompatible(tab))
		return;

	event.preventDefault();
	event.stopPropagation();
	const dragged = window._draggedEventListEntry;
	const targetGroupId = tab.getAttribute('data-groupId');
	if (dragged.sourceGroupId !== targetGroupId)
		moveEventListEntry(dragged.eventType, dragged.mapId, dragged.eventId, targetGroupId);

	clearEventListDragIndicators();
	window._draggedEventListEntry = null;
};

function onEventListGroupDragOver(event, groupElement) {
	if (!isEventListDropCompatible(groupElement) ||
		!canManuallyOrderEventListGroup(groupElement))
		return;
	event.preventDefault();
	autoScrollEventListVirtualViewport(event, groupElement);
	groupElement.classList.add('event-list-drag-over');
	event.dataTransfer.dropEffect = 'move';
};

function onEventListGroupDragLeave(event, groupElement) {
	if (!groupElement || (event.relatedTarget && groupElement.contains(event.relatedTarget)))
		return;
	groupElement.classList.remove('event-list-drag-over');
};

function onEventListGroupDrop(event, groupElement) {
	if (!isEventListDropCompatible(groupElement) ||
		!canManuallyOrderEventListGroup(groupElement))
		return;
	event.preventDefault();
	event.stopPropagation();

	const dragged = window._draggedEventListEntry;
	moveEventListEntry(dragged.eventType, dragged.mapId, dragged.eventId, groupElement.getAttribute('data-groupId'));
	clearEventListDragIndicators();
	window._draggedEventListEntry = null;
};

function onEventListEntryDragOver(event, element) {
	const groupElement = element.closest('.event-list-active-group');
	if (!isEventListDropCompatible(groupElement) ||
		!canManuallyOrderEventListGroup(groupElement))
		return;

	event.preventDefault();
	event.stopPropagation();
	clearEventListEntryDropIndicators();
	autoScrollEventListVirtualViewport(event, element);
	const rect = element.getBoundingClientRect();
	element.classList.add(event.clientY < rect.top + rect.height / 2 ? 'event-list-drop-before' : 'event-list-drop-after');
	event.dataTransfer.dropEffect = 'move';
};

function onEventListEntryDragLeave(event, element) {
	if (event.relatedTarget && element.contains(event.relatedTarget))
		return;
	element.classList.remove('event-list-drop-before');
	element.classList.remove('event-list-drop-after');
};

function onEventListEntryDrop(event, element) {
	const groupElement = element.closest('.event-list-active-group');
	if (!isEventListDropCompatible(groupElement) ||
		!canManuallyOrderEventListGroup(groupElement))
		return;

	event.preventDefault();
	event.stopPropagation();
	const dragged = window._draggedEventListEntry;
	const targetId = parseInt(element.getAttribute('data-eventId'));
	const placement = element.classList.contains('event-list-drop-after') ? "after" : "before";
	if (dragged.eventId !== targetId)
		moveEventListEntry(dragged.eventType, dragged.mapId, dragged.eventId, groupElement.getAttribute('data-groupId'), targetId, placement);

	clearEventListDragIndicators();
	window._draggedEventListEntry = null;
};

function moveEventListEntry(eventType, mapId, eventId, targetGroupId, targetEventId = null, placement = "after") {
	eventId = parseInt(eventId);
	if (!eventId)
		return;

	const organization = getEventListOrganization(eventType, mapId);
	const targetGroup = targetGroupId === EVENT_LIST_DEFAULT_GROUP_ID ?
		null : getEventListGroupById(organization, targetGroupId);
	if (targetGroupId !== EVENT_LIST_DEFAULT_GROUP_ID && !targetGroup)
		return;

	const sourceGroup = organization.groups.find(group => group.eventIds.includes(eventId));
	const sourceGroupId = sourceGroup ? sourceGroup.id : EVENT_LIST_DEFAULT_GROUP_ID;
	if (sourceGroupId === EVENT_LIST_DEFAULT_GROUP_ID &&
		targetGroupId === EVENT_LIST_DEFAULT_GROUP_ID)
		return;

	// Only the visual organization cache is changed. The event data and event ID are never modified.
	for (const group of organization.groups)
		group.eventIds = group.eventIds.filter(id => id !== eventId);

	if (targetGroupId !== EVENT_LIST_DEFAULT_GROUP_ID) {
		let index = targetEventId ? targetGroup.eventIds.indexOf(targetEventId) : -1;
		if (index < 0)
			index = targetGroup.eventIds.length;
		else if (placement === "after")
			index++;
		targetGroup.eventIds.splice(index, 0, eventId);
	}

	refreshCurrentEventListPage(eventType, mapId);
};

function moveEventListGroup(eventType, mapId, groupId, targetGroupId, placement = "after") {
	if (!groupId || groupId === EVENT_LIST_DEFAULT_GROUP_ID || groupId === targetGroupId)
		return;

	const organization = getEventListOrganization(eventType, mapId);
	const sourceIndex = organization.groups.findIndex(group => group.id === groupId);
	if (sourceIndex < 0)
		return;

	if (targetGroupId !== EVENT_LIST_DEFAULT_GROUP_ID &&
		!organization.groups.some(group => group.id === targetGroupId))
		return;

	const [group] = organization.groups.splice(sourceIndex, 1);
	let targetIndex = 0;
	if (targetGroupId !== EVENT_LIST_DEFAULT_GROUP_ID) {
		targetIndex = organization.groups.findIndex(candidate => candidate.id === targetGroupId);
		if (targetIndex < 0) {
			organization.groups.splice(sourceIndex, 0, group);
			return;
		}
		if (placement === "after")
			targetIndex++;
	}

	organization.groups.splice(targetIndex, 0, group);
	refreshCurrentEventListPage(eventType, mapId);
};

function clearEventListEntryDropIndicators() {
	for (const element of document.querySelectorAll('.event-list-drop-before, .event-list-drop-after')) {
		element.classList.remove('event-list-drop-before');
		element.classList.remove('event-list-drop-after');
	}
};

function clearEventListTabDropIndicators() {
	for (const element of document.querySelectorAll('.event-list-tab-drag-over'))
		element.classList.remove('event-list-tab-drag-over');
};

function clearEventListGroupTabDropIndicators() {
	for (const element of document.querySelectorAll('.event-list-group-tab-drop-before, .event-list-group-tab-drop-after')) {
		element.classList.remove('event-list-group-tab-drop-before');
		element.classList.remove('event-list-group-tab-drop-after');
	}
};

function clearEventListDragIndicators() {
	clearEventListEntryDropIndicators();
	clearEventListTabDropIndicators();
	clearEventListGroupTabDropIndicators();
	for (const element of document.querySelectorAll('.event-list-drag-over, .event-list-dragging, .event-list-group-tab-dragging')) {
		element.classList.remove('event-list-drag-over');
		element.classList.remove('event-list-dragging');
		element.classList.remove('event-list-group-tab-dragging');
	}
};

//-------------------------------------------------------------------------------------------------------
// FULL, NON-PAGINATED EVENT LISTS

function makeMapEventList(data = window.data.loadedMap) {
	const list = document.querySelector('#map-event-list');
	if (!list)
		return;

	if (!data) {
		const resizeObserver = getEventListVirtualResizeObserver();
		if (resizeObserver)
			for (const viewport of list.querySelectorAll('.event-list-virtual-viewport'))
				resizeObserver.unobserve(viewport);
		list.innerHTML = "";
		return;
	}

	const mapList = document.querySelector('#mapList');
	if (mapList)
		mapList.value = window.data.mapTargetId;
	replaceEventListContent(list, "Map Event", makeGroupedEventList("Map Event", getAllMapEventIds(data), window.data.mapTargetId));
	restoreEventListScrollFromCache('map-event');
};

function getMapEventCount(data = window.data.loadedMap) {
	if (!data)
		return 0;
	const dataMax = data.events.reduce((maxId, event) => event ? Math.max(event.id, maxId) : maxId, 0);
	return Math.max(dataMax, getCacheMaxEventId("Map Event", window.data.mapTargetId));
};

function refreshMapEventList() {
	makeMapEventList();
};

function getCommonEventCount() {
	return window._cache.graph["Common Event"].ceCount ? window._cache.graph["Common Event"].ceCount : window.data.$dataCommonEvents.length - 1;
};

function getCommonEventList() {
	const start = performance.now();
	const html = makeGroupedEventList("Common Event", getAllCommonEventIds(), 0);
	console.log(`Common event virtual list built in ${performance.now() - start}ms`);
	return html;
};

function refreshCommonEventList() {
	const list = document.querySelector('#common-event-list');
	replaceEventListContent(list, "Common Event", getCommonEventList());
};

function getTroopEventCount() {
	return window._cache.graph["Troop Event"].count ? window._cache.graph["Troop Event"].count : window.data.$dataTroops.length - 1;
};

function getTroopEventList() {
	const start = performance.now();
	const html = makeGroupedEventList("Troop Event", getAllTroopEventIds(), 0);
	console.log(`Troop event virtual list built in ${performance.now() - start}ms`);
	return html;
};

function refreshTroopEventList() {
	const list = document.querySelector('#troop-event-list');
	replaceEventListContent(list, "Troop Event", getTroopEventList());
};

function refreshCurrentEventListPage(eventType, mapId = window.data.mapTargetId) {
	if (eventType === "Common Event")
		refreshCommonEventList();
	else if (eventType === "Troop Event")
		refreshTroopEventList();
	else if (eventType === "Map Event" && (parseInt(mapId) || 0) === (parseInt(window.data.mapTargetId) || 0))
		refreshMapEventList();
};

//-------------------------------------------------------------------------------------------------------
// VIRTUAL SEARCH

function searchEvent(input) {
	if (!input)
		return;

	if (input._eventListSearchTimeout)
		clearTimeout(input._eventListSearchTimeout);

	const delay = input.value.trim() ? 70 : 0;
	input._eventListSearchTimeout = setTimeout(() => {
		input._eventListSearchTimeout = null;
		applyEventListVirtualSearch(input);
	}, delay);
};

function applyEventListVirtualSearch(input) {
	const eventType = input.getAttribute('data-eventType');
	const list = getEventListElement(eventType);
	if (!list)
		return;

	const value = input.value.toLowerCase().trim();
	for (const tab of list.querySelectorAll('.event-list-group-tab')) {
		const model = getEventListVirtualModels()[tab.getAttribute('data-modelKey')];
		if (!model)
			continue;

		model.visibleEventIds = value ? model.allEventIds.filter(eventId => getEventListSearchText(model, eventId).includes(value)) : model.allEventIds.slice();
		const count = tab.querySelector('.event-list-group-count');
		count.textContent = value ? `${model.visibleEventIds.length} / ${model.allEventIds.length}` : `${model.allEventIds.length}`;
	}

	const viewport = list.querySelector('.event-list-virtual-viewport');
	if (!viewport)
		return;
	const activeModel = getEventListVirtualModels()[viewport.getAttribute('data-modelKey')];
	if (!activeModel)
		return;

	viewport.setAttribute('data-searchActive', value ? "true" : "false");
	viewport.scrollTop = 0;
	getEventListVirtualScrollCache()[activeModel.key] = 0;
	updateEventListVirtualViewportHeight(viewport, activeModel);
	viewport._virtualStart = null;
	viewport._virtualEnd = null;
	renderEventListVirtualGroup(viewport, true);
};

function reapplyEventListSearch(eventType) {
	const input = document.querySelector(`#event-container input[data-eventType="${eventType}"]`);
	if (input)
		applyEventListVirtualSearch(input);
};

function getEventListElement(eventType) {
	if (eventType === "Common Event")
		return document.querySelector('#common-event-list');
	if (eventType === "Map Event")
		return document.querySelector('#map-event-list');
	return document.querySelector('#troop-event-list');
};

//-------------------------------------------------------------------------------------------------------
// ORIGINAL EVENT LIST STATE AND SELECTION

function saveEventListScrollInCache(element, type) {
	if (!element)
		return;
	if (!window._cache.editor.eventListScroll)
		window._cache.editor.eventListScroll = {};
	window._cache.editor.eventListScroll[type] = element.scrollTop;
};

function restoreEventListScrollFromCache(type) {
	const cache = window._cache.editor.eventListScroll;
	if (!cache)
		return;

	if (cache.hasOwnProperty('common-event') && (!type || type === 'common-event'))
		document.querySelector('#common-event-list').scrollTop = cache['common-event'];
	if (cache.hasOwnProperty('map-event') && (!type || type === 'map-event'))
		document.querySelector('#map-event-list').scrollTop = cache['map-event'];
	if (cache.hasOwnProperty('troop-event') && (!type || type === 'troop-event'))
		document.querySelector('#troop-event-list').scrollTop = cache['troop-event'];
};

function toggleEventList(type) {
	if (!type)
		return;

	const list = document.querySelector(`#${type}-container`);
	const collapsed = list.getAttribute('data-collapsed') !== "true";
	list.setAttribute('data-collapsed', collapsed);

	const eventContainer = document.querySelector('#event-container');
	const expandedCount = parseInt(getComputedStyle(eventContainer).getPropertyValue('--expanded-event-list-count'));
	eventContainer.style.setProperty('--expanded-event-list-count', collapsed ? expandedCount - 1 : expandedCount + 1);

	if (!window._cache.editor.eventListCollapsed)
		window._cache.editor.eventListCollapsed = {};
	window._cache.editor.eventListCollapsed[type] = collapsed;

	if (!collapsed) {
		requestAnimationFrame(() => {
			const viewport = list.querySelector('.event-list-virtual-viewport');
			if (viewport)
				renderEventListVirtualGroup(viewport, true);
		});
	}
};

function updateEventName(name = "", type = window.data.targetType, id = window.data.targetId) {
	invalidateEventListVirtualSearchIndex(type, type === "Map Event" ? window.data.mapTargetId : 0, id);
	const element = document.querySelector(`#event-container div[data-eventType="${type}"][data-eventId="${id}"] .event-name`);
	if (element)
		element.innerHTML = `${name || '<span class="unnamed">No name</span>'}`;
};

function updateCommonEventListName(eventId = 0, name = null) {
	if (!eventId)
		return;
	invalidateEventListVirtualSearchIndex("Common Event", 0, eventId);
	updateVisibleEventListName('#common-event-list', eventId, name === null ?
		(hasItemInEventCache("data", "Common Event", 0, eventId) ? getEventCacheItem("data", "Common Event", 0, eventId).name : window.data.$dataCommonEvents[eventId].name) : name);
};

function updateTroopEventListName(eventId = 0, name = null) {
	if (!eventId)
		return;
	invalidateEventListVirtualSearchIndex("Troop Event", 0, eventId);
	updateVisibleEventListName('#troop-event-list', eventId, name === null ?
		(hasItemInEventCache("data", "Troop Event", 0, eventId) ? getEventCacheItem("data", "Troop Event", 0, eventId).name : window.data.$dataTroops[eventId].name) : name);
};

function updateMapEventListName(eventId = 0, name = null) {
	if (!eventId)
		return;
	invalidateEventListVirtualSearchIndex("Map Event", window.data.mapTargetId, eventId);
	const data = getEventListEntryData("Map Event", window.data.mapTargetId, eventId);
	updateVisibleEventListName('#map-event-list', eventId, data.deleted ? "DELETED" : name === null ? data.name : name);
};

function updateVisibleEventListName(listSelector, eventId, name) {
	const element = document.querySelector(`${listSelector} [data-eventId="${eventId}"] .event-name`);
	if (element)
		element.innerHTML = `${name || '<span class="unnamed">No name</span>'}`;
};

function removeFromMapEventList(eventId) {
	if (!eventId)
		return;
	const element = document.querySelector(`#map-event-list [data-eventId="${eventId}"]`);
	if (element)
		element.remove();
};

function selectEvent(element) {
	if (!element)
		return;

	showLoading();
	setLoadingText("Saving event in cache...");
	requestAnimationFrame(() => {
		requestAnimationFrame(() => {
			ensureLeftPanelSelection(element);
			saveEventInCache();

			const eventId = parseInt(element.getAttribute('data-eventId'));
			const eventType = element.getAttribute('data-eventType');
			const pageId = hasItemInEventCache("lastPage", eventType, window.data.mapTargetId, eventId) ?
				getEventCacheItem("lastPage", eventType, window.data.mapTargetId, eventId) : 0;
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
	const eventId = window.data.targetId;
	if (window.data.targetType === "Common Event")
		return document.querySelector(`#left-panel #common-event-list [data-eventId="${eventId}"]`);
	if (window.data.targetType === "Map Event")
		return document.querySelector(`#left-panel #map-event-list [data-eventId="${eventId}"]`);
	if (window.data.targetType === "Troop Event")
		return document.querySelector(`#left-panel #troop-event-list [data-eventId="${eventId}"]`);
	return null;
};

function isEventSelected(type = window.data.targetType, mapId = window.data.mapTargetId, eventId = window.data.targetId, pageId = window.data.pageId) {
	if (window.data.targetType !== type)
		return false;
	if (type === "Common Event")
		return window.data.targetId === eventId;
	if (type === "Map Event")
		return window.data.mapTargetId === mapId && window.data.targetId === eventId && window.data.pageId === pageId;
	if (type === "Troop Event")
		return window.data.targetId === eventId && window.data.pageId === pageId;
	return false;
};
