function setupTopPanel() {
	const topPanel = document.querySelector('#topPanel');
	switch (window.data.targetType) {
		case "Common Event": {
			const target = hasItemInEventCache("data", window.data.targetType, 0, window.data.targetId) ? 
				getEventCacheItem("data", window.data.targetType, 0, window.data.targetId) 
				: (window.data.$dataCommonEvents[window.data.targetId] || $.Drag.VisualEvent.getDefaultCommonEvent());
			
			const switchParams = $.Drag.VisualEvent.getInputParameters("switchNone");
			switchParams.value = target.switchId || 0;
			switchParams.id = "common-event-switch";
			
			const name = target.name || "";
			const trigger = target.trigger || 0;
			
			topPanel.innerHTML = `
				<div id="event-data-container">
					<div>
						<label for="common-event-name">Name :</label>
						${$.Drag.VisualEvent.getInputField({type: "string", id: "common-event-name", value: name, onchange: "updateEventName(this.value);"})}
					</div>
					<div>
						<label for="common-event-trigger">Trigger :</label>
						${$.Drag.VisualEvent.getInputField({type: "select", options: ["None", "Autorun", "Parallel"], id: "common-event-trigger", value: trigger})}
					</div>
					<div>
						<label for="common-event-switch">Switch :</label>
						${$.Drag.VisualEvent.getInputField(switchParams)}
					</div>
				</div>
			`;
			break;
		} case "Map Event": {
			const target = hasItemInEventCache("data", "Map Event", window.data.mapTargetId, window.data.targetId) ? 
				getEventCacheItem("data", "Map Event", window.data.mapTargetId, window.data.targetId) 
				: (window.data.loadedMap.events[window.data.targetId] || $.Drag.VisualEvent.getDefaultMapEvent());
			if (!target)
				return topPanel.innerHTML = ``;
			
			const name = target.name || "";
			const note = target.note || "";
			
			const locationInput = $.Drag.VisualEvent.getInputParameters('currentMapLocation');
			locationInput.id = "map-event-location";
			locationInput.mapId = window.data.mapTargetId;
			locationInput.value = [target.x, target.y] || [0, 0];
			locationInput.data += ` data-eventId="${window.data.targetId}"`;
			locationInput.onchange = `updateCurrentEventLocation(this);`;
			
			const pageCount = target.pages.length || 1;
			let pages = "";
			for (let i = 0; i < pageCount; i++)
				pages += getEventPageElement(i);
			
			topPanel.innerHTML = `
				<div id="event-data-container">
					<div>
						<label for="map-event-name">Name :</label>
						${$.Drag.VisualEvent.getInputField({type: "string", id: "map-event-name", value: name, onchange: "updateEventName(this.value);"})}
					</div>
					<div id="manage-notetag-container" onclick="openNotetagManager(this.lastElementChild);" onchange="updateEventNote(this);">
						<label for="map-event-notes">Manage note(tag)s :</label>
						${$.Drag.VisualEvent.getInputField({type: "string", id: "map-event-notes", class: "onReadyOnChange", value: note, onchange: "$.Drag.VisualEvent.autoFitInput(this);"})}
					</div>
					<div>
						<label for="map-event-location">Set Location :</label>
						${$.Drag.VisualEvent.getInputField(locationInput)}
					</div>
				</div>
				<div id="event-page-container">
					<div id="event-page-wrapper" onwheel="event.preventDefault(); event.deltaY > 0 ? this.scrollLeft += 100 : this.scrollLeft -= 100;">
						${pages}
						<span id="add-event-page" onclick="addEventPage(this);">+</span>
					</div>
					${getEventPageContextMenu()}
				</div>
			`;
			refreshEventPages();
			break;
		} case "Troop Event":
			const target = hasItemInEventCache("data", "Troop Event", 0, window.data.targetId) ? 
				getEventCacheItem("data", "Troop Event", 0, window.data.targetId) 
				: (window.data.$dataTroops[window.data.targetId] || $.Drag.VisualEvent.getDefaultTroopEvent());
			if (!target)
				return topPanel.innerHTML = ``;
			
			const name = target.name || "";
			const members = target.members.map(member => window.data.$dataEnemies[member.enemyId].name).join(', ');
			
			const pageCount = target.pages.length || 1;
			let pages = "";
			for (let i = 0; i < pageCount; i++)
				pages += getEventPageElement(i);
			
			topPanel.innerHTML = `
				<div id="event-data-container">
					<div>
						<label for="troop-event-name">Name :</label>
						${$.Drag.VisualEvent.getInputField({type: "string", id: "troop-event-name", value: name, onchange: "updateEventName(this.value);"})}
					</div>
					<div>
						<button onclick="autonameEvent()" style="margin-top: 0.9375em; padding: 0.4375em 1.25em;">Auto-name</button>
					</div>
					<div id="manage-members-container" onclick="openTroopMembersManager(this.lastElementChild);"">
						<label for="troop-event-members">Manage Members :</label>
						${$.Drag.VisualEvent.getInputField({type: "string", id: "troop-event-members", value: members, onchange: "updateEventMembers(this);", onfocus: "this.blur()"})}
					</div>
				</div>
				<div id="event-page-container">
					<div id="event-page-wrapper" onwheel="event.preventDefault(); event.deltaY > 0 ? this.scrollLeft += 100 : this.scrollLeft -= 100;">
						${pages}
						<span id="add-event-page" onclick="addEventPage(this);">+</span>
					</div>
					${getEventPageContextMenu()}
				</div>
			`;
			refreshEventPages();
			break;
	};
};

