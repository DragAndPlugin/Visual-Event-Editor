function toggleSearch() {
	const searchContainer = document.querySelector('#search-container');
	
	if (!searchContainer.hasAttribute('data-ready'))
		prepareSearch();
	
	if (searchContainer.classList.contains('hidden'))
		searchContainer.classList.remove('hidden');
	else
		searchContainer.classList.add('hidden');
	
	searchContainer.querySelector('#search-result').innerHTML = '';
	
	const opened = !searchContainer.classList.contains('hidden');
	window._searchOpened = opened
	window._cache.editor.search.open = opened;
};

function focusSearch(container) {
	if (!container)
		container = document.querySelector('#search-container');
	container.classList.add('focus');
};

function unfocusSearch(container) {
	if (!container)
		container = document.querySelector('#search-container');
	container.classList.remove('focus');
};

function prepareSearch() {
	const searchContainer = document.querySelector('#search-container');
	searchContainer.querySelector('#search-input-wrapper').innerHTML = $.Drag.VisualEvent.getInputField($.Drag.VisualEvent.getInteractiveInputParameters('selectAdvancedSearchItem'));
	$.Drag.VisualEvent.triggerAllOnReadyOnChange(searchContainer);
	
	if (!window._cache.editor.search)
		window._cache.editor.search = {y: 200, x: 500, open: true};
	
	searchContainer.style.top = `${window._cache.editor.search.y}px`;
    searchContainer.style.left = `${window._cache.editor.search.x}px`;
	
	searchContainer.setAttribute('data-ready', 'true');
};

function searchGraph(dir = 0) {
	const searchContainer = document.querySelector('#search-container');
	
	const searchIn = {};
	searchIn[window.data.targetType] = {};
	searchIn[window.data.targetType].ids = [window.data.targetId, window.data.targetId];
	if (window.data.targetType === "Troop Event" || window.data.targetType === "Map Event")
		searchIn[window.data.targetType].pageIds = [window.pageId, window.pageId];
	if (window.data.targetType === "Map Event")
		searchIn[window.data.targetType].mapIds = [window.mapTargetId, window.mapTargetId];
	
	const searchFor = {
		mode: 0,
		items: {types: [], values: []},
	};
	const select = searchContainer.querySelector('#interactive-container select');
	const itemType = select.value;
	
	const itemInput = searchContainer.querySelector('#dependances-container').children[select.selectedIndex].querySelector('*[data-dependance="true"]');
	const itemValue = $.Drag.VisualEvent.getInputValue(itemInput);
	
	searchFor.items.types.push(itemType);
	searchFor.items.values.push(itemValue);
	
	const searchResult = searchReferences(searchIn, searchFor);
	
	if (window.searchRefId === undefined)
		window.searchRefId = 0;
	else
		window.searchRefId += (dir === 0 ? -1 : 1);
	
	if (window.searchRefId > searchResult.count - 1)
		window.searchRefId = 0;
	else if (window.searchRefId < 0)
		window.searchRefId = searchResult.count - 1;
	
	searchContainer.querySelector('#search-result').innerHTML = searchResult.count > 0 ? `${window.searchRefId + 1} / ${searchResult.count} result(s) found.` : `<span class="red">No result found.</span>`;
	
	if (searchResult.count > 0) {
		const nodeId = searchResult[window.data.targetType][0].refs[window.searchRefId].nodeId;
		focusNode(nodeId);
		if (!window._isCtrlPressed)
			unselectAllNodes();
		selectNode(getNodeById(nodeId));
	}
};

function startDragSearch() {
	window._draggingSearch = true;
};

function moveSearch(event) {
	const searchContainer = document.querySelector('#search-container');
	const y = parseInt(searchContainer.style.top) + event.movementY;
	const x = parseInt(searchContainer.style.left) + event.movementX;
	
	searchContainer.style.top = `${y}px`;
	searchContainer.style.left = `${x}px`;
	
	window._cache.editor.search.y = y;
	window._cache.editor.search.x = x;
};