function openTroopMembersManager(input) {
	if (!window.data.targetId)
		return;
	
	const eventData = $.Drag.VisualEvent.deepCopyJSON(hasItemInEventCache("data", "Troop Event", 0, window.data.targetId) ? getEventCacheItem("data", "Troop Event", 0, window.data.targetId) : window.data.$dataTroops[window.data.targetId]);
	if (eventData)
		$.Drag.VisualEvent.openTroopMembersManager(input, eventData, window.data.$dataEnemies);
};

function updateEventMembers(troopId, members) {
	if (!members || !troopId)
		return;
	
	document.querySelector('#troop-event-members').value = members.map(member => window.data.$dataEnemies[member.enemyId].name).join(', ');
	setAsUnsaved("Troop Event", troopId, 0, null);
	
	const eventData = getEventCacheItem("data", "Troop Event", 0, troopId);
	eventData.members = members;
};

function autonameEvent() {
	const eventData = hasItemInEventCache("data", "Troop Event", 0, window.data.targetId) ? getEventCacheItem("data", "Troop Event", 0, window.data.targetId) : window.data.$dataTroops[window.data.targetId];
	const nameInput = document.querySelector('#troop-event-name');
	
	let name = "";
	if (eventData.members)
		name = Object.entries(eventData.members.map(member => window.data.$dataEnemies[member.enemyId].name).sort().reduce((nameCount, val) => { 
			if (nameCount[val]) 
				nameCount[val]++; 
			else 
				nameCount[val] = 1;
			return {...nameCount}
		}, {})).reduce((string, entry) => {
			if (string)
				string += ", ";
			if (entry[1] > 1)
				string += `${entry[0]}*${entry[1]}`;
			else
				string += `${entry[0]}`;
			return string;
		}, '');
		
	nameInput.value = name;
	nameInput.dispatchEvent(new Event('change', {bubbles: true}));	
};

function openNotetagManager(input) {
	if (window.data && window.data.targetId && window.data.mapTargetId)
		$.Drag.VisualEvent.openNotetagManager(input);
	input.blur();
};

function getEventPageElement(index) {
	return `
		<span id="event-page" class="${index === (window.data.pageId || 0) ? "selected-page" : ""}" 
			data-pageId="${index}" ${isUnsaved(window.data.targetType, window.data.targetId, window.data.mapTargetId, index) ? 'data-unsaved="true"' : ''} onclick="changeEventPage(this);"
		>
			<span>Page ${index + 1}</span>
			<input type="text" placeholder="Enter page name..." value="${getPageNameFromCache(window.data.targetType, window.data.mapTargetId, window.data.targetId, index)}" 
				onchange="cachePageName(this); $.Drag.VisualEvent.autoFitInput(this);" oninput="onchange();"/>
		</span>`;
};

function getEventPageContextMenu() {
	return `
		<div id="event-page-contextmenu" class="contextmenu hidden">
			<p>Event Page Actions</p>
			<p>Clipboard</p>
			<div>
				<span onclick="copyEventPage(this);">Copy Page</span>
				<span id="event-page-contextmenu-paste" onclick="pasteEventPage(this);">Paste Page</span>
			</div>
			<p>Creation</p>
			<div>
				<span onclick="addEventPageBefore(this);">Create Page Before</span>
				<span onclick="addEventPageAfter(this);">Create Page After</span>
				<span id="event-page-contextmenu-pastebefore" onclick="pasteEventPageBefore(this);">Create & Paste Before</span>
				<span id="event-page-contextmenu-pasteafter" onclick="pasteEventPageAfter(this);">Create & Paste After</span>
			</div>
			<p>Deletion</p>
			<div>
				<span onclick="clearEventPage(this);">Clear Page</span>
				<span id="event-page-contextmenu-delete" onclick="deleteEventPage(this);">Delete Page</span>
				<span id="event-page-contextmenu-discard" onclick="discardEventPageChanges(this);">Discard Changes</span>
			</div>
		</div>
	`;
};

function showEventPageContextMenu(event) {
	const eventPageContextMenu = document.querySelector('#event-page-contextmenu');
	if (!eventPageContextMenu)
		return;
	
	const eventPage = event.path.find(element => element.id === "event-page");
	if (!eventPage)
		return;
	
	window._eventPageContextMenuDisplayed = true;
	
	const pageId = parseInt(eventPage.getAttribute('data-pageId'));
	eventPageContextMenu.querySelector('p').innerHTML = `Event Page ${pageId + 1} Actions`;
	eventPageContextMenu.setAttribute('data-pageId', pageId);
	
	const deletePage = eventPageContextMenu.querySelector('#event-page-contextmenu-delete');
	if (document.querySelectorAll('#event-page').length > 1)
		deletePage.classList.remove('disabled');
	else
		deletePage.classList.add('disabled');
	
	const pastePage = eventPageContextMenu.querySelector('#event-page-contextmenu-paste');
	const pastePageAfter = eventPageContextMenu.querySelector('#event-page-contextmenu-pasteafter');
	const pastePageBefore = eventPageContextMenu.querySelector('#event-page-contextmenu-pastebefore');
	if (window._copiedPage) {
		pastePage.classList.remove('disabled');
		pastePageAfter.classList.remove('disabled');
		pastePageBefore.classList.remove('disabled');
	} else {
		pastePage.classList.add('disabled');
		pastePageAfter.classList.add('disabled');
		pastePageBefore.classList.add('disabled');
	}
	
	const eventPageContainerRect = document.querySelector('#event-page-container').getBoundingClientRect();
	eventPageContextMenu.classList.remove('hidden');
	const contextMenuRect = eventPageContextMenu.getBoundingClientRect();
	
	const x = event.x + contextMenuRect.width > eventPageContainerRect.right ? event.x - eventPageContainerRect.left - (event.x + contextMenuRect.width - eventPageContainerRect.right) : event.x - eventPageContainerRect.left;				
	eventPageContextMenu.style.left = `${x}px`;
	eventPageContextMenu.style.top = `${event.y - eventPageContainerRect.top}px`;
};

function hideEventPageContextMenu() {
	const eventPageContextMenu = document.querySelector('#event-page-contextmenu');
	if (eventPageContextMenu)
		eventPageContextMenu.classList.add('hidden');
	
	window._eventPageContextMenuDisplayed = false;
};

function copyEventPage(element) {
	const contextmenu = document.querySelector('#event-page-contextmenu');
	const pageId = parseInt(contextmenu.getAttribute('data-pageId'));
	window._copiedPage = {
		data: $.Drag.VisualEvent.deepCopyJSON(getEventPageData(window.data.targetType, window.data.targetId, pageId, false)),
		nodes: $.Drag.VisualEvent.deepCopyJSON(getEventCacheItem("_nodes", window.data.targetType, window.data.mapTargetId, window.data.targetId, pageId)),
		type: window.data.targetType
	};
	
	hideEventPageContextMenu();
};

function pasteEventPage(element) {
	if (!window._copiedPage || window._copiedPage.type !== window.data.targetType)
		return;
	
	const contextmenu = document.querySelector('#event-page-contextmenu');
	const pageId = parseInt(contextmenu.getAttribute('data-pageId'));
	
	setAsUnsaved(window.data.targetType, window.data.targetId, window.data.mapTargetId, pageId);
	
	const cacheData = getEventCacheItem("data", window.data.targetType, window.data.mapTargetId, window.data.targetId);
	cacheData.pages[pageId] = $.Drag.VisualEvent.deepCopyJSON(window._copiedPage.data);
	saveEventDataInCache(cacheData);
	
	saveItemInEventCache("nodes", $.Drag.VisualEvent.deepCopyJSON(window._copiedPage.nodes), window.data.targetType, window.data.mapTargetId, window.data.targetId, pageId);
	
	hideEventPageContextMenu();
	
	if (pageId === window.data.pageId)
		reloadGraphEditor(window.data.targetId, window.data.targetType, pageId, false);
};

function pasteEventPageBefore(element) {
	if (!window._copiedPage)
		return;
	
	const addedPage = addEventPageBefore(element);
	pasteEventPage(addedPage);
};

function pasteEventPageAfter(element) {
	if (!window._copiedPage)
		return;
	
	const addedPage = addEventPageAfter(element);
	pasteEventPage(addedPage);
};

function addEventPageBefore(element) {
	const contextmenu = document.querySelector('#event-page-contextmenu');
	const index = parseInt(contextmenu.getAttribute('data-pageId'));
	
	hideEventPageContextMenu();
	
	return addPage(index);
};

function addEventPageAfter(element) {
	const contextmenu = document.querySelector('#event-page-contextmenu');
	const index = parseInt(contextmenu.getAttribute('data-pageId'));
	
	hideEventPageContextMenu();
	
	return addPage(index + 1);
};

function addEventPage(element) {
	const index = document.querySelectorAll('#event-page').length;
	changeEventPage(addPage(index));
};

function addPage(index = 0, data = $.Drag.VisualEvent.getDefaultEventPage(window.data.targetType)) {	
	if ((window.data.pageId || 0) >= index)
		window.data.pageId++;
	
	const eventPage = document.querySelector(`#event-page[data-pageId="${index}"]`) || Array.from(document.querySelectorAll(`#event-page`)).pop();
	eventPage.insertAdjacentHTML('beforebegin', getEventPageElement(index));
	
	const eventCacheData = getEventCacheItem("data", window.data.targetType, window.data.mapTargetId, window.data.targetId);
	$.Drag.VisualEvent.insert(eventCacheData.pages, index, data);

	incrementCachePageIds(index);

	setAsUnsaved(window.data.targetType, window.data.targetId, window.data.mapTargetId, index, false);
	setAsUnsaved(window.data.targetType, window.data.targetId, window.data.mapTargetId);
	
	saveItemInEventCache("_resetOnDiscard", true, window.data.targetType, window.data.mapTargetId, window.data.targetId);

	refreshEventPages();
	
	const addedPage = document.querySelector(`#event-page[data-pageId="${index}"]`);				
	return addedPage;
};

function refreshEventPages() {
	for (const [pageId, eventPage] of Array.from(document.querySelectorAll('#event-page')).entries()) {
		eventPage.querySelector('span').innerHTML = `Page ${pageId + 1}`;
		
		const nameInput = eventPage.querySelector('input');
		nameInput.value = getPageNameFromCache(window.data.targetType, window.mapTargetId, window.targetId, pageId); 
		$.Drag.VisualEvent.autoFitInput(nameInput);
		
		eventPage.setAttribute('data-pageId', pageId);
		eventPage.setAttribute('data-unsaved', isUnsaved(window.data.targetType, window.data.targetId, window.data.mapTargetId, pageId));
	}
};

function deleteEventPage(element) {
	const contextmenu = document.querySelector('#event-page-contextmenu');
	const index = parseInt(contextmenu.getAttribute('data-pageId'));
	deletePage(index);
	hideEventPageContextMenu();
};

function deletePage(index = 0) {
	if ((window.data.pageId || 0) < index)
		window.data.pageId--;
	
	const eventPage = document.querySelector(`#event-page[data-pageId="${index}"]`);
	eventPage.remove();
	
	$.Drag.VisualEvent.removeIndex(getEventCacheItem("data", window.data.targetType, window.data.mapTargetId, window.data.targetId).pages, index);
	
	decrementCachePageIds(index + 1);

	setAsUnsaved(window.data.targetType, window.data.targetId, window.data.mapTargetId);
	saveItemInEventCache("_resetOnDiscard", true, window.data.targetType, window.data.mapTargetId, window.data.targetId);
	
	refreshEventPages();
	
	const selectedPage = document.querySelector('#event-page.selected-page');
	if (!selectedPage)
		reloadGraphEditor(window.data.targetId, window.data.targetType, 0);
};

function clearEventPage() {
	const contextmenu = document.querySelector('#event-page-contextmenu');
	const pageId = parseInt(contextmenu.getAttribute('data-pageId'));
	
	setAsUnsaved(window.data.targetType, window.data.targetId, window.data.mapTargetId, pageId);
	
	clearEventNodesCache(window.data.targetType, window.data.mapTargetId, window.data.targetId, pageId);
	
	const cacheData = getEventCacheItem("data", window.data.targetType, window.data.mapTargetId, window.data.targetId);
	const defaultEventPage = $.Drag.VisualEvent.getDefaultEventPage(window.data.targetType);
	cacheData.pages[pageId] = defaultEventPage;
	saveEventDataInCache(cacheData);
	
	hideEventPageContextMenu();
	
	if (pageId === window.data.pageId)
		reloadGraphEditor(window.data.targetId, window.data.targetType, pageId, false);
};

function discardEventPageChanges() {
	const contextmenu = document.querySelector('#event-page-contextmenu');
	const pageId = parseInt(contextmenu.getAttribute('data-pageId'));
	
	setAsSaved(window.data.targetType, window.data.targetId, window.data.mapTargetId, pageId);
	
	let eventPage;
	if (window.data.targetType === "Troop Event")
		if (window.data.$dataTroops[window.data.targetId] && window.data.$dataTroops[window.data.targetId].pages[pageId])
			eventPage = $.Drag.VisualEvent.deepCopyJSON(window.data.$dataTroops[window.data.targetId].pages[pageId]);
		else 
			eventPage = $.Drag.VisualEvent.getDefaultEventPage(window.data.targetType);
	else if (window.data.loadedMap)
		if (window.data.loadedMap.events[window.data.targetId] && window.data.loadedMap.events[window.data.targetId].pages[pageId])
			eventPage = $.Drag.VisualEvent.deepCopyJSON(window.data.loadedMap.events[window.data.targetId].pages[pageId]);
		else 
			eventPage = $.Drag.VisualEvent.getDefaultEventPage(window.data.targetType);

	const cacheData = getEventCacheItem("data", window.data.targetType, window.data.mapTargetId, window.data.targetId);
	cacheData.pages[pageId] = eventPage;
	saveEventDataInCache(cacheData);
	restoreEventNodesFromCache(window.data.targetType,  window.data.mapTargetId, window.data.targetId, pageId);
	
	hideEventPageContextMenu();
	
	if (pageId === (window.data.pageId || 0))
		reloadGraphEditor(window.data.targetId, window.data.targetType, pageId, false);
};

function changeEventPage(element, shouldApply = false) {
	if (!element)
		element = document.querySelector('#event-page');
	
	const topPanel = document.querySelector('#topPanel');
	for (const selected of topPanel.querySelectorAll('.selected-page'))
		selected.classList.remove('selected-page');
	element.classList.add('selected-page');
	
	const eventId = window.data.targetId;
	const eventType = window.data.targetType;
	const pageId = parseInt(element.getAttribute('data-pageId'));
	
	saveItemInEventCache("lastPage", pageId, eventType, window.data.mapTargetId, eventId);
	saveEventInCache();
	
	reloadGraphEditor(eventId, eventType, pageId, false);
	refreshEventPages();
};

function updateCurrentEventLocation(input) {
	if (!input)
		return;
	
	const [x, y] = $.Drag.VisualEvent.getInputValue(input);
	setMapEventLocation(window.data.mapTargetId, window.data.targetId, x, y);
};